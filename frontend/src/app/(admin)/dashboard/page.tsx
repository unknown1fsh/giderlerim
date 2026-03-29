'use client';

import React, { useState } from 'react';
import { format, subMonths } from 'date-fns';
import { useDashboard } from '@/hooks/useDashboard';
import { useGiderler } from '@/hooks/useGiderler';
import { useAuthStore } from '@/stores/authStore';

type Periyt = 'bu-ay' | 'gecen-ay';

const formatPara = (tutar: number, paraBirimi = 'TRY') =>
  tutar.toLocaleString('tr-TR', { style: 'currency', currency: paraBirimi });

export default function DashboardPage() {
  const bugun = new Date();
  const [periyt, setPeriyt] = useState<Periyt>('bu-ay');
  const { kullanici } = useAuthStore();

  const hedefAy = periyt === 'bu-ay' ? bugun : subMonths(bugun, 1);
  const ay = hedefAy.getMonth() + 1;
  const yil = hedefAy.getFullYear();

  const { data: dashboard, isLoading, isError } = useDashboard(ay, yil);
  const { data: sonGiderlerData } = useGiderler({ size: 5, page: 0 });
  const sonGiderler = sonGiderlerData?.icerik ?? [];
  const para = (tutar: number) => formatPara(tutar, kullanici?.paraBirimi ?? 'TRY');

  return (
    <div className="space-y-6">
      {/* Başlık + Dönem seçici */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Merhaba, {kullanici?.ad ?? 'Kullanıcı'}!
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Harcamalarınıza genel bakış
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPeriyt('bu-ay')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              periyt === 'bu-ay'
                ? 'bg-brand-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            Bu ay
          </button>
          <button
            onClick={() => setPeriyt('gecen-ay')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              periyt === 'gecen-ay'
                ? 'bg-brand-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            Geçen ay
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500" />
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          Dashboard verileri yüklenemedi.
        </div>
      )}

      {dashboard && (
        <>
          {/* Özet Kartlar */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">Toplam Harcama</p>
              <p className="mt-2 text-3xl font-bold text-brand-500">{para(dashboard.toplamHarcama)}</p>
              {dashboard.degisimYuzdesi !== 0 && (
                <span className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                  dashboard.degisimYuzdesi > 0
                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                }`}>
                  {dashboard.degisimYuzdesi > 0 ? '+' : ''}{dashboard.degisimYuzdesi.toFixed(1)}%
                </span>
              )}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">Nakit Harcama</p>
              <p className="mt-2 text-3xl font-bold text-gray-800 dark:text-white">{para(dashboard.nakitHarcama)}</p>
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-600 dark:bg-green-900/30 dark:text-green-400">
                Nakit
              </span>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">Kredi Kartı</p>
              <p className="mt-2 text-3xl font-bold text-gray-800 dark:text-white">{para(dashboard.krediKartiHarcama)}</p>
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600 dark:bg-red-900/30 dark:text-red-400">
                Kredi Kartı
              </span>
            </div>
          </div>

          {/* Alt satır: Kategori dağılımı + Son giderler */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Kategori Dağılımı */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white">
                Kategoriye Göre Harcamalar
              </h3>
              {dashboard.kategoriDagilimi.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-sm text-gray-400">Bu dönem için veri yok</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dashboard.kategoriDagilimi.map((kat) => (
                    <div key={kat.kategoriId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm"
                          style={{
                            backgroundColor: (kat.kategoriRenk || '#6366F1') + '20',
                            color: kat.kategoriRenk || '#6366F1',
                          }}
                        >
                          {kat.kategoriIkon || '💳'}
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{kat.kategoriAd}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-800 dark:text-white">{para(kat.toplam)}</span>
                        <span className="w-12 text-right text-xs text-gray-400">{kat.yuzde.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Son Giderler */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-800 dark:text-white">Son İşlemler</h3>
                <a href="/giderler" className="text-sm font-medium text-brand-500 hover:underline">Tümünü gör</a>
              </div>
              {sonGiderler.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-sm text-gray-400">Henüz gider girilmemiş</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sonGiderler.map((gider) => (
                    <div key={gider.id} className="flex items-center justify-between rounded-xl px-1 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm"
                          style={{
                            backgroundColor: (gider.kategori.renk || '#6366F1') + '20',
                            color: gider.kategori.renk || '#6366F1',
                          }}
                        >
                          {gider.kategori.ikon || '💳'}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-800 dark:text-white">
                            {gider.aciklama || gider.kategori.ad}
                          </p>
                          <p className="text-xs text-gray-400">
                            {format(new Date(gider.tarih), 'dd.MM.yyyy')}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-red-500 whitespace-nowrap">
                        -{para(gider.tutar)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
