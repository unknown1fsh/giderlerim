'use client';

import React from 'react';
import Link from 'next/link';
import { shopierOdemeUrlForPlanKapisi } from '@/config/shopier';
import { useAuthStore } from '@/stores/authStore';
import { PlanTuru } from '@/types/kullanici.types';

const PLAN_SIRALAMA: Record<PlanTuru, number> = {
  FREE: 0,
  PREMIUM: 1,
  ULTRA: 2,
};

const PLAN_GORUNEN_AD: Record<PlanTuru, string> = {
  FREE: 'Ücretsiz',
  PREMIUM: 'Pro',
  ULTRA: 'Ultra',
};

interface PlanKapisiProps {
  gerekliPlan: 'PREMIUM' | 'ULTRA';
  children: React.ReactNode;
}

export default function PlanKapisi({ gerekliPlan, children }: PlanKapisiProps) {
  const { kullanici } = useAuthStore();
  const mevcutPlan = kullanici?.plan ?? 'FREE';

  const yetkiliMi = PLAN_SIRALAMA[mevcutPlan] >= PLAN_SIRALAMA[gerekliPlan];

  if (yetkiliMi) return <>{children}</>;

  const odemeUrl = shopierOdemeUrlForPlanKapisi(gerekliPlan);
  const planSayfasi = '/plan';
  const disOdeme = Boolean(odemeUrl);

  return (
    <div className="relative min-h-[400px] overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      {/* Blurred background hint */}
      <div className="pointer-events-none select-none blur-sm opacity-40 p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-gray-200 dark:bg-gray-700" style={{ width: `${60 + i * 8}%` }} />
          ))}
        </div>
      </div>
      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-8 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-900/30">
          <svg className="h-8 w-8 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
          {PLAN_GORUNEN_AD[gerekliPlan]} Planı Gerekiyor
        </h3>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Bu özelliği kullanmak için{' '}
          <span className="font-semibold text-brand-500">{PLAN_GORUNEN_AD[gerekliPlan]}</span>{' '}
          planına yükseltmeniz gerekiyor.
          <br />
          Şu anki planınız: <span className="font-medium">{PLAN_GORUNEN_AD[mevcutPlan]}</span>
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
          {disOdeme ? (
            <>
              <a
                href={odemeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
              >
                Shopier ile öde
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              <Link
                href={planSayfasi}
                className="text-sm font-medium text-brand-600 underline hover:no-underline dark:text-brand-400"
              >
                Tüm plan seçenekleri
              </Link>
            </>
          ) : (
            <Link
              href={planSayfasi}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
            >
              Plan seç ve satın al
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
