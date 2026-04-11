// src/app/contact/page.tsx
// Public Contact Us page — no auth required.
// Submits to POST /api/contact which is wired for real email but currently logs to console.

"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const INITIAL: FormState = { name: "", email: "", subject: "", message: "" };

export default function ContactPage() {
  const [form, setForm]     = useState<FormState>(INITIAL);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res  = await fetch("/api/contact", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error ?? "Something went wrong. Please try again.");
        setStatus("error");
      } else {
        setStatus("success");
        setForm(INITIAL);
      }
    } catch {
      setErrorMsg("Network error. Please check your connection.");
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-4xl mx-auto w-full">
        <Link href="/">
          <Logo size="md" />
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Sign in
          </Link>
          <Link
            href="/auth/register"
            className="bg-emerald-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Get started free
          </Link>
        </div>
      </nav>

      {/* Main */}
      <main className="flex-1 max-w-3xl mx-auto px-8 py-12 w-full">
        <div className="mb-8">
          <Link href="/" className="text-sm text-emerald-600 hover:underline">
            ← Back to home
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Left info panel */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Contact Us</h1>
              <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                Have a question, feedback, or want to report an issue? We&apos;d love to hear from you.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: "✉️", label: "Email", value: "hello@finhealth.app" },
                { icon: "🕐", label: "Response time", value: "Within 24 hours" },
                { icon: "📍", label: "Support", value: "Finance & Health AI" },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">{item.icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{item.label}</p>
                    <p className="text-sm text-gray-700">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-3">
            {status === "success" ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-sm">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✓</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Message sent!</h2>
                <p className="text-gray-500 text-sm mb-6">
                  Thanks for reaching out. We&apos;ll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-5"
              >
                {status === "error" && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
                    <span>⚠️</span> {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={form.name}
                      onChange={set("name")}
                      placeholder="Ali Hassan"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={form.email}
                      onChange={set("email")}
                      placeholder="you@example.com"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <select
                    id="contact-subject"
                    required
                    value={form.subject}
                    onChange={set("subject")}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition bg-white"
                  >
                    <option value="">Select a subject…</option>
                    <option value="General question">General question</option>
                    <option value="Bug report">Bug report</option>
                    <option value="Feature request">Feature request</option>
                    <option value="Account issue">Account issue</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    id="contact-message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={set("message")}
                    placeholder="Tell us how we can help…"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition resize-y"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
                >
                  {status === "loading" ? "Sending…" : "Send message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-auto">
        <div className="max-w-4xl mx-auto px-8 py-6 flex items-center justify-between">
          <Logo size="sm" />
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} FinHealth AI</p>
        </div>
      </footer>
    </div>
  );
}
