'use client';

import React from 'react';
import { format } from 'date-fns';
import {
  useUyarilar,
  useUyariOkundu,
  useUyariTumunuOkundu,
  useUyariSil,
} from '@/hooks/useUyarilar';
import type { UyariResponse, UyariTuru } from '@/types/uyari.types';

const UYARI_RENK: Record<UyariTuru, string> = {
  BUTCE_ASIMI: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  BUTCE_YAKLASIYOR: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  ANORMAL_HARCAMA: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  GIZLI_KACINAK: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  TASARRUF_FIRSATI: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  AYLIK_OZET: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
};

const UYARI_IKON: Record<UyariTuru, string> = {
  BUTCE_ASIMI: '🚨',
  BUTCE_YAKLASIYOR: '⚠️',
  ANORMAL_HARCAMA: '🔍',
  GIZLI_KACINAK: '👁️',
  TASARRUF_FIRSATI: '💡',
  AYLIK_OZET: '📊',
};

const UYARI_AD: Record<UyariTuru, string> = {
  BUTCE_ASIMI: 'Bütçe Aşımı',
  BUTCE_YAKLASIYOR: 'Bütçe Yaklaşıyor',
  ANORMAL_HARCAMA: 'Anormal Harcama',
  GIZLI_KACINAK: 'Gizli Kaçınak',
  TASARRUF_FIRSATI: 'Tasarruf Fırsatı',
  AYLIK_OZET: 'Aylık Özet',
};

export default function UyarilarPage() {
  const { data: uyarilar, isLoading, isError } = useUyarilar();
  const okunduIsaretle = useUyariOkundu();
  const tumunuOkundu = useUyariTumunuOkundu();
  const sil = useUyariSil();

  const okunmamisSayisi = uyarilar?.filter((u: UyariResponse) => !u.okunduMu).length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Uyarılar</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Sistem bildirimleri ve finansal uyarılar
            {okunmamisSayisi > 0 && (
              <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {okunmamisSayisi}
              </span>
            )}
          </p>
        </div>
        {okunmamisSayisi > 0 && (
          <button
            onClick={() => tumunuOkundu.mutate()}
            disabled={tumunuOkundu.isPending}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-60 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Tümünü Okundu İşaretle
          </button>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500" />
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          Uyarılar yüklenemedi.
        </div>
      )}

      {!isLoading && !isError && (
        <div className="space-y-3">
          {(!uyarilar || uyarilar.length === 0) ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white py-16 text-center dark:border-gray-700 dark:bg-gray-800">
              <span className="mb-3 text-4xl">🎉</span>
              <p className="text-gray-500 dark:text-gray-400">Hiç uyarı yok</p>
            </div>
          ) : (
            uyarilar.map((u: UyariResponse) => (
              <div
                key={u.id}
                className={`flex items-start gap-4 rounded-xl border p-4 transition-colors ${
                  u.okunduMu
                    ? 'border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800'
                    : 'border-brand-200 bg-brand-50/50 dark:border-brand-700 dark:bg-brand-900/10'
                }`}
              >
                <div className={`flex-shrink-0 rounded-xl p-2.5 text-lg ${UYARI_RENK[u.tur]}`}>
                  {UYARI_IKON[u.tur]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800 dark:text-white">{u.baslik}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${UYARI_RENK[u.tur]}`}>
                      {UYARI_AD[u.tur]}
                    </span>
                    {!u.okunduMu && (
                      <span className="h-2 w-2 rounded-full bg-brand-500" />
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{u.mesaj}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {format(new Date(u.createdAt), 'dd.MM.yyyy HH:mm')}
                  </p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-1">
                  {!u.okunduMu && (
                    <button
                      onClick={() => okunduIsaretle.mutate(u.id)}
                      title="Okundu işaretle"
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-brand-500 dark:hover:bg-gray-700 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => sil.mutate(u.id)}
                    title="Sil"
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
