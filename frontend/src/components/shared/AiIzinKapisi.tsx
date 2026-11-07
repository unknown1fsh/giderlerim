'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import apiClient from '@/services/apiClient';
import { useAuthStore } from '@/stores/authStore';
import EmailDogrulamaKapisi from '@/components/shared/EmailDogrulama';
import type { KullaniciResponse } from '@giderlerim/shared/types/kullanici.types';
import type { ApiResponse } from '@giderlerim/shared/types/api.types';

/** Yapay zeka sağlayıcısına veri aktarımı için açık rıza metni. Değişirse backend'deki AiIzinKapisi.METIN_SURUMU da artırılmalı. */
export function AiIzinMetni() {
  return (
    <ul className="list-disc space-y-1.5 pl-5 text-sm text-gray-600 dark:text-gray-300">
      <li>
        Yapay zeka özellikleri (AI koç, harcama analizleri, PDF ve fiş okuma) için harcama verileriniz
        (tutar, kategori, tarih, kısaltılmış açıklamalar), sohbet mesajlarınız ve yüklediğiniz belgeler
        yapay zeka hizmet sağlayıcımıza gönderilir.
      </li>
      <li>
        Sağlayıcının sunucuları <strong>yurt dışında</strong> bulunabilir; bu nedenle verileriniz yurt dışına aktarılır.
      </li>
      <li>
        Göndermeden önce IBAN, kart numarası, TC kimlik numarası, telefon, e-posta ve adınız otomatik olarak maskelenir.
        Fiş ve belge <strong>görselleri</strong> maskelenemez; görseldeki bilgiler olduğu gibi iletilir.
      </li>
      <li>
        Bu onayı profil sayfanızdan istediğiniz zaman geri alabilirsiniz; geri aldığınızda yapay zeka özellikleri kapanır,
        diğer özellikler çalışmaya devam eder.
      </li>
    </ul>
  );
}

/** Kullanıcı yapay zeka iznini verene kadar içeriği göstermez; izin ekranını gösterir. */
export default function AiIzinKapisi({
  children,
  gerekli = true,
}: {
  children: React.ReactNode;
  /** false ise kapı devre dışıdır (ör. AI'a zaten erişimi olmayan ücretsiz plan). */
  gerekli?: boolean;
}) {
  const { kullanici, kullaniciGuncelle } = useAuthStore();
  const [onay, setOnay] = useState(false);
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [hata, setHata] = useState('');

  if (!gerekli) return <>{children}</>;
  // Yeni hesaplarda önce e-posta doğrulaması istenir (backend de aynı sırayla kontrol eder).
  if (kullanici?.emailDogrulamaGerekli) return <EmailDogrulamaKapisi>{children}</EmailDogrulamaKapisi>;
  if (kullanici?.aiIzni) return <>{children}</>;

  const izinVer = async () => {
    setGonderiliyor(true);
    setHata('');
    try {
      const r = await apiClient.put<ApiResponse<KullaniciResponse>>('/kullanici/ai-izni', { izin: true });
      kullaniciGuncelle(r.data.data);
    } catch {
      setHata('Onay kaydedilemedi. Lütfen tekrar deneyin.');
    } finally {
      setGonderiliyor(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Yapay zeka özellikleri için onayınız gerekiyor</h2>
      <p className="mt-1 mb-4 text-sm text-gray-500 dark:text-gray-400">
        Kişisel verilerin korunması kapsamında, bu özelliği kullanmadan önce aşağıdaki aktarıma açıkça onay vermeniz gerekir.
      </p>
      <AiIzinMetni />
      <label className="mt-5 flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
        <input
          type="checkbox"
          checked={onay}
          onChange={(e) => setOnay(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
        />
        <span>
          Yukarıdaki bilgilendirmeyi okudum; verilerimin bu amaçla yapay zeka sağlayıcısına ve yurt dışına aktarılmasına
          açık rıza veriyorum. Ayrıntılar için{' '}
          <Link href="/gizlilik" className="text-brand-500 underline hover:no-underline">
            gizlilik politikası
          </Link>
          .
        </span>
      </label>
      {hata && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{hata}</p>}
      <button
        type="button"
        onClick={izinVer}
        disabled={!onay || gonderiliyor}
        className="mt-5 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
      >
        {gonderiliyor ? 'Kaydediliyor…' : 'Onaylıyorum, yapay zekayı etkinleştir'}
      </button>
    </div>
  );
}
