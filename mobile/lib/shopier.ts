const SITE_FALLBACK = 'https://www.giderlerim.net/#fiyatlandirma';

function trim(v: string | undefined): string | undefined {
  const t = v?.trim();
  return t || undefined;
}

/** FREE → Pro aylık, PREMIUM → Ultra aylık Shopier linki; yoksa fiyatlandırma sayfası. */
export function shopierProfilYukseltUrl(plan: string | undefined): string {
  const p = plan ?? 'FREE';
  if (p === 'PREMIUM') {
    return trim(process.env.EXPO_PUBLIC_SHOPIER_ULTRA_AYLIK) ?? SITE_FALLBACK;
  }
  if (p === 'FREE') {
    return trim(process.env.EXPO_PUBLIC_SHOPIER_PRO_AYLIK) ?? SITE_FALLBACK;
  }
  return SITE_FALLBACK;
}
