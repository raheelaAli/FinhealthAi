// src/app/api/ai/route.ts
// Streams AI insights from Gemini using ReadableStream
// Checks role-based limits: USER = 3/month, PREMIUM/ADMIN = unlimited

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkAiLimit } from "@/lib/auth-helpers";




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

  // ===== Gather last 30 days of user data =====
  const userId = session.user.id;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [transactions, healthLogs, budgets, goals] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId, date: { gte: thirtyDaysAgo } },
      orderBy: { date: "desc" },
      take: 50,
    }),
    prisma.healthLog.findMany({
      where: { userId, date: { gte: thirtyDaysAgo } },
      orderBy: { date: "desc" },
    }),
    prisma.budget.findMany({ where: { userId } }),
    prisma.goal.findMany({ where: { userId } }),
  ]);

  // ===== Calculations =====
  const totalIncome = transactions.filter(t => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);

  const spendByCategory: Record<string, number> = {};
  transactions
    .filter(t => t.type === "EXPENSE")
    .forEach(t => {
      spendByCategory[t.category] = (spendByCategory[t.category] ?? 0) + t.amount;
    });

  const avgSteps = healthLogs.length
    ? healthLogs.reduce((s, l) => s + (l.steps ?? 0), 0) / healthLogs.length
    : 0;
  const avgSleep = healthLogs.length
    ? healthLogs.reduce((s, l) => s + (l.sleepHrs ?? 0), 0) / healthLogs.length
    : 0;
  const avgMood = healthLogs.length
    ? healthLogs.reduce((s, l) => s + (l.mood ?? 0), 0) / healthLogs.length
    : 0;

  const lowSleepDays = healthLogs
    .filter(l => (l.sleepHrs ?? 8) < 6)
    .map(l => l.date.toISOString().slice(0, 10));

  const lowSleepSpend = transactions
    .filter(
      t =>
        t.type === "EXPENSE" &&
        lowSleepDays.includes(new Date(t.date).toISOString().slice(0, 10))
    )
    .reduce((s, t) => s + t.amount, 0);

  // ===== Build context =====
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

USER QUESTION: ${prompt}
`;

  // ===== Call Groq API =====
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant", // free & stable for demos
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: context },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq error:", err);
      return new Response("AI error", { status: 500 });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "No response";

    // ===== Save AI response to DB =====
    await prisma.aiInsight.create({
      data: {
        userId,
        prompt,
        response: text,
        type: "combined",
      },
    });

    // ===== Return to client =====
    return new Response(text, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Remaining": String(remaining - 1),
      },
    });

  } catch (err) {
    console.error("AI error:", err);
    return new Response("Error generating insight", { status: 500 });
  }
}