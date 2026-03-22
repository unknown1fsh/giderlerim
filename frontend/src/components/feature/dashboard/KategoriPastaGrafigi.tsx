'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { KategoriHarcamaResponse } from '@/types/dashboard.types';

interface Props {
  veri: KategoriHarcamaResponse[];
}

const VARSAYILAN_RENKLER = [
  '#0F9B8E', '#38A169', '#D69E2E', '#3182CE', '#E53E3E',
  '#805AD5', '#00BCD4', '#DD6B20', '#68D391', '#F6AD55',
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: KategoriHarcamaResponse;
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="rounded-lg border border-border bg-bg-primary px-3 py-2 shadow-md shadow-black/[0.08]">
        <p className="text-sm font-semibold text-text-primary">{item.name}</p>
        <p className="text-sm text-text-muted">
          {item.value.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
        </p>
        <p className="text-xs text-accent">%{item.payload.yuzde.toFixed(1)}</p>
      </div>
    );
  }
  return null;
}

interface CustomLegendProps {
  payload?: Array<{
    value: string;
    color: string;
  }>;
}

function CustomLegend({ payload }: CustomLegendProps) {
  if (!payload) return null;
  return (
    <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
      {payload.map((entry, index) => (
        <li key={index} className="flex items-center gap-1.5">
          <div
            className="h-3 w-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-text-muted">{entry.value}</span>
        </li>
      ))}
    </ul>
  );
}

export function KategoriPastaGrafigi({ veri }: Props) {
  if (!veri || veri.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-text-muted text-sm">
        Veri bulunamadı
      </div>
    );
  }

  const chartData = veri.map((item) => ({
    name: item.kategoriAd,
    value: item.toplam,
    yuzde: item.yuzde,
    renk: item.kategoriRenk || VARSAYILAN_RENKLER[0],
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="45%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.renk !== '#000000' ? entry.renk : VARSAYILAN_RENKLER[index % VARSAYILAN_RENKLER.length]}
              stroke="transparent"
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
