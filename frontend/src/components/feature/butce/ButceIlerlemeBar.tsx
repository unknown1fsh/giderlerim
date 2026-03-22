'use client';

import { clsx } from 'clsx';

interface Props {
  yuzde: number;
  limitAsildi?: boolean;
  uyariEsigi?: boolean;
  yukseklik?: string;
}

export function ButceIlerlemeBar({
  yuzde,
  limitAsildi = false,
  uyariEsigi = false,
  yukseklik = 'h-2',
}: Props) {
  const normalized = Math.min(Math.max(yuzde, 0), 100);

  const barRenk = limitAsildi
    ? 'bg-danger'
    : uyariEsigi
    ? 'bg-warning'
    : normalized >= 80
    ? 'bg-warning'
    : normalized >= 50
    ? 'bg-info'
    : 'bg-success';

  return (
    <div className={clsx('w-full rounded-full bg-bg-tertiary overflow-hidden', yukseklik)}>
      <div
        className={clsx('h-full rounded-full transition-all duration-300', barRenk)}
        style={{ width: `${normalized}%` }}
      />
    </div>
  );
}
