/**
 * Shopier sabit ödeme linkleri — kök .env / Railway’de NEXT_PUBLIC_SHOPIER_* tanımlayın.
 * Boş bırakılırsa arayüz #fiyatlandirma veya mevcut fallback’e döner.
 */
export type ShopierPlanKey = 'proAylik' | 'proYillik' | 'ultraAylik' | 'ultraYillik';

function trimUrl(v: string | undefined): string | undefined {
  const t = v?.trim();
  return t || undefined;
}

export function shopierOdemeUrl(key: ShopierPlanKey): string | undefined {
  const map: Record<ShopierPlanKey, string | undefined> = {
    proAylik: process.env.NEXT_PUBLIC_SHOPIER_PRO_AYLIK,
    proYillik: process.env.NEXT_PUBLIC_SHOPIER_PRO_YILLIK,
    ultraAylik: process.env.NEXT_PUBLIC_SHOPIER_ULTRA_AYLIK,
    ultraYillik: process.env.NEXT_PUBLIC_SHOPIER_ULTRA_YILLIK,
  };
  return trimUrl(map[key]);
}

export function shopierOdemeUrlForPlanKapisi(gerekliPlan: 'PREMIUM' | 'ULTRA'): string | undefined {
  return gerekliPlan === 'ULTRA' ? shopierOdemeUrl('ultraAylik') : shopierOdemeUrl('proAylik');
}

export function shopierProfilYukseltUrl(mevcutPlan: 'FREE' | 'PREMIUM' | 'ULTRA'): string | undefined {
  if (mevcutPlan === 'FREE') return shopierOdemeUrl('proAylik');
  if (mevcutPlan === 'PREMIUM') return shopierOdemeUrl('ultraAylik');
  return undefined;
}

export function shopierLandingUrl(plan: 'pro' | 'ultra', yillik: boolean): string | undefined {
  if (plan === 'pro') {
    return yillik ? shopierOdemeUrl('proYillik') : shopierOdemeUrl('proAylik');
  }
  return yillik ? shopierOdemeUrl('ultraYillik') : shopierOdemeUrl('ultraAylik');
}
