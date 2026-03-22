'use client';

import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  AlertCircle,
  X,
  Wallet,
} from 'lucide-react';
import { clsx } from 'clsx';
import { PageContainer } from '@/components/shared/PageContainer';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { ButceIlerlemeBar } from '@/components/feature/butce/ButceIlerlemeBar';
import { useButceOzetler, useButceEkle, useButceSil } from '@/hooks/useButceler';
import { useKategoriler } from '@/hooks/useKategoriler';
import { ButceOlusturRequest } from '@/types/butce.types';

const AYLAR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

const formatPara = (tutar: number) =>
  tutar.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });

export default function ButcelerPage() {
  const bugun = new Date();
  const [ay, setAy] = useState(bugun.getMonth() + 1);
  const [yil, setYil] = useState(bugun.getFullYear());
  const [modalAcik, setModalAcik] = useState(false);
  const [silinecekId, setSilinecekId] = useState<number | null>(null);
  const [formHata, setFormHata] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<ButceOlusturRequest>>({
    ay,
    yil,
    uyariYuzdesi: 80,
  });

  const { data: ozetler, isLoading, isError, refetch } = useButceOzetler(ay, yil);
  const { data: kategoriler } = useKategoriler();
  const butceEkle = useButceEkle();
  const butceSil = useButceSil();

  const oncekiAy = () => {
    if (ay === 1) { setAy(12); setYil(yil - 1); }
    else setAy(ay - 1);
  };
  const sonrakiAy = () => {
    if (ay === 12) { setAy(1); setYil(yil + 1); }
    else setAy(ay + 1);
  };

  const handleEkle = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormHata(null);

    if (!form.kategoriId) {
      setFormHata('Kategori seçiniz.');
      return;
    }
    if (!form.limitTutar || form.limitTutar <= 0) {
      setFormHata('Geçerli bir limit tutarı girin.');
      return;
    }

    try {
      await butceEkle.mutateAsync({
        ...form,
        ay,
        yil,
      } as ButceOlusturRequest);
      setModalAcik(false);
      setForm({ ay, yil, uyariYuzdesi: 80 });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setFormHata(error?.response?.data?.message || 'Bütçe eklenemedi.');
    }
  };

  const handleSil = async () => {
    if (silinecekId === null) return;
    await butceSil.mutateAsync(silinecekId);
    setSilinecekId(null);
  };

  // Summary totals
  const toplamLimit = ozetler?.reduce((s, o) => s + o.limitTutar, 0) ?? 0;
  const toplamHarcanan = ozetler?.reduce((s, o) => s + o.harcananTutar, 0) ?? 0;
  const toplamKalan = toplamLimit - toplamHarcanan;

  return (
    <PageContainer>
      <PageHeader
        baslik="Bütçeler"
        altBaslik="Aylık harcama limitlerini belirleyin ve takip edin"
        eylem={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-border bg-bg-primary px-2 py-1.5 shadow-sm shadow-black/[0.04]">
              <button onClick={oncekiAy} className="rounded p-1 text-text-muted hover:bg-bg-secondary hover:text-text-primary transition-colors">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-[120px] text-center text-sm font-semibold text-text-primary">
                {AYLAR[ay - 1]} {yil}
              </span>
              <button onClick={sonrakiAy} className="rounded p-1 text-text-muted hover:bg-bg-secondary hover:text-text-primary transition-colors">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={() => setModalAcik(true)}
              className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Yeni Bütçe
            </button>
          </div>
        }
      />

      {isLoading && <LoadingState mesaj="Bütçeler yükleniyor..." />}
      {isError && <ErrorState mesaj="Bütçeler yüklenemedi" yenidenDene={refetch} />}

      {ozetler && ozetler.length === 0 && (
        <EmptyState
          ikon={Wallet}
          baslik="Bütçe bulunamadı"
          aciklama={`${AYLAR[ay - 1]} ${yil} için henüz bütçe tanımlanmamış.`}
          eylem={{ etiket: 'Bütçe Oluştur', onClick: () => setModalAcik(true) }}
        />
      )}

      {ozetler && ozetler.length > 0 && (
        <div className="space-y-4">
          {/* Özet Satırı */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-border bg-bg-primary p-4 shadow-sm shadow-black/[0.04]">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Toplam Limit</p>
              <p className="mt-1.5 text-xl font-bold text-text-primary">{formatPara(toplamLimit)}</p>
            </div>
            <div className="rounded-xl border border-border bg-bg-primary p-4 shadow-sm shadow-black/[0.04]">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Toplam Harcanan</p>
              <p className="mt-1.5 text-xl font-bold text-text-primary">{formatPara(toplamHarcanan)}</p>
            </div>
            <div className="rounded-xl border border-border bg-bg-primary p-4 shadow-sm shadow-black/[0.04]">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Toplam Kalan</p>
              <p className={clsx('mt-1.5 text-xl font-bold', toplamKalan < 0 ? 'text-danger' : 'text-success')}>
                {formatPara(toplamKalan)}
              </p>
            </div>
          </div>

          {/* Bütçe Tablosu */}
          <div className="rounded-xl border border-border bg-bg-primary shadow-sm shadow-black/[0.04] overflow-hidden">
            {/* Tablo Başlığı */}
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 border-b border-border bg-bg-secondary px-5 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Kategori</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted text-right w-24">Ayrılan</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted text-right w-24">Harcanan</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted text-right w-24">Kalan</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted w-32">İlerleme</p>
              <p className="w-8"></p>
            </div>

            {/* Tablo Satırları */}
            {ozetler.map((ozet, i) => {
              const yuzde = Math.min(ozet.kullanimYuzdesi, 100);
              const durumText = ozet.limitAsildi ? 'text-danger' : ozet.uyariEsigi ? 'text-warning' : 'text-success';

              return (
                <div
                  key={ozet.butceId}
                  className={clsx(
                    'grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 items-center px-5 py-4 transition-colors hover:bg-bg-secondary',
                    i < ozetler.length - 1 && 'border-b border-border/60'
                  )}
                >
                  {/* Kategori */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl flex-shrink-0">{ozet.kategori.ikon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text-primary truncate">{ozet.kategori.ad}</p>
                      <div className={clsx('inline-flex items-center gap-1 text-xs font-medium', durumText)}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {ozet.limitAsildi ? 'Aşıldı' : ozet.uyariEsigi ? 'Uyarı' : 'Normal'}
                      </div>
                    </div>
                  </div>

                  {/* Ayrılan */}
                  <div className="text-right w-24">
                    <p className="text-sm font-medium text-text-primary">{formatPara(ozet.limitTutar)}</p>
                  </div>

                  {/* Harcanan */}
                  <div className="text-right w-24">
                    <p className="text-sm font-medium text-text-primary">{formatPara(ozet.harcananTutar)}</p>
                  </div>

                  {/* Kalan */}
                  <div className="text-right w-24">
                    <p className={clsx('text-sm font-bold', ozet.kalanTutar < 0 ? 'text-danger' : 'text-success')}>
                      {formatPara(ozet.kalanTutar)}
                    </p>
                  </div>

                  {/* Progress */}
                  <div className="w-32">
                    <div className="flex items-center gap-2">
                      <ButceIlerlemeBar
                        yuzde={yuzde}
                        limitAsildi={ozet.limitAsildi}
                        uyariEsigi={ozet.uyariEsigi}
                        yukseklik="h-2"
                      />
                      <span className={clsx('text-xs font-semibold tabular-nums w-8 text-right flex-shrink-0', durumText)}>
                        %{Math.round(yuzde)}
                      </span>
                    </div>
                  </div>

                  {/* Sil */}
                  <div className="w-8 flex justify-center">
                    <button
                      onClick={() => setSilinecekId(ozet.butceId)}
                      className="rounded-lg p-1.5 text-text-muted hover:bg-danger/10 hover:text-danger transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Budget Modal */}
      {modalAcik && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-bg-primary shadow-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-text-primary">Yeni Bütçe Oluştur</h3>
              <button
                onClick={() => { setModalAcik(false); setFormHata(null); }}
                className="rounded-lg p-1 text-text-muted hover:bg-bg-secondary hover:text-text-primary transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formHata && (
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-danger/25 bg-danger/[0.08] px-3 py-2">
                <AlertCircle className="h-4 w-4 text-danger flex-shrink-0 mt-0.5" />
                <p className="text-xs text-danger">{formHata}</p>
              </div>
            )}

            <form onSubmit={handleEkle} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                  Kategori <span className="text-danger">*</span>
                </label>
                <select
                  value={form.kategoriId ?? ''}
                  onChange={(e) => setForm({ ...form, kategoriId: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full rounded-lg border border-border bg-bg-secondary px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 transition-colors"
                >
                  <option value="">Kategori Seçin</option>
                  {kategoriler?.map((k) => (
                    <option key={k.id} value={k.id}>{k.ikon} {k.ad}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                  Limit Tutarı (TRY) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  value={form.limitTutar ?? ''}
                  onChange={(e) => setForm({ ...form, limitTutar: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg border border-border bg-bg-secondary px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 transition-colors"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                  Uyarı Eşiği (%)
                </label>
                <input
                  type="number"
                  value={form.uyariYuzdesi ?? 80}
                  onChange={(e) => setForm({ ...form, uyariYuzdesi: parseInt(e.target.value) })}
                  min="1"
                  max="100"
                  className="w-full rounded-lg border border-border bg-bg-secondary px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 transition-colors"
                />
                <p className="mt-1 text-xs text-text-muted">
                  Limit&apos;in bu yüzdesine ulaşıldığında uyarı gönderilir
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setModalAcik(false); setFormHata(null); }}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-bg-secondary transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={butceEkle.isPending}
                  className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-60 transition-colors"
                >
                  {butceEkle.isPending && (
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  )}
                  Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        acik={silinecekId !== null}
        baslik="Bütçeyi Sil"
        mesaj="Bu bütçeyi silmek istediğinizden emin misiniz?"
        onayEtiket="Evet, Sil"
        onOnayla={handleSil}
        onIptal={() => setSilinecekId(null)}
      />
    </PageContainer>
  );
}
