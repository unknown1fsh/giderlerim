'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services/adminService';
import Link from 'next/link';

const StatKart = ({
  baslik,
  deger,
  alt,
  renk,
}: {
  baslik: string;
  deger: string | number;
  alt?: string;
  renk: string;
}) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
    <p className="text-sm text-gray-500 dark:text-gray-400">{baslik}</p>
    <p className={`mt-1 text-3xl font-bold ${renk}`}>{deger}</p>
    {alt && <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{alt}</p>}
  </div>
);

export default function AdminPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'istatistikler'],
    queryFn: () => adminService.istatistikleriGetir(),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
        İstatistikler yüklenirken hata oluştu.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Admin Paneli</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Sistem geneli istatistikler</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/kullanicilar"
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
          >
            Kullanıcılar
          </Link>
          <Link
            href="/admin/destek-talepleri"
            className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700 hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300 transition-colors"
          >
            Destek Talepleri
            {data && data.acikDestekTalebiSayisi > 0 && (
              <span className="ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-orange-500 px-1 text-xs font-bold text-white">
                {data.acikDestekTalebiSayisi}
              </span>
            )}
          </Link>
          <Link
            href="/admin/sistem-parametreleri"
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 transition-colors"
          >
            Sistem Parametreleri
          </Link>
        </div>
      </div>

      {/* Kullanıcı İstatistikleri */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-700 dark:text-gray-300">Kullanıcılar</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <StatKart baslik="Toplam Kullanıcı" deger={data.toplamKullanici} renk="text-gray-800 dark:text-white" />
          <StatKart baslik="Aktif Kullanıcı" deger={data.aktifKullanici} renk="text-green-600 dark:text-green-400" />
          <StatKart baslik="Silinmiş Kullanıcı" deger={data.silinenKullanici} renk="text-red-500 dark:text-red-400" />
          <StatKart baslik="Admin Kullanıcı" deger={data.adminKullanici} renk="text-purple-600 dark:text-purple-400" />
        </div>
      </div>

      {/* Plan Dağılımı */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-700 dark:text-gray-300">Plan Dağılımı</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">Ücretsiz</p>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                FREE
              </span>
            </div>
            <p className="mt-1 text-3xl font-bold text-gray-800 dark:text-white">{data.freeKullanici}</p>
            {data.toplamKullanici > 0 && (
              <p className="mt-1 text-xs text-gray-400">
                %{Math.round((data.freeKullanici / data.toplamKullanici) * 100)}
              </p>
            )}
          </div>
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900 dark:bg-blue-950">
            <div className="flex items-center justify-between">
              <p className="text-sm text-blue-600 dark:text-blue-400">Pro</p>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                PREMIUM
              </span>
            </div>
            <p className="mt-1 text-3xl font-bold text-blue-700 dark:text-blue-300">{data.premiumKullanici}</p>
            {data.toplamKullanici > 0 && (
              <p className="mt-1 text-xs text-blue-500">
                %{Math.round((data.premiumKullanici / data.toplamKullanici) * 100)}
              </p>
            )}
          </div>
          <div className="rounded-2xl border border-purple-200 bg-purple-50 p-5 dark:border-purple-900 dark:bg-purple-950">
            <div className="flex items-center justify-between">
              <p className="text-sm text-purple-600 dark:text-purple-400">Ultra</p>
              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                ULTRA
              </span>
            </div>
            <p className="mt-1 text-3xl font-bold text-purple-700 dark:text-purple-300">{data.ultraKullanici}</p>
            {data.toplamKullanici > 0 && (
              <p className="mt-1 text-xs text-purple-500">
                %{Math.round((data.ultraKullanici / data.toplamKullanici) * 100)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Kullanım İstatistikleri */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-700 dark:text-gray-300">Kullanım</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <StatKart baslik="Toplam Gider" deger={data.toplamGiderSayisi.toLocaleString('tr-TR')} renk="text-gray-800 dark:text-white" />
          <StatKart
            baslik="Toplam Gider Tutarı"
            deger={data.toplamGiderTutari.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
            renk="text-brand-600 dark:text-brand-400"
          />
          <StatKart baslik="Toplam Bütçe" deger={data.toplamButceSayisi.toLocaleString('tr-TR')} renk="text-gray-800 dark:text-white" />
          <StatKart baslik="AI Oturum" deger={data.toplamAiOturumSayisi.toLocaleString('tr-TR')} renk="text-gray-800 dark:text-white" />
          <StatKart baslik="AI Mesaj" deger={data.toplamAiMesajSayisi.toLocaleString('tr-TR')} renk="text-gray-800 dark:text-white" />
          <StatKart baslik="CSV Yükleme" deger={data.toplamCsvYuklemeSayisi.toLocaleString('tr-TR')} renk="text-gray-800 dark:text-white" />
          <StatKart baslik="Belge Yükleme" deger={data.toplamBelgeYuklemeSayisi.toLocaleString('tr-TR')} renk="text-gray-800 dark:text-white" />
          <StatKart
            baslik="Uyarılar"
            deger={data.toplamUyariSayisi.toLocaleString('tr-TR')}
            alt={`${data.okunmamisUyariSayisi} okunmamış`}
            renk="text-gray-800 dark:text-white"
          />
          <StatKart
            baslik="Destek Talepleri"
            deger={data.toplamDestekTalebiSayisi.toLocaleString('tr-TR')}
            alt={`${data.acikDestekTalebiSayisi} açık talep`}
            renk="text-orange-600 dark:text-orange-400"
          />
        </div>
      </div>
    </div>
  );
}
