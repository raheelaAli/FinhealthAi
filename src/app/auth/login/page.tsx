"use client";
// src/app/auth/login/page.tsx
import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/logo";

export default function LoginPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setError(
        result.error === "No account found with this email" ? "No account found with this email." :
        result.error === "Incorrect password" ? "Incorrect password. Please try again." :
        "Sign in failed. Please check your details."
      );
      setLoading(false);
    } else {
      router.replace(callbackUrl); router.refresh();
    }
  }

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-50">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left — decorative panel */}
      <aside className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-brand-600 via-brand-700 to-teal-700 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-teal-400 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <Logo size="lg" variant="dark" />
        </div>
        <div className="relative z-10 space-y-6">
          <blockquote className="text-white/90 text-xl font-medium leading-relaxed">
            "Finally understanding the connection between my bad sleep and impulse spending was life-changing."
          </blockquote>
          <footer className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold text-white">A</div>
            <div>
              <p className="text-sm font-semibold text-white">Ali Hassan</p>
              <p className="text-xs text-brand-200">FinHealth AI user</p>
            </div>
          </footer>
        </div>
        <div className="relative z-10">
          <p className="text-xs text-brand-200">© {new Date().getFullYear()} FinHealth AI</p>
        </div>
      </aside>

      {/* Right — form */}
      <main className="flex-1 flex flex-col justify-center px-8 py-12 max-w-lg mx-auto w-full lg:max-w-none lg:mx-0 lg:px-16 xl:px-24">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 flex justify-center">
          <Logo size="md" />
        </div>

        <div className="max-w-sm mx-auto w-full lg:max-w-md">
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
            <p className="text-sm text-gray-500">Sign in to your FinHealth AI account</p>
          </header>

          {error && (
            <div role="alert" className="mb-5 flex items-center gap-3 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input
                id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                required autoComplete="email" placeholder="you@example.com"
                className="input-brand w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 transition-colors hover:border-gray-300"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="password" type={showPass ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)} required autoComplete="current-password"
                  placeholder="••••••••"
                  className="input-brand w-full px-4 py-3 pr-11 border border-gray-200 rounded-xl text-sm bg-gray-50 transition-colors hover:border-gray-300"
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPass ? "Hide password" : "Show password"}>
                  {showPass ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-brand w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</>
              ) : "Sign in"}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-5 p-3.5 bg-brand-50 border border-brand-100 rounded-xl">
            <p className="text-xs text-brand-700 font-medium mb-0.5">Demo credentials</p>
            <p className="text-xs text-brand-600">demo@finhealth.app / Demo1234!</p>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link href="/auth/register" className="text-brand-600 font-semibold hover:text-brand-700 transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
