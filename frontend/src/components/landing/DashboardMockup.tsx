import type { CSSProperties } from 'react';

const BAR_HEIGHTS = [45, 70, 30, 85, 55, 90, 60];

export function DashboardMockup() {
  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="absolute inset-0 rounded-2xl bg-brand-500/15 blur-2xl scale-95 animate-glow-pulse motion-reduce:shadow-none motion-reduce:animate-none" />
      <div className="relative rounded-2xl border border-white/10 bg-[#0f1628]/90 backdrop-blur-md shadow-2xl overflow-hidden animate-float motion-reduce:animate-none">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <span className="text-xs text-gray-400 font-medium">Örnek panel — Nisan 2026</span>
          <div className="w-16" />
        </div>
        <p className="px-5 pt-3 text-[10px] text-gray-500">Gösterim amaçlı örnek veriler</p>
        <div className="p-5 pt-2 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Toplam', value: '₺8.240', color: 'text-brand-400', bg: 'bg-brand-500/10' },
              { label: 'Nakit', value: '₺2.100', color: 'text-green-400', bg: 'bg-green-500/10' },
              { label: 'K. Kartı', value: '₺6.140', color: 'text-red-400', bg: 'bg-red-500/10' },
            ].map((stat) => (
              <div key={stat.label} className={`rounded-xl ${stat.bg} p-3`}>
                <p className="text-[10px] text-gray-400 mb-1">{stat.label}</p>
                <p className={`text-sm font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-white/5 p-3">
            <p className="text-[10px] text-gray-400 mb-3">Haftalık harcama</p>
            <div className="flex items-end gap-1.5 h-12">
              {BAR_HEIGHTS.map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="landing-chart-bar w-full rounded-sm origin-bottom"
                    style={
                      {
                        height: `${h}%`,
                        background: i === 5 ? '#465fff' : 'rgba(70,95,255,0.3)',
                        '--bar-delay': `${i * 0.08}s`,
                      } as CSSProperties
                    }
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-1.5 mt-1.5">
              {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((d) => (
                <p key={d} className="flex-1 text-center text-[8px] text-gray-500">
                  {d}
                </p>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            {[
              { icon: '🛒', name: 'Market', amount: '-₺340', cat: 'Gıda' },
              { icon: '⛽', name: 'Benzin', amount: '-₺650', cat: 'Ulaşım' },
              { icon: '🎬', name: 'Netflix', amount: '-₺170', cat: 'Eğlence' },
            ].map((tx) => (
              <div key={tx.name} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{tx.icon}</span>
                  <div>
                    <p className="text-[11px] font-medium text-white">{tx.name}</p>
                    <p className="text-[9px] text-gray-500">{tx.cat}</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-red-400">{tx.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
