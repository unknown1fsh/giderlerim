'use client';

import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  Bell,
  AlertTriangle,
  TrendingDown,
  PiggyBank,
  BarChart3,
  Trash2,
  CheckCheck,
  BellOff,
} from 'lucide-react';
import { PageContainer } from '@/components/shared/PageContainer';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import {
  useUyarilar,
  useUyariOkundu,
  useUyariTumunuOkundu,
  useUyariSil,
} from '@/hooks/useUyarilar';
import { useUyariStore } from '@/stores/uyariStore';
import { UyariResponse, UyariTuru } from '@/types/uyari.types';
import { clsx } from 'clsx';

const uyariIkon = (tur: UyariTuru) => {
  switch (tur) {
    case 'BUTCE_ASIMI': return AlertTriangle;
    case 'BUTCE_YAKLASIYOR': return Bell;
    case 'ANORMAL_HARCAMA': return TrendingDown;
    case 'GIZLI_KACINAK': return TrendingDown;
    case 'TASARRUF_FIRSATI': return PiggyBank;
    case 'AYLIK_OZET': return BarChart3;
    default: return Bell;
  }
};

const uyariRenk = (tur: UyariTuru) => {
  switch (tur) {
    case 'BUTCE_ASIMI': return { icon: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/20' };
    case 'BUTCE_YAKLASIYOR': return { icon: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20' };
    case 'ANORMAL_HARCAMA': return { icon: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20' };
    case 'GIZLI_KACINAK': return { icon: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/20' };
    case 'TASARRUF_FIRSATI': return { icon: 'text-success', bg: 'bg-success/10', border: 'border-success/20' };
    case 'AYLIK_OZET': return { icon: 'text-info', bg: 'bg-info/10', border: 'border-info/20' };
    default: return { icon: 'text-text-muted', bg: 'bg-bg-tertiary', border: 'border-border' };
  }
};

function UyariKart({ uyari }: { uyari: UyariResponse }) {
  const okunduIsaretle = useUyariOkundu();
  const uyariSil = useUyariSil();
  const { azalt } = useUyariStore();

  const Ikon = uyariIkon(uyari.tur);
  const renk = uyariRenk(uyari.tur);

  const handleOkundu = async () => {
    if (!uyari.okunduMu) {
      await okunduIsaretle.mutateAsync(uyari.id);
      azalt();
    }
  };

  const handleSil = async () => {
    await uyariSil.mutateAsync(uyari.id);
    if (!uyari.okunduMu) azalt();
  };

  return (
    <div
      className={clsx(
        'flex items-start gap-4 rounded-xl border p-4 transition-colors',
        renk.border,
        uyari.okunduMu ? 'bg-bg-primary opacity-60' : 'bg-bg-primary'
      )}
    >
      <div className={clsx('mt-0.5 rounded-lg p-2 flex-shrink-0', renk.bg)}>
        <Ikon className={clsx('h-5 w-5', renk.icon)} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-text-primary">{uyari.baslik}</h3>
            {!uyari.okunduMu && (
              <span className="h-2 w-2 rounded-full bg-accent flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-text-disabled flex-shrink-0">
            {(() => {
              try {
                return format(parseISO(uyari.createdAt), 'd MMM, HH:mm', { locale: tr });
              } catch {
                return '';
              }
            })()}
          </p>
        </div>
        <p className="mt-1 text-sm text-text-muted leading-relaxed">{uyari.mesaj}</p>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        {!uyari.okunduMu && (
          <button
            onClick={handleOkundu}
            disabled={okunduIsaretle.isPending}
            className="rounded-lg p-1.5 text-text-muted hover:bg-success/10 hover:text-success transition-colors"
            title="Okundu işaretle"
          >
            <CheckCheck className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={handleSil}
          disabled={uyariSil.isPending}
          className="rounded-lg p-1.5 text-text-muted hover:bg-danger/10 hover:text-danger transition-colors"
          title="Sil"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function UyarilarPage() {
  const { data: uyarilar, isLoading, isError, refetch } = useUyarilar();
  const tumunuOkundu = useUyariTumunuOkundu();
  const { sifirla } = useUyariStore();

  if (isLoading) return <PageContainer><LoadingState mesaj="Uyarılar yükleniyor..." /></PageContainer>;
  if (isError) return <PageContainer><ErrorState mesaj="Uyarılar yüklenemedi" yenidenDene={refetch} /></PageContainer>;

  const okunmamislar = uyarilar?.filter((u) => !u.okunduMu) ?? [];
  const okunanlar = uyarilar?.filter((u) => u.okunduMu) ?? [];

  const handleTumunuOkundu = async () => {
    await tumunuOkundu.mutateAsync();
    sifirla();
  };

  return (
    <PageContainer>
      <PageHeader
        baslik="Uyarılar"
        altBaslik="Bütçe ve harcama uyarılarınızı buradan takip edin"
        eylem={
          okunmamislar.length > 0 ? (
            <button
              onClick={handleTumunuOkundu}
              disabled={tumunuOkundu.isPending}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-text-muted hover:bg-bg-primary hover:text-text-primary transition-colors"
            >
              <CheckCheck className="h-4 w-4" />
              Tümünü Okundu İşaretle
            </button>
          ) : undefined
        }
      />

      {!uyarilar || uyarilar.length === 0 ? (
        <EmptyState
          ikon={BellOff}
          baslik="Uyarı yok"
          aciklama="Şu an için herhangi bir uyarı bulunmuyor."
        />
      ) : (
        <div className="space-y-6">
          {/* Okunmamış */}
          {okunmamislar.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-semibold text-text-primary">Okunmamış</h2>
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-bold text-white">
                  {okunmamislar.length}
                </span>
              </div>
              <div className="space-y-2">
                {okunmamislar.map((uyari) => (
                  <UyariKart key={uyari.id} uyari={uyari} />
                ))}
              </div>
            </div>
          )}

          {/* Okunanlar */}
          {okunanlar.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-text-muted mb-3">Okunmuş</h2>
              <div className="space-y-2">
                {okunanlar.map((uyari) => (
                  <UyariKart key={uyari.id} uyari={uyari} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
}
