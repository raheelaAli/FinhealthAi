// src/app/api/ai/route.ts
// Streams AI insights from Gemini using ReadableStream
// Checks role-based limits: USER = 3/month, PREMIUM/ADMIN = unlimited

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkAiLimit } from "@/lib/auth-helpers";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `You are FinHealth AI, a personal finance and health advisor.
Analyze the user's data and provide warm, specific, actionable insights.

Rules:
- Always reference real numbers from the data provided
- Find cross-domain patterns (e.g. sleep affecting spending behavior)
- Use markdown: ## headings, **bold** key points, bullet points
- Be encouraging but honest
- End with exactly 3 numbered recommendations
- Keep response under 450 words
- Write in a friendly, conversational tone`;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  // Check monthly AI usage limit
  const { allowed, remaining } = await checkAiLimit(session.user.id);
  if (!allowed) {
    return new Response(
      JSON.stringify({
        error: "Monthly AI limit reached. Upgrade to Premium for unlimited insights.",
        remaining: 0,
      }),
      { status: 429 }
    );
  }

  const { prompt } = await req.json();
  if (!prompt) {
    return new Response(JSON.stringify({ error: "Prompt is required" }), { status: 400 });
  }

  // Gather user's last 30 days of data for context
  const userId = session.user.id;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [transactions, healthLogs, budgets, goals] = await Promise.all([
    prisma.transaction.findMany({
      where:   { userId, date: { gte: thirtyDaysAgo } },
      orderBy: { date: "desc" },
      take:    50,
    }),
    prisma.healthLog.findMany({
      where:   { userId, date: { gte: thirtyDaysAgo } },
      orderBy: { date: "desc" },
    }),
    prisma.budget.findMany({ where: { userId } }),
    prisma.goal.findMany({ where: { userId } }),
  ]);

  // Build a rich context string for Gemini
  const totalIncome   = transactions.filter(t => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);

  const spendByCategory: Record<string, number> = {};
  transactions
    .filter(t => t.type === "EXPENSE")
    .forEach(t => { spendByCategory[t.category] = (spendByCategory[t.category] ?? 0) + t.amount; });

  const avgSteps    = healthLogs.length ? healthLogs.reduce((s, l) => s + (l.steps ?? 0), 0)    / healthLogs.length : 0;
  const avgSleep    = healthLogs.length ? healthLogs.reduce((s, l) => s + (l.sleepHrs ?? 0), 0) / healthLogs.length : 0;
  const avgMood     = healthLogs.length ? healthLogs.reduce((s, l) => s + (l.mood ?? 0), 0)     / healthLogs.length : 0;

  // Cross-domain correlation: spending on low-sleep days
  const lowSleepDays  = healthLogs.filter(l => (l.sleepHrs ?? 8) < 6).map(l => l.date.toISOString().split("T")[0]);
  const lowSleepSpend = transactions
    .filter(t => t.type === "EXPENSE" && lowSleepDays.includes(new Date(t.date).toISOString().split("T")[0]))
    .reduce((s, t) => s + t.amount, 0);

  const context = `
USER DATA — Last 30 days:

FINANCES:
- Total income: ₨${totalIncome.toLocaleString()}
- Total expenses: ₨${totalExpenses.toLocaleString()}
- Net savings: ₨${(totalIncome - totalExpenses).toLocaleString()}
- Spending by category: ${JSON.stringify(spendByCategory)}
- Budgets: ${JSON.stringify(budgets.map(b => ({ category: b.category, limit: b.limit })))}

HEALTH:
- Days logged: ${healthLogs.length}
- Average daily steps: ${Math.round(avgSteps).toLocaleString()}
- Average sleep: ${avgSleep.toFixed(1)} hours
- Average mood: ${avgMood.toFixed(1)}/5
- Low sleep days (<6hrs): ${lowSleepDays.length} days
- Spending on low-sleep days: ₨${lowSleepSpend.toLocaleString()}

GOALS:
${goals.map(g => `- ${g.title}: ${g.current}/${g.target} ${g.unit} (${g.achieved ? "achieved" : "in progress"})`).join("\n")}

USER QUESTION: ${prompt}`;

  // Stream Gemini response
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  let fullResponse = "";

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const result = await model.generateContentStream(
          `${SYSTEM_PROMPT}\n\n${context}`
        );

        for await (const chunk of result.stream) {
          const text = chunk.text();
          fullResponse += text;
          controller.enqueue(new TextEncoder().encode(text));
        }

        // Save the complete insight to DB after streaming
        await prisma.aiInsight.create({
          data: {
            userId,
            prompt,
            response: fullResponse,
            type:     "combined",
          },
        });

        controller.close();
      } catch (err) {
        console.error("Gemini error:", err);
        controller.enqueue(
          new TextEncoder().encode("\n\n*Error generating insight. Please try again.*")
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type":  "text/plain; charset=utf-8",
      "X-Remaining":   String(remaining - 1),
      "Cache-Control": "no-cache",
    },
  });
}
