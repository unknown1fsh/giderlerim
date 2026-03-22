'use client';

import { useState, useRef, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  FileUp,
  FileText,
  FileImage,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  History,
  FileSpreadsheet,
  Sparkles,
} from 'lucide-react';
import { PageContainer } from '@/components/shared/PageContainer';
import { PageHeader } from '@/components/shared/PageHeader';
import { PlanYukseltmeBanneri } from '@/components/feature/ai/PlanYukseltmeBanneri';
import { belgeService, BelgeYuklemeResponse } from '@/services/belgeService';
import { useAuthStore } from '@/stores/authStore';
import { clsx } from 'clsx';
import { useQuery } from '@tanstack/react-query';

const KABUL_EDILEN_UZANTILAR = ['.csv', '.xlsx', '.xls', '.pdf', '.jpg', '.jpeg', '.png', '.bmp'];
const MAX_BOYUT = 15 * 1024 * 1024; // 15MB

const FORMAT_LISTESI = [
  {
    uzantilar: ['CSV', 'XLSX'],
    ikon: FileSpreadsheet,
    renk: 'text-success',
    bg: 'bg-success/10',
    baslik: 'Tablo Dosyaları',
    aciklama: 'Banka ekstresi veya Excel tablosu',
  },
  {
    uzantilar: ['PDF'],
    ikon: FileText,
    renk: 'text-info',
    bg: 'bg-info/10',
    baslik: 'PDF Belgeler',
    aciklama: 'PDF makbuz veya ekstre',
  },
  {
    uzantilar: ['JPG', 'PNG', 'BMP'],
    ikon: FileImage,
    renk: 'text-warning',
    bg: 'bg-warning/10',
    baslik: 'Görsel (AI ile)',
    aciklama: 'Fotoğraf veya fiş görseli',
  },
];

function DosyaTuruIkon({ dosyaTuru }: { dosyaTuru: string }) {
  if (dosyaTuru === 'GORUNTU') return <FileImage className="h-4 w-4 text-warning" />;
  if (dosyaTuru === 'PDF') return <FileText className="h-4 w-4 text-info" />;
  return <FileSpreadsheet className="h-4 w-4 text-success" />;
}

function YuklemeDurumBadge({ durum }: { durum: BelgeYuklemeResponse['durum'] }) {
  if (durum === 'TAMAMLANDI') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
        <CheckCircle className="h-3 w-3" />
        Tamamlandı
      </span>
    );
  }
  if (durum === 'HATA') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-danger/10 px-2.5 py-1 text-xs font-medium text-danger">
        <XCircle className="h-3 w-3" />
        Hata
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning">
      <Loader2 className="h-3 w-3 animate-spin" />
      İşleniyor
    </span>
  );
}

export default function BelgeYuklePage() {
  const { kullanici } = useAuthStore();
  const isPremiumOrUltra = kullanici?.plan === 'PREMIUM' || kullanici?.plan === 'ULTRA';

  const [surukleniyorMu, setSurukleniyorMu] = useState(false);
  const [yukleniyorMu, setYukleniyorMu] = useState(false);
  const [sonYukleme, setSonYukleme] = useState<BelgeYuklemeResponse | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: gecmis, refetch: gecmisYenile } = useQuery({
    queryKey: ['belge-gecmis'],
    queryFn: () => belgeService.gecmis(),
    select: (d) => d.data,
    enabled: isPremiumOrUltra,
  });

  const dosyaYukle = useCallback(
    async (dosya: File) => {
      const uzanti = '.' + dosya.name.split('.').pop()?.toLowerCase();
      if (!KABUL_EDILEN_UZANTILAR.includes(uzanti)) {
        setHata('Desteklenmeyen dosya formatı. Kabul edilen: CSV, XLSX, PDF, JPG, PNG, BMP');
        return;
      }
      if (dosya.size > MAX_BOYUT) {
        setHata('Dosya boyutu 15MB\'dan büyük olamaz.');
        return;
      }

      setHata(null);
      setYukleniyorMu(true);
      setSonYukleme(null);

      try {
        const res = await belgeService.dosyaYukle(dosya);
        setSonYukleme(res.data);
        gecmisYenile();
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        setHata(error?.response?.data?.message || 'Dosya yüklenemedi.');
      } finally {
        setYukleniyorMu(false);
      }
    },
    [gecmisYenile]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setSurukleniyorMu(false);
    const dosya = e.dataTransfer.files[0];
    if (dosya) dosyaYukle(dosya);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dosya = e.target.files?.[0];
    if (dosya) dosyaYukle(dosya);
    // Reset so same file can be re-uploaded
    e.target.value = '';
  };

  if (!isPremiumOrUltra) {
    return (
      <PageContainer>
        <PageHeader
          baslik="Belge Yükle"
          altBaslik="AI destekli belge analizi ile harcamalarınızı otomatik içe aktarın"
        />
        <PlanYukseltmeBanneri
          ozellik="Belge Yükleme"
          aciklama="CSV, Excel, PDF ve görseldeki harcamaları AI ile otomatik tanıyın. Fişlerinizi fotoğraflayarak anında kaydedin."
          gerekliPlan="PREMIUM"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        baslik="Belge Yükle"
        altBaslik="AI destekli belge analizi ile harcamalarınızı otomatik içe aktarın"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sol: Yükleme Alanı */}
        <div className="space-y-4">
          {/* Drag & Drop */}
          <div
            onDragOver={(e) => { e.preventDefault(); setSurukleniyorMu(true); }}
            onDragLeave={() => setSurukleniyorMu(false)}
            onDrop={handleDrop}
            onClick={() => !yukleniyorMu && fileInputRef.current?.click()}
            className={clsx(
              'cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors',
              surukleniyorMu
                ? 'border-accent bg-accent/5'
                : 'border-border hover:border-accent/50 hover:bg-bg-secondary/50',
              yukleniyorMu && 'pointer-events-none opacity-60'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.pdf,.jpg,.jpeg,.png,.bmp"
              onChange={handleFileChange}
              className="hidden"
            />

            {yukleniyorMu ? (
              <div className="flex flex-col items-center">
                <div className="mb-4 relative">
                  <Loader2 className="h-12 w-12 animate-spin text-accent" />
                  <Sparkles className="h-5 w-5 text-accent absolute -top-1 -right-1" />
                </div>
                <p className="text-sm font-medium text-text-primary">AI belgeyi analiz ediyor...</p>
                <p className="text-xs text-text-muted mt-1">Bu işlem birkaç saniye sürebilir</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="mb-4 rounded-full bg-accent/10 p-4">
                  <FileUp className="h-8 w-8 text-accent" />
                </div>
                <p className="text-base font-semibold text-text-primary mb-1">
                  Belgeyi sürükleyin veya seçin
                </p>
                <p className="text-sm text-text-muted">
                  CSV, XLSX, PDF, JPG, PNG, BMP — Maks. 15MB
                </p>
              </div>
            )}
          </div>

          {/* Hata */}
          {hata && (
            <div className="flex items-start gap-3 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3">
              <AlertCircle className="h-5 w-5 text-danger flex-shrink-0 mt-0.5" />
              <p className="text-sm text-danger">{hata}</p>
            </div>
          )}

          {/* Son Yükleme Sonucu */}
          {sonYukleme && (
            <div className="rounded-xl border border-border bg-bg-primary p-4 shadow-sm shadow-black/[0.04]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-text-primary">Son Yükleme</h3>
                <YuklemeDurumBadge durum={sonYukleme.durum} />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-text-muted">Dosya</p>
                  <p className="text-text-primary truncate">{sonYukleme.dosyaAdi}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">İşlenen</p>
                  <p className="text-text-primary">
                    {sonYukleme.islenenSatir} / {sonYukleme.toplamSatir} harcama
                  </p>
                </div>
              </div>
              {sonYukleme.hataMesaji && (
                <p className="mt-2 text-xs text-danger">{sonYukleme.hataMesaji}</p>
              )}
            </div>
          )}

          {/* Desteklenen Formatlar */}
          <div className="rounded-xl border border-border bg-bg-primary p-4 shadow-sm shadow-black/[0.04]">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Desteklenen Formatlar</h3>
            <div className="space-y-3">
              {FORMAT_LISTESI.map((fmt) => {
                const Ikon = fmt.ikon;
                return (
                  <div key={fmt.baslik} className="flex items-start gap-3">
                    <div className={clsx('mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg', fmt.bg)}>
                      <Ikon className={clsx('h-4 w-4', fmt.renk)} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {fmt.baslik}
                        <span className="ml-2 text-xs text-text-muted font-normal">
                          {fmt.uzantilar.join(', ')}
                        </span>
                      </p>
                      <p className="text-xs text-text-muted">{fmt.aciklama}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-accent/[0.06] border border-accent/20 px-3 py-2">
              <Sparkles className="h-3.5 w-3.5 text-accent flex-shrink-0" />
              <p className="text-xs text-accent">
                PDF ve görseller Claude AI tarafından otomatik okunur
              </p>
            </div>
          </div>
        </div>

        {/* Sağ: Yükleme Geçmişi */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <History className="h-5 w-5 text-text-muted" />
            <h2 className="text-base font-semibold text-text-primary">Yükleme Geçmişi</h2>
          </div>

          {!gecmis || gecmis.length === 0 ? (
            <div className="rounded-xl border border-border bg-bg-primary p-8 text-center shadow-sm shadow-black/[0.04]">
              <FileUp className="h-8 w-8 text-text-muted mx-auto mb-2" />
              <p className="text-sm text-text-muted">Henüz belge yüklenmemiş</p>
            </div>
          ) : (
            <div className="space-y-2">
              {gecmis.map((kayit) => (
                <div
                  key={kayit.id}
                  className="rounded-xl border border-border bg-bg-primary p-4 shadow-sm shadow-black/[0.04]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <DosyaTuruIkon dosyaTuru={kayit.dosyaTuru} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{kayit.dosyaAdi}</p>
                        <p className="text-xs text-text-muted mt-0.5">
                          {(() => {
                            try {
                              return format(parseISO(kayit.createdAt), 'd MMMM yyyy, HH:mm', { locale: tr });
                            } catch { return ''; }
                          })()}
                        </p>
                      </div>
                    </div>
                    <YuklemeDurumBadge durum={kayit.durum} />
                  </div>
                  {kayit.islenenSatir > 0 && (
                    <div className="mt-2 text-xs text-text-muted">
                      {kayit.islenenSatir} harcama içe aktarıldı
                    </div>
                  )}
                  {kayit.hataMesaji && (
                    <p className="mt-1 text-xs text-danger">{kayit.hataMesaji}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
