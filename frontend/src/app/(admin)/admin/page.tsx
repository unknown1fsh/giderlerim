'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Receipt,
  Bot,
  TrendingUp,
  Shield,
  Settings,
  UserCheck,
  UserX,
  Crown,
  Zap,
  Star,
  AlertTriangle,
  FileUp,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';
import { PageContainer } from '@/components/shared/PageContainer';
import { PageHeader } from '@/components/shared/PageHeader';
import { adminService } from '@/services/adminService';
import { AdminIstatistikDto } from '@/types/admin.types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { clsx } from 'clsx';

function StatCard({
  baslik,
  deger,
  altyazi,
  Ikon,
  renk,
}: {
  baslik: string;
  deger: string | number;
  altyazi?: string;
  Ikon: React.ElementType;
  renk: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg-secondary p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-muted">{baslik}</p>
          <p className="mt-1 text-2xl font-bold text-text-primary">{deger}</p>
          {altyazi && <p className="mt-1 text-xs text-text-muted">{altyazi}</p>}
        </div>
        <div className={clsx('flex h-10 w-10 items-center justify-center rounded-lg', renk)}>
          <Ikon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

const PLAN_RENKLER = ['#6B7280', '#F59E0B', '#8B5CF6'];

export default function AdminDashboardPage() {
  const [istatistik, setIstatistik] = useState<AdminIstatistikDto | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState<string | null>(null);

  const veriYukle = async () => {
    try {
      setYukleniyor(true);
      setHata(null);
      const data = await adminService.istatistikleriGetir();
      setIstatistik(data);
    } catch {
      setHata('İstatistikler yüklenemedi');
    } finally {
      setYukleniyor(false);
    }
  };

  useEffect(() => {
    veriYukle();
  }, []);

  const planDagilimVerisi = istatistik
    ? [
        { name: 'Ücretsiz', value: istatistik.freeKullanici },
        { name: 'Premium', value: istatistik.premiumKullanici },
        { name: 'Ultra', value: istatistik.ultraKullanici },
      ]
    : [];

  return (
    <PageContainer>
      <PageHeader
        baslik="Admin Paneli"
        altBaslik="Sistem geneli istatistikler ve yönetim araçları"
        eylem={
          <button
            onClick={veriYukle}
            className="flex items-center gap-2 rounded-lg border border-border bg-bg-secondary px-4 py-2 text-sm font-medium text-text-secondary hover:bg-bg-tertiary transition-colors"
          >
            <RefreshCw className={clsx('h-4 w-4', yukleniyor && 'animate-spin')} />
            Yenile
          </button>
        }
      />

      {hata && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          {hata}
        </div>
      )}

      {yukleniyor && !istatistik ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-accent" />
        </div>
      ) : istatistik ? (
        <div className="space-y-6">
          {/* Ana İstatistikler */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard
              baslik="Toplam Kullanıcı"
              deger={istatistik.toplamKullanici}
              altyazi={`${istatistik.aktifKullanici} aktif`}
              Ikon={Users}
              renk="bg-accent"
            />
            <StatCard
              baslik="Toplam Gider Kaydı"
              deger={istatistik.toplamGiderSayisi.toLocaleString('tr-TR')}
              altyazi={`₺${Number(istatistik.toplamGiderTutari).toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
              Ikon={Receipt}
              renk="bg-success"
            />
            <StatCard
              baslik="AI Oturumları"
              deger={istatistik.toplamAiOturumSayisi}
              altyazi={`${istatistik.toplamAiMesajSayisi} mesaj`}
              Ikon={Bot}
              renk="bg-warning"
            />
            <StatCard
              baslik="Toplam Bütçe"
              deger={istatistik.toplamButceSayisi}
              altyazi={`${istatistik.okunmamisUyariSayisi} okunmamış uyarı`}
              Ikon={TrendingUp}
              renk="bg-danger"
            />
          </div>

          {/* Kullanıcı İstatistikleri + Plan Dağılımı */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Kullanıcı Detayları */}
            <div className="rounded-xl border border-border bg-bg-secondary p-5">
              <h3 className="mb-4 font-semibold text-text-primary">Kullanıcı Dağılımı</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-bg-tertiary px-4 py-3">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-success" />
                    <span className="text-sm text-text-secondary">Aktif Kullanıcı</span>
                  </div>
                  <span className="font-semibold text-text-primary">{istatistik.aktifKullanici}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-bg-tertiary px-4 py-3">
                  <div className="flex items-center gap-2">
                    <UserX className="h-4 w-4 text-danger" />
                    <span className="text-sm text-text-secondary">Silinen Kullanıcı</span>
                  </div>
                  <span className="font-semibold text-text-primary">{istatistik.silinenKullanici}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-bg-tertiary px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-accent" />
                    <span className="text-sm text-text-secondary">Admin Kullanıcı</span>
                  </div>
                  <span className="font-semibold text-text-primary">{istatistik.adminKullanici}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-bg-tertiary px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-text-muted" />
                    <span className="text-sm text-text-secondary">Ücretsiz Plan</span>
                  </div>
                  <span className="font-semibold text-text-primary">{istatistik.freeKullanici}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-bg-tertiary px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-warning" />
                    <span className="text-sm text-text-secondary">Premium Plan</span>
                  </div>
                  <span className="font-semibold text-text-primary">{istatistik.premiumKullanici}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-bg-tertiary px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-accent" />
                    <span className="text-sm text-text-secondary">Ultra Plan</span>
                  </div>
                  <span className="font-semibold text-text-primary">{istatistik.ultraKullanici}</span>
                </div>
              </div>
            </div>

            {/* Plan Dağılımı Pasta Grafiği */}
            <div className="rounded-xl border border-border bg-bg-secondary p-5">
              <h3 className="mb-4 font-semibold text-text-primary">Plan Dağılımı</h3>
              {istatistik.toplamKullanici > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={planDagilimVerisi}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {planDagilimVerisi.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PLAN_RENKLER[index % PLAN_RENKLER.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [value, 'Kullanıcı']}
                      contentStyle={{
                        backgroundColor: 'var(--color-bg-secondary)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                        color: 'var(--color-text-primary)',
                      }}
                    />
                    <Legend
                      formatter={(value) => <span style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-60 items-center justify-center text-sm text-text-muted">
                  Henüz kullanıcı yok
                </div>
              )}
            </div>
          </div>

          {/* Sistem Aktivitesi */}
          <div className="rounded-xl border border-border bg-bg-secondary p-5">
            <h3 className="mb-4 font-semibold text-text-primary">Sistem Aktivitesi</h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg bg-bg-tertiary px-4 py-3 text-center">
                <FileUp className="mx-auto mb-2 h-5 w-5 text-accent" />
                <p className="text-xl font-bold text-text-primary">{istatistik.toplamCsvYuklemeSayisi}</p>
                <p className="text-xs text-text-muted">CSV Yükleme</p>
              </div>
              <div className="rounded-lg bg-bg-tertiary px-4 py-3 text-center">
                <FileUp className="mx-auto mb-2 h-5 w-5 text-warning" />
                <p className="text-xl font-bold text-text-primary">{istatistik.toplamBelgeYuklemeSayisi}</p>
                <p className="text-xs text-text-muted">Belge Yükleme</p>
              </div>
              <div className="rounded-lg bg-bg-tertiary px-4 py-3 text-center">
                <MessageSquare className="mx-auto mb-2 h-5 w-5 text-success" />
                <p className="text-xl font-bold text-text-primary">{istatistik.toplamAiMesajSayisi}</p>
                <p className="text-xs text-text-muted">AI Mesaj</p>
              </div>
              <div className="rounded-lg bg-bg-tertiary px-4 py-3 text-center">
                <AlertTriangle className="mx-auto mb-2 h-5 w-5 text-danger" />
                <p className="text-xl font-bold text-text-primary">{istatistik.okunmamisUyariSayisi}</p>
                <p className="text-xs text-text-muted">Okunmamış Uyarı</p>
              </div>
            </div>
          </div>

          {/* Hızlı Erişim */}
          <div className="grid gap-4 md:grid-cols-2">
            <Link
              href="/admin/kullanicilar"
              className="flex items-center gap-4 rounded-xl border border-border bg-bg-secondary p-5 hover:border-accent/50 hover:bg-accent/5 transition-colors group"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-colors">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="font-semibold text-text-primary">Kullanıcı Yönetimi</p>
                <p className="text-sm text-text-muted">Plan değiştir, admin ata, hesap yönet</p>
              </div>
            </Link>
            <Link
              href="/admin/sistem-parametreleri"
              className="flex items-center gap-4 rounded-xl border border-border bg-bg-secondary p-5 hover:border-accent/50 hover:bg-accent/5 transition-colors group"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-colors">
                <Settings className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="font-semibold text-text-primary">Sistem Parametreleri</p>
                <p className="text-sm text-text-muted">Uygulama ayarlarını görüntüle ve düzenle</p>
              </div>
            </Link>
          </div>
        </div>
      ) : null}
    </PageContainer>
  );
}
