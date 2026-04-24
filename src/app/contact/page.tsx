// src/app/contact/page.tsx
"use client";
import type { Metadata } from "next";
import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";

interface FormState { name: string; email: string; subject: string; message: string; }
const INITIAL: FormState = { name: "", email: "", subject: "", message: "" };

const subjects = [
  "General enquiry", "Technical support", "Billing question",
  "Feature request", "Bug report", "Partnership", "Other",
];

export default function ContactPage() {
  const [form,   setForm]   = useState<FormState>(INITIAL);
  const [status, setStatus] = useState<"idle"|"loading"|"success"|"error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function set(f: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [f]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setStatus("loading");
    try {
      const res = await fetch("/api/contact", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
      if (!res.ok) { const d = await res.json(); setErrorMsg(d.error ?? "Something went wrong."); setStatus("error"); return; }
      setStatus("success"); setForm(INITIAL);
    } catch { setErrorMsg("Network error. Please try again."); setStatus("error"); }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Nav */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <nav className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between" aria-label="Main navigation">
          <Link href="/"><Logo size="md" /></Link>
          <Link href="/auth/login" className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">Sign in →</Link>
        </nav>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-16">
        <div className="grid md:grid-cols-[1fr,2fr] gap-12 items-start">

          {/* Left info */}
          <aside>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Get in touch</h1>
            <p className="text-gray-500 leading-relaxed mb-8">
              Have a question about FinHealth AI? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
            <dl className="space-y-5">
              {[
                {
                  icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-brand-500" aria-hidden="true"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>,
                  label: "Email", value: "hello@finhealth.app",
                },
                {
                  icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-brand-500" aria-hidden="true"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>,
                  label: "Response time", value: "Within 24 hours",
                },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">{item.icon}</div>
                  <div>
                    <dt className="text-xs text-gray-400 font-medium uppercase tracking-wide">{item.label}</dt>
                    <dd className="text-sm font-medium text-gray-900 mt-0.5">{item.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </aside>

          {/* Right form */}
          <section aria-labelledby="contact-form-heading">
            {status === "success" ? (
              <div className="bg-white rounded-2xl border border-brand-200 shadow-card p-10 text-center">
                <div className="w-14 h-14 mx-auto mb-4 bg-brand-50 rounded-2xl flex items-center justify-center">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-7 h-7 text-brand-600" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Message sent!</h2>
                <p className="text-gray-500 text-sm mb-6">We'll get back to you within 24 hours.</p>
                <button onClick={() => setStatus("idle")} className="btn-brand text-sm font-semibold px-6 py-2.5 rounded-xl">Send another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 space-y-5" noValidate>
                <h2 id="contact-form-heading" className="text-lg font-bold text-gray-900">Send a message</h2>

                {status === "error" && (
                  <div role="alert" className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{errorMsg}</div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
                    <input id="name" type="text" required value={form.name} onChange={set("name")} placeholder="Ali Hassan"
                      className="input-brand w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                    <input id="email" type="email" required value={form.email} onChange={set("email")} placeholder="you@example.com"
                      className="input-brand w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50" />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                  <select id="subject" required value={form.subject} onChange={set("subject")}
                    className="input-brand w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50">
                    <option value="" disabled>Select a topic</option>
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                  <textarea id="message" required rows={5} value={form.message} onChange={set("message")}
                    placeholder="Tell us how we can help..."
                    className="input-brand w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 resize-y" />
                </div>

                <button type="submit" disabled={status === "loading"}
                  className="btn-brand w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none">
                  {status === "loading" ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</>
                  ) : "Send message"}
                </button>
              </form>
            )}
          </section>
        </div>
      </main>

      <footer className="border-t border-gray-100 bg-white" role="contentinfo">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <Logo size="sm" />
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} FinHealth AI</p>
        </div>
      </footer>
    </div>
  );
}
