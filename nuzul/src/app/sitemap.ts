import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';
import { WILAYAS } from '@/lib/constants';
import { locales } from '@/lib/i18n/config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    entries.push({ url: `${base}/${locale}`, changeFrequency: 'daily', priority: 1 });
    for (const w of WILAYAS) {
      entries.push({ url: `${base}/${locale}/search?wilaya=${w.id}`, changeFrequency: 'weekly', priority: 0.6 });
    }
  }

  try {
    const properties = await prisma.property.findMany({
      where: { status: 'approved' },
      select: { slug: true, updatedAt: true },
      take: 1000,
    });
    for (const locale of locales) {
      for (const p of properties) {
        entries.push({ url: `${base}/${locale}/listing/${p.slug}`, lastModified: p.updatedAt, changeFrequency: 'weekly', priority: 0.8 });
      }
    }
  } catch {
    // DB unavailable at build time → ship the static portion of the sitemap.
  }

  return entries;
}
