'use client';

import { useState, useRef, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Download,
  History,
} from 'lucide-react';
import { PageContainer } from '@/components/shared/PageContainer';
import { PageHeader } from '@/components/shared/PageHeader';
import { csvService, CsvYuklemeResponse } from '@/services/csvService';
import { clsx } from 'clsx';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';

const BEKLENEN_FORMAT = `tarih,aciklama,tutar,odeme_yontemi
2024-01-15,Market alışverişi,250.50,NAKIT
2024-01-16,Fatura ödemesi,180.00,HAVALE
2024-01-17,Restoran,95.75,KREDI_KARTI`;

function YuklemeDurumBadge({ durum }: { durum: CsvYuklemeResponse['durum'] }) {
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

export default function CsvYuklePage() {
  const { kullanici } = useAuthStore();
  const isFree = kullanici?.plan === 'FREE';

  const [surukleniyorMu, setSurukleniyorMu] = useState(false);
  const [yukleniyorMu, setYukleniyorMu] = useState(false);
  const [sonYukleme, setSonYukleme] = useState<CsvYuklemeResponse | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: gecmis, refetch: gecmisYenile } = useQuery({
    queryKey: ['csv-gecmis'],
    queryFn: () => csvService.gecmis(),
    select: (d) => d.data,
  });

  const dosyaYukle = useCallback(
    async (dosya: File) => {
      if (!dosya.name.endsWith('.csv')) {
        setHata('Sadece CSV dosyaları kabul edilir.');
        return;
      }
      if (dosya.size > 5 * 1024 * 1024) {
        setHata('Dosya boyutu 5MB\'dan büyük olamaz.');
        return;
      }

      setHata(null);
      setYukleniyorMu(true);
      setSonYukleme(null);

      try {
        const res = await csvService.dosyaYukle(dosya);
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
  };

  return (
    <PageContainer>
      <PageHeader
        baslik="CSV Yükle"
        altBaslik="Banka veya kart ekstrenizi toplu olarak içe aktarın"
      />

      {isFree && (
        <div className="mb-2 flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 p-3">
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-warning mt-0.5" />
          <p className="text-xs text-warning">
            Ücretsiz planda aylık <strong>1 CSV yükleme</strong> hakkınız var.
            Sınırsız yükleme için{' '}
            <a href="/ayarlar" className="underline">Premium&apos;a geçin</a>.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upload Area */}
        <div className="space-y-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setSurukleniyorMu(true); }}
            onDragLeave={() => setSurukleniyorMu(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={clsx(
              'cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors',
              surukleniyorMu
                ? 'border-accent bg-accent/5'
                : 'border-border hover:border-accent/50 hover:bg-bg-primary',
              yukleniyorMu && 'pointer-events-none opacity-60'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />

            {yukleniyorMu ? (
              <div className="flex flex-col items-center">
                <Loader2 className="h-12 w-12 animate-spin text-accent mb-3" />
                <p className="text-sm font-medium text-text-primary">Yükleniyor...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="mb-4 rounded-full bg-accent/10 p-4">
                  <Upload className="h-8 w-8 text-accent" />
                </div>
                <p className="text-base font-semibold text-text-primary mb-1">
                  CSV dosyasını sürükleyin veya seçin
                </p>
                <p className="text-sm text-text-muted">
                  Maksimum 5MB, sadece .csv formatı
                </p>
              </div>
            )}
          </div>

          {/* Error */}
          {hata && (
            <div className="flex items-start gap-3 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3">
              <AlertCircle className="h-5 w-5 text-danger flex-shrink-0 mt-0.5" />
              <p className="text-sm text-danger">{hata}</p>
            </div>
          )}

          {/* Upload Result */}
          {sonYukleme && (
            <div className="rounded-xl border border-border bg-bg-primary p-4">
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
                    {sonYukleme.islenenSatir} / {sonYukleme.toplamSatir} satır
                  </p>
                </div>
              </div>
              {sonYukleme.hataMesaji && (
                <p className="mt-2 text-xs text-danger">{sonYukleme.hataMesaji}</p>
              )}
            </div>
          )}

          {/* Format Info */}
          <div className="rounded-xl border border-border bg-bg-primary p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-info" />
              <h3 className="text-sm font-semibold text-text-primary">Beklenen Format</h3>
            </div>
            <pre className="rounded-lg bg-bg-primary p-3 text-xs text-text-muted overflow-x-auto font-mono leading-relaxed">
              {BEKLENEN_FORMAT}
            </pre>
            <div className="mt-3 space-y-1.5 text-xs text-text-muted">
              <p>• <span className="text-text-primary">tarih</span>: YYYY-MM-DD formatında</p>
              <p>• <span className="text-text-primary">aciklama</span>: İşlem açıklaması</p>
              <p>• <span className="text-text-primary">tutar</span>: Pozitif sayı (nokta ile)</p>
              <p>• <span className="text-text-primary">odeme_yontemi</span>: NAKIT, KREDI_KARTI, BANKA_KARTI, HAVALE, DIGER</p>
            </div>
          </div>
        </div>

        {/* History */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <History className="h-5 w-5 text-text-muted" />
            <h2 className="text-base font-semibold text-text-primary">Yükleme Geçmişi</h2>
          </div>

          {!gecmis || gecmis.length === 0 ? (
            <div className="rounded-xl border border-border bg-bg-primary p-8 text-center">
              <Download className="h-8 w-8 text-text-muted mx-auto mb-2" />
              <p className="text-sm text-text-muted">Henüz CSV yüklemesi yapılmamış</p>
            </div>
          ) : (
            <div className="space-y-2">
              {gecmis.map((kayit) => (
                <div key={kayit.id} className="rounded-xl border border-border bg-bg-primary p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{kayit.dosyaAdi}</p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {(() => {
                          try {
                            return format(parseISO(kayit.createdAt), 'd MMMM yyyy, HH:mm', { locale: tr });
                          } catch {
                            return '';
                          }
                        })()}
                      </p>
                    </div>
                    <YuklemeDurumBadge durum={kayit.durum} />
                  </div>
                  {kayit.toplamSatir > 0 && (
                    <div className="mt-2 text-xs text-text-muted">
                      {kayit.islenenSatir}/{kayit.toplamSatir} satır işlendi
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
