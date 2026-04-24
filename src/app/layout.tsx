// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/ui/providers";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://finhealth.app";
const SITE_NAME = "FinHealth AI";
const SITE_DESCRIPTION =
  "AI-powered personal finance & health tracking. Discover hidden patterns between your spending and wellbeing. Track budgets, health metrics, and get smart insights — free forever.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Personal Finance & Health Insights`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "personal finance tracker", "health tracking app", "AI financial advisor",
    "budget tracker", "spending insights", "health and finance", "fintech app",
    "AI health advisor", "money management", "wellness tracker",
  ],
  authors: [{ name: "FinHealth AI" }],
  creator: "FinHealth AI",
  publisher: "FinHealth AI",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Personal Finance & Health Insights`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FinHealth AI — Personal Finance & Health Insights Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Personal Finance & Health Insights`,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
    creator: "@finhealth_ai",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  alternates: { canonical: SITE_URL },
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
