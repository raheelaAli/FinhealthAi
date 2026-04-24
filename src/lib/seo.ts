// src/lib/seo.ts
// Centralized SEO metadata helpers — import these in every page

import type { Metadata } from "next";

const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL ?? "https://finhealth.app";
const SITE_NAME = "FinHealth AI";
const DEFAULT_OG = "/og-image.png";

export interface PageSEO {
  title:       string;
  description: string;
  path?:       string;
  ogImage?:    string;
  noIndex?:    boolean;
}

/**
 * Generate consistent Metadata for any page.
 * Usage: export const metadata = seoMeta({ title: "Finance", description: "..." });
 */
export function seoMeta({ title, description, path = "", ogImage = DEFAULT_OG, noIndex = false }: PageSEO): Metadata {
  const url       = `${SITE_URL}${path}`;
  const fullTitle = `${title} | ${SITE_NAME}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true,  follow: true  },
    openGraph: {
      title:       fullTitle,
      description,
      url,
      siteName:    SITE_NAME,
      type:        "website",
      locale:      "en_US",
      images: [{ url: ogImage, width: 1200, height: 630, alt: fullTitle }],
    },
    twitter: {
      card:        "summary_large_image",
      title:       fullTitle,
      description,
      images:      [ogImage],
      creator:     "@finhealth_ai",
    },
  };
}

/** Structured data (JSON-LD) for the landing page */
export const landingJsonLd = {
  "@context": "https://schema.org",
  "@type":    "SoftwareApplication",
  name:       SITE_NAME,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  url:        SITE_URL,
  description: "AI-powered personal finance and health tracking. Discover how your spending and wellbeing are connected.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
};
