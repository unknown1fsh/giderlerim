import type { MetadataRoute } from 'next';
import { resolvePublicSiteUrl } from '@/lib/siteUrl';

function baseUrl(): string {
  return resolvePublicSiteUrl();
}

export default function robots(): MetadataRoute.Robots {
  const base = baseUrl();
  let host: string | undefined;
  try {
    host = new URL(base).host;
  } catch {
    host = undefined;
  }
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${base}/sitemap.xml`,
    ...(host ? { host } : {}),
  };
}
