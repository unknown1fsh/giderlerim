'use client';

import { clsx } from 'clsx';
import { ButceOzetResponse } from '@/types/butce.types';
import { ButceIlerlemeBar } from '@/components/feature/butce/ButceIlerlemeBar';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface Props {
  ozetler: ButceOzetResponse[];
}

export function ButceDurumKartlari({ ozetler }: Props) {
  if (!ozetler || ozetler.length === 0) {
    return (
      <div className="text-center py-8 text-text-muted text-sm">
        Bu ay için bütçe tanımlanmamış
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {ozetler.map((ozet) => {
        const yuzde = Math.min(ozet.kullanımYuzdesi ?? 0, 100);
        const durumRenk = ozet.limitAsildi
          ? 'text-danger'
          : ozet.uyariEsigi
          ? 'text-warning'
          : 'text-success';

        return (
          <div
            key={ozet.butceId}
            className="rounded-lg border border-border bg-bg-secondary p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-base">{ozet.kategori.ikon}</span>
                <span className="text-sm font-medium text-text-primary">
                  {ozet.kategori.ad}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {ozet.limitAsildi ? (
                  <AlertTriangle className="h-4 w-4 text-danger" />
                ) : (
                  <CheckCircle className={clsx('h-4 w-4', durumRenk)} />
                )}
                <span className={clsx('text-xs font-semibold', durumRenk)}>
                  %{(ozet.kullanımYuzdesi ?? 0).toFixed(0)}
                </span>
              </div>
            </div>
            <ButceIlerlemeBar yuzde={yuzde} limitAsildi={ozet.limitAsildi} uyariEsigi={ozet.uyariEsigi} />
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-text-muted">
                {ozet.harcananTutar.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
              </span>
              <span className="text-xs text-text-muted">
                {ozet.limitTutar.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
