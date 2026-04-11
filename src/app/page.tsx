// src/app/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Logo } from "@/components/logo";

async function getPublishedPages() {
  try {
    return await prisma.cmsPage.findMany({
      where: { published: true },
      select: { title: true, slug: true },
      orderBy: { title: "asc" },
    });
  } catch {
    return [];
  }
}

export default async function LandingPage() {
  const cmsPages = await getPublishedPages();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto w-full">
        <Logo size="md" />
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

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          <span>✦</span> Powered by Google Gemini AI — 100% free
        </div>

        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          Your finances and health,{" "}
          <span className="text-emerald-600">finally connected</span>
        </h1>

        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          FinHealth AI finds the hidden patterns between your spending and wellbeing.
          Discover how your sleep affects your wallet — and act on it.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link
            href="/auth/register"
            className="bg-emerald-600 text-white font-medium px-8 py-3.5 rounded-xl hover:bg-emerald-700 transition-colors text-sm"
          >
            Start for free — no credit card
          </Link>
          <Link
            href="/auth/login"
            className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
          >
            Try demo →
          </Link>
        </div>
      </div>

      {/* Feature cards */}
      <div className="max-w-5xl mx-auto px-8 pb-16 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: "₨",
              title: "Finance tracking",
              desc: "Log income and expenses by category. Set monthly budgets with real-time alerts when you're close to the limit.",
              color: "bg-emerald-100 text-emerald-700",
            },
            {
              icon: "❤️",
              title: "Health logging",
              desc: "Track steps, sleep, water, mood and weight daily. See 30-day trends and get alerted when you hit your goals.",
              color: "bg-blue-100 text-blue-700",
            },
            {
              icon: "✦",
              title: "AI insights",
              desc: "Ask anything. Our AI analyzes your combined data and finds patterns — like how bad sleep spikes your food spending.",
              color: "bg-purple-100 text-purple-700",
            },
          ].map(f => (
            <div key={f.title} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-xl ${f.color} flex items-center justify-center text-lg mb-4`}>
                {f.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Demo CTA */}
        <div className="mt-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Try it right now</h2>
          <p className="text-emerald-100 mb-6 text-sm">
            Log in with the demo account to see real data already populated
          </p>
          <Link
            href="/auth/login"
            className="inline-block bg-white text-emerald-700 font-semibold text-sm px-6 py-3 rounded-xl hover:bg-emerald-50 transition-colors"
          >
            demo@finhealth.app / Demo1234!
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {cmsPages.map(page => (
              <Link
                key={page.slug}
                href={page.slug === "contact-us" ? "/contact" : `/pages/${page.slug}`}
                className="text-sm text-gray-500 hover:text-emerald-600 transition-colors"
              >
                {page.title}
              </Link>
            ))}
            {/* Always show Contact Us if not in CMS */}
            {!cmsPages.some(p => p.slug === "contact-us") && (
              <Link href="/contact" className="text-sm text-gray-500 hover:text-emerald-600 transition-colors">
                Contact Us
              </Link>
            )}
          </nav>
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} FinHealth AI</p>
        </div>
      </footer>
    </div>
  );
}
