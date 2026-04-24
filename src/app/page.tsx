// src/app/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/logo";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "FinHealth AI — Connect Your Finances & Health with AI",
  description:
    "Discover hidden patterns between your spending and health. AI-powered insights, budget tracking, health logging — 100% free forever. Powered by Google Gemini.",
  openGraph: {
    title: "FinHealth AI — Connect Your Finances & Health with AI",
    description: "AI-powered personal finance & health insights. Free forever.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "FinHealth AI Platform" }],
  },
};

async function getPublishedPages() {
  try {
    return await prisma.cmsPage.findMany({
      where: { published: true },
      select: { title: true, slug: true },
      orderBy: { title: "asc" },
    });
  } catch { return []; }
}

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="currentColor"/>
      </svg>
    ),
    title: "Finance Tracking",
    desc: "Log income and expenses by category. Set monthly budgets with real-time alerts when you're close to the limit.",
    color: "from-brand-600 to-brand-700",
    bg: "bg-brand-50",
    text: "text-brand-700",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" aria-hidden="true">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/>
      </svg>
    ),
    title: "Health Logging",
    desc: "Track steps, sleep, water, mood and weight daily. See 30-day trends and get alerted when you hit your goals.",
    color: "from-rose-500 to-pink-600",
    bg: "bg-rose-50",
    text: "text-rose-700",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" aria-hidden="true">
        <path d="M12 2a2 2 0 011.995 1.85L14 4v2a8 8 0 110 12v2a2 2 0 01-3.995.15L10 20v-2A8 8 0 1112 6V4a2 2 0 012-2z" fill="currentColor"/>
      </svg>
    ),
    title: "AI Insights",
    desc: "Ask anything. Our AI analyzes your combined data and finds patterns — like how bad sleep spikes your food spending.",
    color: "from-violet-600 to-purple-700",
    bg: "bg-violet-50",
    text: "text-violet-700",
  },
];

const stats = [
  { value: "100%", label: "Free forever" },
  { value: "AI", label: "Powered insights" },
  { value: "30+", label: "Health metrics" },
  { value: "Real-time", label: "Budget alerts" },
];

export default async function LandingPage() {
  const cmsPages = await getPublishedPages();

  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* ── Navigation ── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-brand-100/60">
        <nav
          className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between"
          role="navigation"
          aria-label="Main navigation"
        >
          <Logo size="md" />

          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="hidden sm:block text-sm font-medium text-gray-600 hover:text-brand-700 transition-colors px-3 py-1.5"
            >
              Sign in
            </Link>
            <Link
              href="/auth/register"
              className="btn-brand text-sm font-semibold px-5 py-2 rounded-xl"
            >
              Get started free
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* ── Hero Section ── */}
        <section className="hero-mesh relative overflow-hidden" aria-labelledby="hero-heading">
          <div className="max-w-6xl mx-auto px-6 pt-16 pb-12 grid lg:grid-cols-2 gap-12 items-center">

            {/* Hero text */}
            <div className="space-y-6 animate-fade-up">
              <div className="inline-flex items-center gap-2 badge-brand animate-fade-up animate-delay-100">
                <span className="w-1.5 h-1.5 bg-brand-600 rounded-full animate-pulse-soft" />
                Powered by Google Gemini AI — 100% Free
              </div>

              <h1
                id="hero-heading"
                className="text-4xl lg:text-5xl font-bold text-gray-900 leading-[1.15] animate-fade-up animate-delay-200"
              >
                Your finances and health,{" "}
                <span className="text-brand-gradient">finally connected</span>
              </h1>

              <p className="text-lg text-gray-600 leading-relaxed max-w-lg animate-fade-up animate-delay-300">
                FinHealth AI finds the hidden patterns between your spending and wellbeing.
                Discover how your sleep affects your wallet — and act on it.
              </p>

              <div className="flex flex-wrap items-center gap-3 animate-fade-up animate-delay-400">
                <Link
                  href="/auth/register"
                  className="btn-brand text-sm font-semibold px-7 py-3 rounded-xl inline-flex items-center gap-2"
                >
                  Start for free
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Link>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-gray-500 hover:text-brand-700 transition-colors flex items-center gap-1.5 px-4 py-3"
                >
                  Try demo account →
                </Link>
              </div>

              {/* Trust stats */}
              <div className="flex flex-wrap gap-6 pt-2 animate-fade-up animate-delay-500">
                {stats.map(s => (
                  <div key={s.label}>
                    <p className="text-xl font-bold text-brand-700">{s.value}</p>
                    <p className="text-xs text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero banner image */}
            <div className="relative hidden lg:block animate-fade-up animate-delay-300">
              <div className="relative rounded-2xl overflow-hidden shadow-brand-lg">
                <Image
                  src="/banner.png"
                  alt="FinHealth AI dashboard showing finance tracking, health metrics, and AI insights with an upward trending growth chart and health shield"
                  width={680}
                  height={280}
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 glass-card rounded-2xl px-4 py-3 shadow-brand flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5" aria-hidden="true">
                    <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99l1.5 1.5z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Real-time insights</p>
                  <p className="text-[10px] text-gray-500">Updated every action</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="py-20 bg-white" aria-labelledby="features-heading">
          <div className="max-w-6xl mx-auto px-6">
            <header className="text-center mb-14">
              <h2
                id="features-heading"
                className="text-3xl font-bold text-gray-900 mb-3"
              >
                Everything you need, <span className="text-brand-gradient">in one place</span>
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                Track your finances, monitor your health, and let AI connect the dots between the two.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <article
                  key={f.title}
                  className="group bg-white rounded-2xl border border-gray-100 p-6 hover:border-brand-200 hover:shadow-brand transition-all duration-300 stat-card"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-5 group-hover:scale-105 transition-transform`}>
                    {f.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="py-20 bg-brand-50/40" aria-labelledby="how-heading">
          <div className="max-w-4xl mx-auto px-6">
            <header className="text-center mb-14">
              <h2 id="how-heading" className="text-3xl font-bold text-gray-900 mb-3">
                How FinHealth AI works
              </h2>
              <p className="text-gray-500">Three simple steps to financial and health clarity</p>
            </header>

            <ol className="grid md:grid-cols-3 gap-8" role="list">
              {[
                { step: "01", title: "Track daily", desc: "Log your transactions and health metrics in seconds. Quick forms, smart categories." },
                { step: "02", title: "Spot patterns", desc: "Our AI analyzes both datasets together, finding correlations you'd never notice alone." },
                { step: "03", title: "Take action", desc: "Get specific, personalized recommendations backed by your own data." },
              ].map((item) => (
                <li key={item.step} className="relative">
                  <div className="text-5xl font-black text-brand-100 leading-none mb-3">{item.step}</div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-20 bg-white" aria-labelledby="cta-heading">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="bg-gradient-to-br from-brand-600 via-brand-700 to-teal-700 rounded-3xl p-12 relative overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" aria-hidden="true" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" aria-hidden="true" />

              <div className="relative z-10">
                <h2 id="cta-heading" className="text-3xl font-bold text-white mb-3">
                  Start your journey today
                </h2>
                <p className="text-brand-100 mb-8 max-w-md mx-auto">
                  Join thousands who've discovered the connection between financial health and physical wellbeing.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href="/auth/register"
                    className="bg-white text-brand-700 font-semibold text-sm px-8 py-3.5 rounded-xl hover:bg-brand-50 transition-colors shadow-lg"
                  >
                    Create free account
                  </Link>
                  <Link
                    href="/auth/login"
                    className="text-white/80 hover:text-white text-sm font-medium border border-white/20 px-6 py-3.5 rounded-xl hover:border-white/40 transition-colors"
                  >
                    demo@finhealth.app / Demo1234!
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 bg-white" role="contentinfo">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Logo size="md" />
            <nav
              className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
              aria-label="Footer navigation"
            >
              {cmsPages.map(page => (
                <Link
                  key={page.slug}
                  href={page.slug === "contact-us" ? "/contact" : `/pages/${page.slug}`}
                  className="text-sm text-gray-400 hover:text-brand-600 transition-colors"
                >
                  {page.title}
                </Link>
              ))}
              {!cmsPages.some(p => p.slug === "contact-us") && (
                <Link href="/contact" className="text-sm text-gray-400 hover:text-brand-600 transition-colors">
                  Contact Us
                </Link>
              )}
            </nav>
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} FinHealth AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
