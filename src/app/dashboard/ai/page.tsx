"use client";
// src/app/dashboard/ai/page.tsx

import { useEffect, useState } from "react";
import { MarkdownRenderer } from "@/components/ai/markdown-renderer";

interface Insight {
  id:        string;
  prompt:    string;
  response:  string;
  createdAt: string;
}

const QUICK_PROMPTS = [
  "Analyze my spending and health patterns from the last 30 days",
  "Where am I overspending and how can I cut back?",
  "How is my sleep affecting my mood and spending?",
  "Am I on track with my savings and health goals?",
  "Give me a combined health and finance action plan for next month",
];

export default function AIPage() {
  const [prompt,    setPrompt]    = useState("");
  const [response,  setResponse]  = useState("");
  const [streaming, setStreaming]  = useState(false);
  const [error,     setError]     = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);
  const [history,   setHistory]   = useState<Insight[]>([]);
  const [activeHistory, setActiveHistory] = useState<Insight | null>(null);

  useEffect(() => {
    fetch("/api/ai/history")
      .then(r => r.json())
      .then(d => setHistory(d.insights ?? []));
  }, []);

  async function handleSubmit(e?: React.FormEvent, overridePrompt?: string) {
    e?.preventDefault();
    const finalPrompt = overridePrompt ?? prompt;
    if (!finalPrompt.trim() || streaming) return;

    setStreaming(true);
    setResponse("");
    setError("");
    setActiveHistory(null);

    try {
      const res = await fetch("/api/ai", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ prompt: finalPrompt }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Something went wrong");
        setStreaming(false);
        return;
      }

      // Read remaining from header
      const rem = res.headers.get("X-Remaining");
      if (rem) setRemaining(parseInt(rem));

      // Stream the response
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        full += chunk;
        setResponse(full);
      }

      // Refresh history after streaming completes
      const histRes = await fetch("/api/ai/history");
      const histData = await histRes.json();
      setHistory(histData.insights ?? []);
      setPrompt("");
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setStreaming(false);
    }
  }

  function useQuickPrompt(p: string) {
    setPrompt(p);
    handleSubmit(undefined, p);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Insights ✦</h1>
        <p className="text-gray-500 text-sm mt-1">
          Ask anything about your finances and health — powered by Google Gemini
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main chat area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Quick prompts */}
          {!response && !streaming && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Quick questions</p>
              <div className="space-y-2">
                {QUICK_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => useQuickPrompt(p)}
                    disabled={streaming}
                    className="w-full text-left text-sm text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 px-4 py-2.5 rounded-lg border border-gray-200 hover:border-emerald-300 transition-colors"
                  >
                    ✦ {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Response */}
          {(response || streaming) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">AI</span>
                </div>
                <p className="text-sm font-medium text-gray-700">FinHealth AI</p>
                {streaming && (
                  <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Thinking...
                  </span>
                )}
              </div>
              <MarkdownRenderer content={response} streaming={streaming} />
              {!streaming && (
                <button
                  onClick={() => { setResponse(""); setActiveHistory(null); }}
                  className="mt-4 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ← Ask another question
                </button>
              )}
            </div>
          )}

          {/* Historical insight viewer */}
          {activeHistory && !response && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-600 text-xs font-bold">AI</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Previous insight</p>
                    <p className="text-xs text-gray-400">
                      {new Date(activeHistory.createdAt).toLocaleDateString("en-PK", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveHistory(null)}
                  className="text-gray-400 hover:text-gray-600 text-sm"
                >
                  ×
                </button>
              </div>
              <p className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg mb-4 font-medium">
                Q: {activeHistory.prompt}
              </p>
              <MarkdownRenderer content={activeHistory.response} />
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex gap-3">
              <input
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Ask about your finances, health, or both..."
                disabled={streaming}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={streaming || !prompt.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                {streaming ? "..." : "Ask"}
              </button>
            </div>
            {remaining !== null && (
              <p className="text-xs text-gray-400 mt-2 ml-1">
                {remaining > 100
                  ? "Unlimited queries (Premium)"
                  : `${remaining} free queries remaining this month`}
              </p>
            )}
          </form>
        </div>

        {/* History sidebar */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 h-fit">
          <h2 className="font-semibold text-gray-900 text-sm mb-4">Past insights</h2>
          {history.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">
              Your AI conversation history will appear here
            </p>
          ) : (
            <div className="space-y-2">
              {history.map(h => (
                <button
                  key={h.id}
                  onClick={() => { setActiveHistory(h); setResponse(""); }}
                  className={`w-full text-left p-3 rounded-lg border transition-colors text-xs ${
                    activeHistory?.id === h.id
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <p className="text-gray-800 font-medium line-clamp-2">{h.prompt}</p>
                  <p className="text-gray-400 mt-1">
                    {new Date(h.createdAt).toLocaleDateString("en-PK", {
                      day: "numeric", month: "short",
                    })}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
