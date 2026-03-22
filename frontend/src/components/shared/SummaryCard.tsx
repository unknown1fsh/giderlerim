import { clsx } from 'clsx';
import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  etiket: string;
  deger: string;
  trend?: { deger: number; yukariMi: boolean };
  ikon?: LucideIcon;
  renk?: 'mor' | 'yesil' | 'sari' | 'kirmizi' | 'mavi';
}

const renkMap = {
  mor: { bg: 'bg-accent/10', text: 'text-accent', ikon: 'text-accent' },
  yesil: { bg: 'bg-success/10', text: 'text-success', ikon: 'text-success' },
  sari: { bg: 'bg-warning/10', text: 'text-warning', ikon: 'text-warning' },
  kirmizi: { bg: 'bg-danger/10', text: 'text-danger', ikon: 'text-danger' },
  mavi: { bg: 'bg-info/10', text: 'text-info', ikon: 'text-info' },
};

export function SummaryCard({ etiket, deger, trend, ikon: Ikon, renk = 'mor' }: SummaryCardProps) {
  const renkler = renkMap[renk];
  return (
    <div className="rounded-xl border border-border bg-bg-primary p-5 shadow-sm shadow-black/[0.04]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-text-muted">{etiket}</p>
        {Ikon && (
          <div className={clsx('rounded-lg p-2', renkler.bg)}>
            <Ikon className={clsx('h-5 w-5', renkler.ikon)} />
          </div>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold text-text-primary">{deger}</p>
      {trend && (
        <p className={clsx('mt-1.5 text-xs font-medium', trend.yukariMi ? 'text-danger' : 'text-success')}>
          {trend.yukariMi ? '↑' : '↓'} %{Math.abs(trend.deger).toFixed(1)} geçen aya göre
        </p>
      )}
    </div>
  );
}
