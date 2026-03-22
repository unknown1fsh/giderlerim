import { LoadingState } from './LoadingState';
import { EmptyState } from './EmptyState';
import { Inbox } from 'lucide-react';

interface Sutun<T> {
  baslik: string;
  render: (satir: T) => React.ReactNode;
  genislik?: string;
}

interface DataTableProps<T> {
  sutunlar: Sutun<T>[];
  veri: T[];
  yukleniyorMu: boolean;
  hata?: Error | null;
  bosMetin?: string;
}

export function DataTable<T extends { id: number }>({
  sutunlar,
  veri,
  yukleniyorMu,
  hata,
  bosMetin = 'Kayıt bulunamadı',
}: DataTableProps<T>) {
  if (yukleniyorMu) return <LoadingState />;
  if (hata) return <div className="py-8 text-center text-danger">Veri yüklenemedi</div>;
  if (!veri.length)
    return <EmptyState ikon={Inbox} baslik="Kayıt yok" aciklama={bosMetin} />;

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-bg-primary shadow-sm shadow-black/[0.04]">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-bg-secondary">
            {sutunlar.map((s, i) => (
              <th
                key={i}
                className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted ${s.genislik ?? ''}`}
              >
                {s.baslik}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {veri.map((satir, i) => (
            <tr
              key={satir.id}
              className={`border-b border-border/60 transition-colors hover:bg-accent/[0.03] ${i % 2 === 0 ? 'bg-bg-primary' : 'bg-bg-secondary/40'}`}
            >
              {sutunlar.map((s, j) => (
                <td key={j} className="px-4 py-3 text-sm text-text-primary">
                  {s.render(satir)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
