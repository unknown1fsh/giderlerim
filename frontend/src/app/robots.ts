import type { MetadataRoute } from 'next';

function baseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
  if (raw) {
    try {
      return new URL(raw).origin;
    } catch {
      /* fallthrough */
    }
  }
  return 'https://www.giderlerim.net';
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
