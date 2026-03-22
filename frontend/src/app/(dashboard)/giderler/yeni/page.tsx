'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { PageContainer } from '@/components/shared/PageContainer';
import { PageHeader } from '@/components/shared/PageHeader';
import { FormSection } from '@/components/shared/FormSection';
import { LoadingState } from '@/components/shared/LoadingState';
import { useGiderEkle } from '@/hooks/useGiderler';
import { useKategoriler } from '@/hooks/useKategoriler';
import { GiderOlusturRequest, OdemeYontemi } from '@/types/gider.types';
import { format } from 'date-fns';

const ODEME_YONTEMLERI: { deger: OdemeYontemi; etiket: string }[] = [
  { deger: 'NAKIT', etiket: 'Nakit' },
  { deger: 'KREDI_KARTI', etiket: 'Kredi Kartı' },
  { deger: 'BANKA_KARTI', etiket: 'Banka Kartı' },
  { deger: 'HAVALE', etiket: 'Havale' },
  { deger: 'DIGER', etiket: 'Diğer' },
];

export default function YeniGiderPage() {
  const router = useRouter();
  const giderEkle = useGiderEkle();
  const { data: kategoriler, isLoading: kategorilerYukleniyor } = useKategoriler();

  const [form, setForm] = useState<Partial<GiderOlusturRequest>>({
    tarih: format(new Date(), 'yyyy-MM-dd'),
    odemeYontemi: 'NAKIT',
    paraBirimi: 'TRY',
  });
  const [hata, setHata] = useState<string | null>(null);

  if (kategorilerYukleniyor) return <LoadingState mesaj="Kategoriler yükleniyor..." />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHata(null);

    if (!form.kategoriId) {
      setHata('Lütfen bir kategori seçin.');
      return;
    }
    if (!form.tutar || form.tutar <= 0) {
      setHata('Geçerli bir tutar girin.');
      return;
    }
    if (!form.tarih) {
      setHata('Tarih seçiniz.');
      return;
    }

    try {
      await giderEkle.mutateAsync(form as GiderOlusturRequest);
      router.push('/giderler');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setHata(error?.response?.data?.message || 'Gider eklenirken bir hata oluştu.');
    }
  };

  return (
    <PageContainer>
      <PageHeader
        baslik="Yeni Gider Ekle"
        altBaslik="Harcamanızı kaydedin"
        eylem={
          <Link
            href="/giderler"
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-text-muted hover:bg-bg-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Geri
          </Link>
        }
      />

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {hata && (
            <div className="flex items-start gap-3 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3">
              <AlertCircle className="h-5 w-5 text-danger flex-shrink-0 mt-0.5" />
              <p className="text-sm text-danger">{hata}</p>
            </div>
          )}

          <FormSection baslik="Gider Bilgileri" aciklama="Harcamanızın temel bilgilerini girin">
            {/* Kategori */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-muted">
                Kategori <span className="text-danger">*</span>
              </label>
              <select
                value={form.kategoriId ?? ''}
                onChange={(e) =>
                  setForm({ ...form, kategoriId: e.target.value ? Number(e.target.value) : undefined })
                }
                required
                className="w-full rounded-lg border border-border bg-bg-secondary px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
              >
                <option value="">Kategori Seçin</option>
                {kategoriler?.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.ikon} {k.ad}
                  </option>
                ))}
              </select>
            </div>

            {/* Tutar */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-muted">
                Tutar <span className="text-danger">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={form.tutar ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, tutar: e.target.value ? parseFloat(e.target.value) : undefined })
                  }
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                  className="flex-1 rounded-lg border border-border bg-bg-secondary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
                />
                <select
                  value={form.paraBirimi ?? 'TRY'}
                  onChange={(e) => setForm({ ...form, paraBirimi: e.target.value })}
                  className="w-24 rounded-lg border border-border bg-bg-secondary px-3 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none transition-colors"
                >
                  <option value="TRY">TRY</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>

            {/* Açıklama */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-muted">
                Açıklama
              </label>
              <input
                type="text"
                value={form.aciklama ?? ''}
                onChange={(e) => setForm({ ...form, aciklama: e.target.value })}
                placeholder="Örn: Market alışverişi"
                className="w-full rounded-lg border border-border bg-bg-secondary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
              />
            </div>

            {/* Tarih */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-muted">
                Tarih <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                value={form.tarih ?? ''}
                onChange={(e) => setForm({ ...form, tarih: e.target.value })}
                required
                className="w-full rounded-lg border border-border bg-bg-secondary px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
              />
            </div>

            {/* Ödeme Yöntemi */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-muted">
                Ödeme Yöntemi
              </label>
              <select
                value={form.odemeYontemi ?? 'NAKIT'}
                onChange={(e) => setForm({ ...form, odemeYontemi: e.target.value as OdemeYontemi })}
                className="w-full rounded-lg border border-border bg-bg-secondary px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
              >
                {ODEME_YONTEMLERI.map((y) => (
                  <option key={y.deger} value={y.deger}>
                    {y.etiket}
                  </option>
                ))}
              </select>
            </div>
          </FormSection>

          <FormSection baslik="Ek Bilgiler" aciklama="İsteğe bağlı notlar ekleyebilirsiniz">
            {/* Notlar */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-muted">
                Notlar
              </label>
              <textarea
                value={form.notlar ?? ''}
                onChange={(e) => setForm({ ...form, notlar: e.target.value })}
                placeholder="Bu harcama hakkında ek notlar..."
                rows={3}
                className="w-full rounded-lg border border-border bg-bg-secondary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors resize-none"
              />
            </div>
          </FormSection>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3">
            <Link
              href="/giderler"
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-muted hover:bg-bg-secondary hover:text-text-primary transition-colors"
            >
              İptal
            </Link>
            <button
              type="submit"
              disabled={giderEkle.isPending}
              className="flex items-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {giderEkle.isPending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {giderEkle.isPending ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
