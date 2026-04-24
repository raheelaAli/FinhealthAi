// src/app/sitemap.ts
import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://finhealth.app";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl,                     lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${siteUrl}/auth/login`,     lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/auth/register`,  lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/contact`,        lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  // CMS pages
  let cmsPages: MetadataRoute.Sitemap = [];
  try {
    const pages = await prisma.cmsPage.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    });
    cmsPages = pages.map(p => ({
      url:             `${siteUrl}/pages/${p.slug}`,
      lastModified:    p.updatedAt,
      changeFrequency: "monthly" as const,
      priority:        0.5,
    }));
  } catch { /* db not available during build */ }

  return [...staticPages, ...cmsPages];
}
