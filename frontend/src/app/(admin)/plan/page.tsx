'use client';

import Link from 'next/link';
import { shopierOdemeUrl } from '@/config/shopier';
import {
  FIYAT_PRO_AYLIK,
  FIYAT_PRO_YILLIK_TOPLAM,
  FIYAT_ULTRA_AYLIK,
  FIYAT_ULTRA_YILLIK_TOPLAM,
  FIYAT_PRO_AYLIK_YILLIK_PAKETTE,
  FIYAT_ULTRA_AYLIK_YILLIK_PAKETTE,
  proYillikTasarrufTl,
  ultraYillikTasarrufTl,
} from '@/lib/planFiyatlari';
import { useAuthStore } from '@/stores/authStore';
import type { PlanTuru } from '@/types/kullanici.types';
import type { ShopierPlanKey } from '@/config/shopier';

const PLAN_AD: Record<PlanTuru, string> = { FREE: 'Ücretsiz', PREMIUM: 'Pro', ULTRA: 'Ultra' };

type PaketKarti = {
  anahtar: ShopierPlanKey;
  baslik: string;
  altBaslik: string;
  fiyatSatir: string;
  tasarruf?: string;
  vurgu?: boolean;
};

export default function PlanPage() {
  const { kullanici } = useAuthStore();
  const plan = kullanici?.plan ?? 'FREE';

  const paketler: PaketKarti[] = [
    {
      anahtar: 'proAylik',
      baslik: 'Pro — Aylık',
      altBaslik: 'Sınırsız gider, CSV, belge, AI koç ve Pro analizleri',
      fiyatSatir: `₺${FIYAT_PRO_AYLIK} / ay`,
    },
    {
      anahtar: 'proYillik',
      baslik: 'Pro — Yıllık',
      altBaslik: `Yıllık tek ödeme · ayda ₺${FIYAT_PRO_AYLIK_YILLIK_PAKETTE} karşılığı`,
      fiyatSatir: `₺${FIYAT_PRO_YILLIK_TOPLAM} / yıl`,
      tasarruf: `Yıllık ödemede yaklaşık ${proYillikTasarrufTl()} ₺ tasarruf`,
      vurgu: true,
    },
    {
      anahtar: 'ultraAylik',
      baslik: 'Ultra — Aylık',
      altBaslik: "Pro'nun tümü + AI anomali ve tasarruf analizleri",
      fiyatSatir: `₺${FIYAT_ULTRA_AYLIK} / ay`,
    },
    {
      anahtar: 'ultraYillik',
      baslik: 'Ultra — Yıllık',
      altBaslik: `Yıllık tek ödeme · ayda ₺${FIYAT_ULTRA_AYLIK_YILLIK_PAKETTE} karşılığı`,
      fiyatSatir: `₺${FIYAT_ULTRA_YILLIK_TOPLAM} / yıl`,
      tasarruf: `Yıllık ödemede yaklaşık ${ultraYillikTasarrufTl()} ₺ tasarruf`,
      vurgu: true,
    },
  ];

  const shopierTanimli = paketler.some((p) => Boolean(shopierOdemeUrl(p.anahtar)));

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Plan ve abonelik</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Ödemeyi güvenli şekilde Shopier üzerinden tamamlayın. Hesabınız:{' '}
          <span className="font-medium text-gray-700 dark:text-gray-200">{kullanici?.email}</span>
        </p>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Mevcut planınız:{' '}
          <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-sm font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
            {PLAN_AD[plan]}
          </span>
        </p>
      </div>

      {plan === 'ULTRA' && (
        <div className="rounded-2xl border border-purple-200 bg-purple-50 p-5 dark:border-purple-800 dark:bg-purple-900/20">
          <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
            Ultra plandasınız. Tüm ücretli özelliklere erişiminiz var.
          </p>
          <p className="mt-1 text-xs text-purple-800/90 dark:text-purple-200/90">
            Aşağıdaki bağlantılar yine de yenileme veya hediye satın alımı için kullanılabilir; aynı e-posta ile
            sipariş verirseniz destek ekibiyle eşleştirme yapılır.
          </p>
        </div>
      )}

      {plan === 'PREMIUM' && (
        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5 dark:border-brand-800 dark:bg-brand-900/20">
          <p className="text-sm text-brand-900 dark:text-brand-100">
            Pro plandasınız. Gelişmiş AI analizleri (anomali, tasarruf) için{' '}
            <span className="font-semibold">Ultra</span> paketlerinden birini seçebilirsiniz.
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/40">
        <p className="text-sm text-amber-950 dark:text-amber-100">
          <span className="font-semibold">Ödeme sonrası:</span> Planınız kısa süre içinde hesabınıza yansır.
          Otomatik tanımlama yoksa siparişte kullandığınız e-postanın bu hesaptaki e-posta ile aynı olması gerekir.
          Gecikme olursa{' '}
          <a href="mailto:destek@giderlerim.net" className="font-medium underline hover:no-underline">
            destek@giderlerim.net
          </a>{' '}
          üzerinden sipariş bilgisi paylaşın.
        </p>
        <p className="mt-2 text-xs text-amber-900/90 dark:text-amber-200/80">
          Başarılı ödeme sayfası:{' '}
          <Link href="/odeme/basarili" className="font-medium underline hover:no-underline">
            /odeme/basarili
          </Link>
        </p>
      </div>

      {!shopierTanimli && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
          <p className="text-sm font-medium text-red-900 dark:text-red-100">Ödeme bağlantıları yapılandırılmamış</p>
          <p className="mt-1 text-xs text-red-800 dark:text-red-200">
            Sunucuda <code className="rounded bg-red-100 px-1 dark:bg-red-900/50">NEXT_PUBLIC_SHOPIER_*</code> ortam
            değişkenlerini tanımlayın. Ayrıntı için kök dizindeki <code className="rounded bg-red-100 px-1 dark:bg-red-900/50">.env.example</code> dosyasına bakın.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {paketler.map((p) => {
          const url = shopierOdemeUrl(p.anahtar);
          const proMevcut = plan === 'PREMIUM' && (p.anahtar === 'proAylik' || p.anahtar === 'proYillik');
          const ultraIcinUygun = plan !== 'ULTRA';

          return (
            <div
              key={p.anahtar}
              className={`flex flex-col rounded-2xl border p-5 dark:bg-gray-800/50 ${
                p.vurgu
                  ? 'border-brand-300 bg-brand-50/50 dark:border-brand-700 dark:bg-brand-900/10'
                  : 'border-gray-200 bg-white dark:border-gray-700'
              }`}
            >
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{p.baslik}</h2>
              <p className="mt-1 text-2xl font-bold text-brand-600 dark:text-brand-400">{p.fiyatSatir}</p>
              {p.tasarruf && <p className="mt-1 text-xs font-medium text-green-600 dark:text-green-400">{p.tasarruf}</p>}
              <p className="mt-3 flex-1 text-sm text-gray-600 dark:text-gray-400">{p.altBaslik}</p>

              {proMevcut && (
                <p className="mt-3 text-xs font-medium text-brand-700 dark:text-brand-300">Mevcut Pro planınız — yenileme için kullanabilirsiniz</p>
              )}

              <div className="mt-4">
                {url ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
                  >
                    Shopier ile öde
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm font-medium text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400"
                  >
                    Bağlantı yapılandırılmadı
                  </button>
                )}
              </div>

              {p.anahtar.startsWith('ultra') && !ultraIcinUygun && (
                <p className="mt-2 text-center text-xs text-gray-500">Zaten Ultra plandasınız</p>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-gray-500 dark:text-gray-400">
        <Link href="/profile" className="font-medium text-brand-600 hover:underline dark:text-brand-400">
          Profil sayfasına dön
        </Link>
      </p>
    </div>
  );
}
