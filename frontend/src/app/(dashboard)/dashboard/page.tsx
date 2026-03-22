'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  TrendingUp,
  Wallet,
  CreditCard,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Bot,
  Receipt,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import { PageContainer } from '@/components/shared/PageContainer';
import { PageHeader } from '@/components/shared/PageHeader';
import { SummaryCard } from '@/components/shared/SummaryCard';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { KategoriPastaGrafigi } from '@/components/feature/dashboard/KategoriPastaGrafigi';
import { GunlukTrendGrafigi } from '@/components/feature/dashboard/GunlukTrendGrafigi';
import { ButceDurumKartlari } from '@/components/feature/dashboard/ButceDurumKartlari';
import { useDashboard, useGunlukHarcamalar } from '@/hooks/useDashboard';
import { useAuthStore } from '@/stores/authStore';

const AYLAR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

export default function DashboardPage() {
  const bugunki = new Date();
  const [ay, setAy] = useState(bugunki.getMonth() + 1);
  const [yil, setYil] = useState(bugunki.getFullYear());
  const { kullanici } = useAuthStore();

  const { data: dashboard, isLoading, isError, refetch } = useDashboard(ay, yil);

  const baslangic = format(startOfMonth(new Date(yil, ay - 1)), 'yyyy-MM-dd');
  const bitis = format(endOfMonth(new Date(yil, ay - 1)), 'yyyy-MM-dd');
  const { data: gunlukVeri } = useGunlukHarcamalar(baslangic, bitis);

  const oncekiAy = () => {
    if (ay === 1) { setAy(12); setYil(yil - 1); }
    else setAy(ay - 1);
  };

  const sonrakiAy = () => {
    if (ay === 12) { setAy(1); setYil(yil + 1); }
    else setAy(ay + 1);
  };

  const formatPara = (tutar: number) =>
    tutar.toLocaleString('tr-TR', { style: 'currency', currency: kullanici?.paraBirimi ?? 'TRY' });

  return (
    <PageContainer>
      <PageHeader
        baslik="Dashboard"
        altBaslik="Finansal durumunuza genel bakış"
        eylem={
          <div className="flex items-center gap-2">
            {kullanici?.adminMi && (
              <Link
                href="/admin"
                className="flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent hover:bg-accent/20 transition-colors"
              >
                <Shield className="h-4 w-4" />
                Admin Paneli
              </Link>
            )}
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
          </div>
        }
      />

      {isLoading && <LoadingState mesaj="Dashboard yükleniyor..." />}
      {isError && <ErrorState mesaj="Dashboard verileri yüklenemedi" yenidenDene={refetch} />}

      {dashboard && (
        <div className="space-y-6">
          {/* Anomali Uyarısı */}
          {dashboard.anormalGiderSayisi > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-warning/25 bg-warning/[0.08] px-4 py-3">
              <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
              <p className="text-sm text-warning">
                Bu ay <strong>{dashboard.anormalGiderSayisi}</strong> anormal harcama tespit edildi.{' '}
                <Link href="/uyarilar" className="underline hover:no-underline">
                  Uyarıları görüntüle
                </Link>
              </p>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              etiket="Toplam Harcama"
              deger={formatPara(dashboard.toplamHarcama)}
              ikon={Wallet}
              renk="mor"
              trend={
                dashboard.degisimYuzdesi !== 0
                  ? { deger: Math.abs(dashboard.degisimYuzdesi), yukariMi: dashboard.degisimYuzdesi > 0 }
                  : undefined
              }
            />
            <SummaryCard
              etiket="Nakit Harcama"
              deger={formatPara(dashboard.nakitHarcama)}
              ikon={TrendingUp}
              renk="yesil"
            />
            <SummaryCard
              etiket="Kredi Kartı"
              deger={formatPara(dashboard.krediKartiHarcama)}
              ikon={CreditCard}
              renk="mavi"
            />
            <SummaryCard
              etiket="Gider Sayısı"
              deger={`${dashboard.toplamGiderSayisi} işlem`}
              ikon={BarChart3}
              renk="sari"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Kategori Dağılımı */}
            <div className="rounded-xl border border-border bg-bg-primary p-5 shadow-sm shadow-black/[0.04]">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-muted">
                Kategori Dağılımı
              </h3>
              <KategoriPastaGrafigi veri={dashboard.kategoriDagilimi} />
            </div>

            {/* Günlük Trend */}
            <div className="rounded-xl border border-border bg-bg-primary p-5 shadow-sm shadow-black/[0.04]">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-muted">
                Günlük Harcama Trendi
              </h3>
              <GunlukTrendGrafigi veri={gunlukVeri ?? []} />
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Bütçe Durumları */}
            <div className="lg:col-span-1 rounded-xl border border-border bg-bg-primary p-5 shadow-sm shadow-black/[0.04]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">Bütçe Durumları</h3>
                <Link href="/butceler" className="text-xs font-medium text-accent hover:text-accent-hover">
                  Tümünü Gör →
                </Link>
              </div>
              <ButceDurumKartlari ozetler={dashboard.butceDurumlari} />
            </div>

            {/* Son Giderler */}
            <div className="lg:col-span-2 rounded-xl border border-border bg-bg-primary p-5 shadow-sm shadow-black/[0.04]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">Kategori Özeti</h3>
                <Link href="/giderler" className="text-xs font-medium text-accent hover:text-accent-hover">
                  Tüm Giderler →
                </Link>
              </div>

              {dashboard.kategoriDagilimi.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Receipt className="h-10 w-10 text-text-muted mb-2" />
                  <p className="text-sm text-text-muted">Bu ay henüz gider girilmemiş</p>
                  <Link
                    href="/giderler/yeni"
                    className="mt-3 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent-hover"
                  >
                    İlk Gideri Ekle
                  </Link>
                </div>
              ) : (
                <div className="space-y-1">
                  {dashboard.kategoriDagilimi.slice(0, 5).map((item) => (
                    <div
                      key={item.kategoriId}
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-bg-secondary transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base">{item.kategoriIkon}</span>
                        <div>
                          <p className="text-sm font-medium text-text-primary">{item.kategoriAd}</p>
                          <p className="text-xs text-text-muted">%{item.yuzde.toFixed(1)} pay</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-text-primary">
                        {formatPara(item.toplam)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* AI Insight Teaser */}
          {kullanici?.plan === 'FREE' ? (
            <div className="rounded-xl border border-accent/20 bg-accent/[0.06] p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-accent/15 p-3">
                  <Bot className="h-6 w-6 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-text-primary mb-1">
                    AI Finans Koçunuz Hazır
                  </h3>
                  <p className="text-sm text-text-muted mb-4">
                    Harcama alışkanlıklarınızı analiz etmek, tasarruf fırsatları bulmak ve
                    kişiselleştirilmiş bütçe önerileri almak için Premium&apos;a geçin.
                  </p>
                  <Link
                    href="/ayarlar"
                    className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover transition-colors"
                  >
                    <Bot className="h-4 w-4" />
                    Premium&apos;a Geç
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-accent/20 bg-accent/[0.06] p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-accent/15 p-3">
                  <Bot className="h-6 w-6 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-text-primary mb-1">
                    AI Koçunuzla Sohbet Edin
                  </h3>
                  <p className="text-sm text-text-muted mb-4">
                    Finansal durumunuz hakkında sorular sorun, kişiselleştirilmiş öneriler alın.
                  </p>
                  <Link
                    href="/ai-koc"
                    className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover transition-colors"
                  >
                    <Bot className="h-4 w-4" />
                    AI Koça Git
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
}
