"use client";
// src/app/auth/register/page.tsx
import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/logo";

export default function RegisterPage() {
  const router = useRouter();
  const { status } = useSession();
  const [form, setForm]       = useState({ name: "", email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const res  = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }
    await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    router.replace("/dashboard");
  }

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-50">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const perks = [
    "Finance & health tracking in one app",
    "AI-powered insights connecting both",
    "Real-time budget & goal alerts",
    "100% free, no credit card needed",
  ];

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left decorative */}
      <aside className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-brand-600 via-brand-700 to-teal-700 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <div className="absolute top-20 right-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-48 h-48 bg-teal-400 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10"><Logo size="lg" variant="dark" /></div>
        <div className="relative z-10 space-y-5">
          <h2 className="text-2xl font-bold text-white">Everything you need to thrive</h2>
          <ul className="space-y-3" role="list">
            {perks.map(p => (
              <li key={p} className="flex items-center gap-3 text-brand-100 text-sm">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative z-10 text-xs text-brand-200">© {new Date().getFullYear()} FinHealth AI</p>
      </aside>

      {/* Right form */}
      <main className="flex-1 flex flex-col justify-center px-8 py-12 max-w-lg mx-auto w-full lg:max-w-none lg:mx-0 lg:px-16 xl:px-24">
        <div className="lg:hidden mb-8 flex justify-center"><Logo size="md" /></div>

        <div className="max-w-sm mx-auto w-full lg:max-w-md">
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
            <p className="text-sm text-gray-500">Start your finance & health journey — free forever</p>
          </header>

          {error && (
            <div role="alert" className="mb-5 flex items-center gap-3 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {[
              { id: "name",     label: "Full name",    type: "text",     placeholder: "Ali Hassan",        auto: "name" },
              { id: "email",    label: "Email address",type: "email",    placeholder: "you@example.com",   auto: "email" },
              { id: "password", label: "Password",     type: "password", placeholder: "At least 8 characters", auto: "new-password" },
            ].map(f => (
              <div key={f.id}>
                <label htmlFor={f.id} className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
                <input
                  id={f.id} type={f.type} value={(form as any)[f.id]}
                  onChange={e => setForm(prev => ({ ...prev, [f.id]: e.target.value }))}
                  required minLength={f.id === "name" ? 2 : f.id === "password" ? 8 : undefined}
                  placeholder={f.placeholder} autoComplete={f.auto}
                  className="input-brand w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 transition-colors hover:border-gray-300"
                />
              </div>
            ))}

            <button type="submit" disabled={loading}
              className="btn-brand w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none mt-2">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account...</>
              ) : "Create free account"}
            </button>
          </form>

          <p className="text-[10px] text-gray-400 text-center mt-4">
            By creating an account you agree to our{" "}
            <Link href="/pages/terms-conditions" className="text-brand-600 hover:underline">Terms</Link>
            {" "}and{" "}
            <Link href="/pages/privacy-policy" className="text-brand-600 hover:underline">Privacy Policy</Link>.
          </p>

          <p className="mt-5 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-brand-600 font-semibold hover:text-brand-700 transition-colors">Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
