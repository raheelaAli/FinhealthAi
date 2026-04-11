// src/app/pages/[slug]/page.tsx
// Public frontend renderer for CMS pages created in the admin panel.
// Only renders pages with published: true. Returns a 404 message otherwise.

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await prisma.cmsPage.findUnique({ where: { slug: params.slug } });
  if (!page || !page.published) return { title: "Page not found — FinHealth AI" };
  return {
    title: `${page.title} — FinHealth AI`,
    description: page.content.slice(0, 160).replace(/\n/g, " "),
  };
}

export default async function CmsPublicPage({ params }: Props) {
  const page = await prisma.cmsPage.findUnique({ where: { slug: params.slug } });

  if (!page || !page.published) notFound();

  // Split content on blank lines into paragraphs
  const paragraphs = page.content
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col">
      {/* Minimal nav */}
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

      {/* Content */}
      <main className="flex-1 max-w-3xl mx-auto px-8 py-12 w-full">
        <div className="mb-8">
          <Link href="/" className="text-sm text-emerald-600 hover:underline flex items-center gap-1">
            ← Back to home
          </Link>
        </div>

        <article className="bg-white rounded-2xl border border-gray-200 p-10 shadow-sm">
          <header className="mb-8 pb-6 border-b border-gray-100">
            <h1 className="text-3xl font-bold text-gray-900">{page.title}</h1>
            <p className="text-xs text-gray-400 mt-2">
              Last updated {new Date(page.updatedAt).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </header>

          <div className="space-y-4">
            {paragraphs.map((para, i) => {
              // Basic markdown-lite: lines starting with # become headings
              if (para.startsWith("## ")) {
                return <h2 key={i} className="text-xl font-semibold text-gray-900 mt-6">{para.slice(3)}</h2>;
              }
              if (para.startsWith("# ")) {
                return <h2 key={i} className="text-2xl font-bold text-gray-900 mt-6">{para.slice(2)}</h2>;
              }
              return (
                <p key={i} className="text-gray-600 leading-relaxed text-sm">
                  {para.split("\n").map((line, j) => (
                    <span key={j}>{line}{j < para.split("\n").length - 1 && <br />}</span>
                  ))}
                </p>
              );
            })}
          </div>
        </article>
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
