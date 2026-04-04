/**
 * Üretim canonical kökü. NEXT_PUBLIC_SITE_URL tanımlı ve geçerliyse onu kullanır.
 */
export const DEFAULT_PUBLIC_SITE_URL = 'https://giderlerim.net';

export function resolvePublicSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, '');
  if (!raw) return DEFAULT_PUBLIC_SITE_URL;
  try {
    return new URL(raw).origin;
  } catch {
    return DEFAULT_PUBLIC_SITE_URL;
  }
}
