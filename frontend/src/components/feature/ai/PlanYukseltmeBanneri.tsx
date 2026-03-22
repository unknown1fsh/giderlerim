'use client';

import Link from 'next/link';
import { Lock, Crown, Zap } from 'lucide-react';

interface Props {
  ozellik: string;
  aciklama: string;
  gerekliPlan?: 'PREMIUM' | 'ULTRA';
}

export function PlanYukseltmeBanneri({
  ozellik,
  aciklama,
  gerekliPlan = 'PREMIUM',
}: Props) {
  const isPremium = gerekliPlan === 'PREMIUM';

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="mb-6 relative">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-bg-tertiary border border-border">
          <Lock className="h-9 w-9 text-text-muted" />
        </div>
        <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-accent">
          {isPremium ? (
            <Zap className="h-4 w-4 text-white" />
          ) : (
            <Crown className="h-4 w-4 text-white" />
          )}
        </div>
      </div>

      <h3 className="text-xl font-bold text-text-primary mb-2">{ozellik}</h3>
      <p className="text-sm text-text-muted max-w-sm mb-2">{aciklama}</p>
      <p className="text-xs text-text-disabled mb-6">
        Bu özellik{' '}
        <span className="font-semibold text-accent">
          {isPremium ? 'Premium' : 'Ultra'}
        </span>{' '}
        plan gerektirir.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/ayarlar"
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-hover transition-colors"
        >
          {isPremium ? (
            <Zap className="h-4 w-4" />
          ) : (
            <Crown className="h-4 w-4" />
          )}
          {isPremium ? "Premium'a Geç" : "Ultra'ya Geç"}
        </Link>
        <Link
          href="/ayarlar"
          className="inline-flex items-center justify-center rounded-xl border border-border px-6 py-3 text-sm font-medium text-text-muted hover:bg-bg-secondary hover:text-text-primary transition-colors"
        >
          Planları Karşılaştır
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg">
        {(isPremium
          ? ['AI Sohbet Koç', 'Bütçe Önerileri', 'Tasarruf Analizi']
          : ['Anomali Tespiti', 'Gelişmiş Analizler', 'Öncelikli Destek']
        ).map((feature) => (
          <div
            key={feature}
            className="flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/5 px-3 py-2"
          >
            <div className="h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0" />
            <span className="text-xs text-text-muted">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
