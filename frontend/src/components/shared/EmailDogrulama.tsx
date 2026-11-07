'use client';

import React, { useState } from 'react';
import { authService } from '@/services/authService';
import { apiHataMesaji } from '@/lib/apiHataMesaji';
import { useAuthStore } from '@/stores/authStore';

function useYenidenGonder() {
  const { kullanici } = useAuthStore();
  const [durum, setDurum] = useState<'bos' | 'gonderiliyor' | 'gonderildi'>('bos');
  const [hata, setHata] = useState('');

  const gonder = async () => {
    if (!kullanici?.email) return;
    setDurum('gonderiliyor');
    setHata('');
    try {
      await authService.emailDogrulamaTalepEt(kullanici.email);
      setDurum('gonderildi');
    } catch (err) {
      setHata(apiHataMesaji(err, 'E-posta gönderilemedi. Lütfen daha sonra tekrar deneyin.'));
      setDurum('bos');
    }
  };
  return { kullanici, durum, hata, gonder };
}

/** E-postası doğrulanmamış kullanıcıya uygulamanın üstünde hatırlatma gösterir. */
export function EmailDogrulamaBandi() {
  const { kullanici, durum, hata, gonder } = useYenidenGonder();
  if (!kullanici || kullanici.emailDogrulandi) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
      <p>
        <span className="font-semibold">E-posta adresinizi doğrulayın.</span>{' '}
        {kullanici.emailDogrulamaGerekli
          ? 'Doğrulayana kadar yapay zeka özellikleri ve dosya yükleme kapalı.'
          : `${kullanici.email} adresine gönderilen bağlantıyı açın.`}
        {hata && <span className="ml-1 text-red-600 dark:text-red-400">{hata}</span>}
      </p>
      {durum === 'gonderildi' ? (
        <span className="font-medium">Doğrulama e-postası gönderildi.</span>
      ) : (
        <button
          type="button"
          onClick={gonder}
          disabled={durum === 'gonderiliyor'}
          className="rounded-lg border border-amber-300 px-3 py-1.5 font-medium hover:bg-amber-100 disabled:opacity-60 dark:border-amber-700 dark:hover:bg-amber-900"
        >
          {durum === 'gonderiliyor' ? 'Gönderiliyor…' : 'Doğrulama e-postasını tekrar gönder'}
        </button>
      )}
    </div>
  );
}

/** Doğrulama zorunlu hesaplarda (yeni hesaplar) içeriği e-posta doğrulanana kadar gizler. */
export default function EmailDogrulamaKapisi({ children }: { children: React.ReactNode }) {
  const { kullanici, durum, hata, gonder } = useYenidenGonder();
  if (!kullanici?.emailDogrulamaGerekli) return <>{children}</>;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Önce e-posta adresinizi doğrulayın</h2>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Yapay zeka özellikleri ve dosya yükleme, e-posta adresiniz doğrulandıktan sonra açılır.
        <span className="font-medium"> {kullanici.email}</span> adresine gönderdiğimiz bağlantıyı açın.
      </p>
      {hata && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{hata}</p>}
      <button
        type="button"
        onClick={gonder}
        disabled={durum !== 'bos'}
        className="mt-5 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
      >
        {durum === 'gonderildi' ? 'E-posta gönderildi' : durum === 'gonderiliyor' ? 'Gönderiliyor…' : 'Doğrulama e-postasını tekrar gönder'}
      </button>
    </div>
  );
}
