// src/lib/gemini.ts
// Wrapper around Google Gemini API (free tier — 1500 req/day)
// Model: gemini-1.5-flash (fastest, most generous free limits)

import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    maxOutputTokens: 1024,
    temperature: 0.7,
  },
});

// System prompt that shapes all AI responses
export const SYSTEM_PROMPT = `You are FinHealth AI, a personal finance and health advisor.
Your role is to analyze the user's financial transactions and health metrics,
then provide clear, actionable, personalized insights.

Guidelines:
- Be warm, encouraging, and specific — not generic
- Always reference actual numbers from the data
- Find cross-domain patterns (e.g. sleep affecting spending)
- Use simple language, short paragraphs
- Format responses with markdown (## headings, **bold**, bullet points)
- End with 2-3 concrete, numbered recommendations
- Keep responses under 400 words`;

// Helper to generate insight with full user context
export async function generateInsight(prompt: string): Promise<string> {
  const result = await geminiModel.generateContent(`${SYSTEM_PROMPT}\n\n${prompt}`);
  return result.response.text();
}

// Streaming version — for real-time typewriter effect in the UI
export async function generateInsightStream(prompt: string) {
  const result = await geminiModel.generateContentStream(
    `${SYSTEM_PROMPT}\n\n${prompt}`
  );
  return result.stream;
}
