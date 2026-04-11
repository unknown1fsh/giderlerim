import Constants from 'expo-constants';

function trim(v: string | undefined): string | undefined {
  const t = v?.trim();
  return t || undefined;
}

/** app.json android.package ile aynı; Play Store uygulama sayfası (mock / yönlendirme). */
function varsayilanPlayStoreUygulamaUrl(): string {
  const pkg =
    (Constants.expoConfig?.android?.package as string | undefined) ?? 'com.scinar.giderlerim';
  return `https://play.google.com/store/apps/details?id=${encodeURIComponent(pkg)}`;
}

/**
 * Plan yükseltme için açılacak URL (şimdilik mock).
 *
 * Gerçek entegrasyonda: uygulama içi Google Play Billing (abonelik satın alma akışı);
 * tarayıcıda açılan link politik olarak yedek veya mağaza sayfasına yönlendirme içindir.
 *
 * İleride senden istenecek bilgiler (.env / backend):
 * - Play Console’da tanımlı abonelik base plan / ürün kimlikleri (örn. pro_monthly, ultra_monthly)
 * - (İsteğe bağlı) RevenueCat veya react-native-iap yapılandırması
 * - Sunucu tarafı: Google Play Developer API ile satın alma doğrulama (service account JSON)
 * - Gerçek mağaza yayınından sonra: kullanıcıya gösterilecek net Play Billing akışı (SDK)
 */
export function planYukseltmeUrl(plan: string | undefined): string {
  const pro = trim(process.env.EXPO_PUBLIC_PLAY_SUBSCRIPTION_PRO_URL);
  const ultra = trim(process.env.EXPO_PUBLIC_PLAY_SUBSCRIPTION_ULTRA_URL);
  const fallback = varsayilanPlayStoreUygulamaUrl();
  const p = plan ?? 'FREE';
  if (p === 'PREMIUM') {
    return ultra ?? pro ?? fallback;
  }
  if (p === 'FREE') {
    return pro ?? fallback;
  }
  return fallback;
}
