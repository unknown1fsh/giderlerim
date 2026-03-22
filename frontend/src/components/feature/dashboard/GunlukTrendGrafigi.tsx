'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { GunlukHarcamaResponse } from '@/types/dashboard.types';

interface Props {
  veri: GunlukHarcamaResponse[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-bg-primary px-3 py-2 shadow-md shadow-black/[0.08]">
        <p className="text-xs text-text-muted mb-1">{label}</p>
        <p className="text-sm font-semibold text-text-primary">
          {payload[0].value.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
        </p>
      </div>
    );
  }
  return null;
}

export function GunlukTrendGrafigi({ veri }: Props) {
  if (!veri || veri.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-text-muted text-sm">
        Veri bulunamadı
      </div>
    );
  }

  const chartData = veri.map((item) => ({
    tarih: (() => {
      try {
        return format(parseISO(item.tarih), 'd MMM', { locale: tr });
      } catch {
        return item.tarih;
      }
    })(),
    toplam: item.toplam,
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="gradientTeal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0F9B8E" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#0F9B8E" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis
          dataKey="tarih"
          tick={{ fill: '#718096', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#718096', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) =>
            v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)
          }
          width={45}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="toplam"
          stroke="#0F9B8E"
          strokeWidth={2}
          fill="url(#gradientTeal)"
          dot={false}
          activeDot={{ r: 4, fill: '#0F9B8E', stroke: '#E6F7F5', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
