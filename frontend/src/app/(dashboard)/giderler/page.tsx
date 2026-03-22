'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  Plus,
  Trash2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { PageContainer } from '@/components/shared/PageContainer';
import { PageHeader } from '@/components/shared/PageHeader';
import { FilterPanel } from '@/components/shared/FilterPanel';
import { DataTable } from '@/components/shared/DataTable';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useGiderler, useGiderSil } from '@/hooks/useGiderler';
import { useKategoriler } from '@/hooks/useKategoriler';
import { GiderFiltre, GiderResponse, OdemeYontemi } from '@/types/gider.types';

const ODEME_YONTEMLERI: { deger: OdemeYontemi; etiket: string }[] = [
  { deger: 'NAKIT', etiket: 'Nakit' },
  { deger: 'KREDI_KARTI', etiket: 'Kredi Kartı' },
  { deger: 'BANKA_KARTI', etiket: 'Banka Kartı' },
  { deger: 'HAVALE', etiket: 'Havale' },
  { deger: 'DIGER', etiket: 'Diğer' },
];

export default function GiderlerPage() {
  const [filtreler, setFiltreler] = useState<GiderFiltre>({ page: 0, size: 20 });
  const [silinecekId, setSilinecekId] = useState<number | null>(null);
  const [filtrePanelAcik, setFiltrePanelAcik] = useState(false);

  const { data: sayfaliVeri, isLoading, error } = useGiderler(filtreler);
  const { data: kategoriler } = useKategoriler();
  const giderSil = useGiderSil();

  const giderler = sayfaliVeri?.icerik ?? [];
  const toplamSayfa = sayfaliVeri?.toplamSayfa ?? 0;
  const mevcutSayfa = filtreler.page ?? 0;

  const handleSil = async () => {
    if (silinecekId === null) return;
    await giderSil.mutateAsync(silinecekId);
    setSilinecekId(null);
  };

  const sutunlar = [
    {
      baslik: 'Tarih',
      render: (g: GiderResponse) => {
        try {
          return (
            <span className="text-text-muted">
              {format(parseISO(g.tarih), 'd MMM yyyy', { locale: tr })}
            </span>
          );
        } catch {
          return <span className="text-text-muted">{g.tarih}</span>;
        }
      },
      genislik: 'w-28',
    },
    {
      baslik: 'Açıklama',
      render: (g: GiderResponse) => (
        <div className="flex items-center gap-2">
          <span>{g.aciklama || '-'}</span>
          {g.anormalMi && (
            <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0" title="Anormal harcama" />
          )}
        </div>
      ),
    },
    {
      baslik: 'Kategori',
      render: (g: GiderResponse) => (
        <div className="flex items-center gap-1.5">
          <span>{g.kategori.ikon}</span>
          <span
            className="rounded-full px-2 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: g.kategori.renk + '20',
              color: g.kategori.renk,
            }}
          >
            {g.kategori.ad}
          </span>
        </div>
      ),
    },
    {
      baslik: 'Tutar',
      render: (g: GiderResponse) => (
        <span className="font-semibold text-danger">
          -{g.tutar.toLocaleString('tr-TR', { style: 'currency', currency: g.paraBirimi })}
        </span>
      ),
      genislik: 'w-32',
    },
    {
      baslik: 'Ödeme',
      render: (g: GiderResponse) => {
        const etiketler: Record<OdemeYontemi, string> = {
          NAKIT: 'Nakit',
          KREDI_KARTI: 'Kredi Kartı',
          BANKA_KARTI: 'Banka Kartı',
          HAVALE: 'Havale',
          DIGER: 'Diğer',
        };
        return (
          <span className="text-xs text-text-muted">
            {etiketler[g.odemeYontemi] ?? g.odemeYontemi}
          </span>
        );
      },
      genislik: 'w-28',
    },
    {
      baslik: 'İşlemler',
      render: (g: GiderResponse) => (
        <button
          onClick={() => setSilinecekId(g.id)}
          className="rounded-lg p-1.5 text-text-muted hover:bg-danger/10 hover:text-danger transition-colors"
          title="Sil"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ),
      genislik: 'w-20',
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        baslik="Giderler"
        altBaslik="Tüm harcamalarınızı görüntüleyin ve yönetin"
        eylem={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFiltrePanelAcik(!filtrePanelAcik)}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-text-muted hover:bg-bg-secondary hover:text-text-primary transition-colors"
            >
              <Filter className="h-4 w-4" />
              Filtrele
            </button>
            <Link
              href="/giderler/yeni"
              className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover transition-colors"
            >
              <Plus className="h-4 w-4" />
              Yeni Gider
            </Link>
          </div>
        }
      />

      {/* Filter Panel */}
      {filtrePanelAcik && (
        <div className="mb-4">
          <FilterPanel>
            {/* Kategori */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-text-muted">Kategori</label>
              <select
                value={filtreler.kategoriId ?? ''}
                onChange={(e) =>
                  setFiltreler({
                    ...filtreler,
                    kategoriId: e.target.value ? Number(e.target.value) : undefined,
                    page: 0,
                  })
                }
                className="rounded-lg border border-border bg-bg-secondary px-3 py-1.5 text-sm text-text-primary focus:border-accent focus:outline-none"
              >
                <option value="">Tümü</option>
                {kategoriler?.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.ikon} {k.ad}
                  </option>
                ))}
              </select>
            </div>

            {/* Ödeme Yöntemi */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-text-muted">Ödeme Yöntemi</label>
              <select
                value={filtreler.odemeYontemi ?? ''}
                onChange={(e) =>
                  setFiltreler({
                    ...filtreler,
                    odemeYontemi: (e.target.value as OdemeYontemi) || undefined,
                    page: 0,
                  })
                }
                className="rounded-lg border border-border bg-bg-secondary px-3 py-1.5 text-sm text-text-primary focus:border-accent focus:outline-none"
              >
                <option value="">Tümü</option>
                {ODEME_YONTEMLERI.map((y) => (
                  <option key={y.deger} value={y.deger}>
                    {y.etiket}
                  </option>
                ))}
              </select>
            </div>

            {/* Başlangıç Tarihi */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-text-muted">Başlangıç</label>
              <input
                type="date"
                value={filtreler.baslangicTarihi ?? ''}
                onChange={(e) =>
                  setFiltreler({ ...filtreler, baslangicTarihi: e.target.value || undefined, page: 0 })
                }
                className="rounded-lg border border-border bg-bg-secondary px-3 py-1.5 text-sm text-text-primary focus:border-accent focus:outline-none"
              />
            </div>

            {/* Bitiş Tarihi */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-text-muted">Bitiş</label>
              <input
                type="date"
                value={filtreler.bitisTarihi ?? ''}
                onChange={(e) =>
                  setFiltreler({ ...filtreler, bitisTarihi: e.target.value || undefined, page: 0 })
                }
                className="rounded-lg border border-border bg-bg-secondary px-3 py-1.5 text-sm text-text-primary focus:border-accent focus:outline-none"
              />
            </div>

            {/* Reset */}
            <div className="flex items-end">
              <button
                onClick={() => setFiltreler({ page: 0, size: 20 })}
                className="rounded-lg border border-border px-3 py-1.5 text-sm text-text-muted hover:bg-bg-secondary hover:text-text-primary transition-colors"
              >
                Sıfırla
              </button>
            </div>
          </FilterPanel>
        </div>
      )}

      <DataTable
        sutunlar={sutunlar}
        veri={giderler}
        yukleniyorMu={isLoading}
        hata={error as Error | null}
        bosMetin="Henüz gider girilmemiş. İlk giderinizi ekleyin."
      />

      {/* Pagination */}
      {toplamSayfa > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-text-muted">
            Toplam {sayfaliVeri?.toplamEleman ?? 0} kayıt
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFiltreler({ ...filtreler, page: mevcutSayfa - 1 })}
              disabled={mevcutSayfa === 0}
              className="rounded-lg border border-border p-2 text-text-muted hover:bg-bg-secondary disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-text-primary">
              {mevcutSayfa + 1} / {toplamSayfa}
            </span>
            <button
              onClick={() => setFiltreler({ ...filtreler, page: mevcutSayfa + 1 })}
              disabled={mevcutSayfa >= toplamSayfa - 1}
              className="rounded-lg border border-border p-2 text-text-muted hover:bg-bg-secondary disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        acik={silinecekId !== null}
        baslik="Gideri Sil"
        mesaj="Bu gideri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        onayEtiket="Evet, Sil"
        onOnayla={handleSil}
        onIptal={() => setSilinecekId(null)}
      />
    </PageContainer>
  );
}
