'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Search,
  Shield,
  UserCheck,
  UserX,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Crown,
  Zap,
  Star,
  X,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { PageContainer } from '@/components/shared/PageContainer';
import { PageHeader } from '@/components/shared/PageHeader';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { adminService } from '@/services/adminService';
import { AdminKullaniciDto, AdminKullaniciGuncelleRequest } from '@/types/admin.types';
import { PlanTuru } from '@/types/kullanici.types';
import { clsx } from 'clsx';
import { useAuthStore } from '@/stores/authStore';

const PLAN_META: Record<PlanTuru, { etiket: string; renk: string; Ikon: React.ElementType }> = {
  FREE: { etiket: 'Ücretsiz', renk: 'bg-bg-tertiary text-text-muted', Ikon: Star },
  PREMIUM: { etiket: 'Premium', renk: 'bg-warning/15 text-warning', Ikon: Zap },
  ULTRA: { etiket: 'Ultra', renk: 'bg-accent/15 text-accent', Ikon: Crown },
};

interface DuzenleModalProps {
  kullanici: AdminKullaniciDto;
  onKapat: () => void;
  onKaydet: (id: number, req: AdminKullaniciGuncelleRequest) => Promise<void>;
}

function DuzenleModal({ kullanici, onKapat, onKaydet }: DuzenleModalProps) {
  const [plan, setPlan] = useState<PlanTuru>(kullanici.plan);
  const [adminMi, setAdminMi] = useState(kullanici.adminMi);
  const [aktif, setAktif] = useState(kullanici.aktif);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  const handleKaydet = async () => {
    try {
      setYukleniyor(true);
      setHata(null);
      await onKaydet(kullanici.id, { plan, adminMi, aktif });
      onKapat();
    } catch {
      setHata('Kullanıcı güncellenemedi');
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-bg-secondary p-6 shadow-xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Kullanıcı Düzenle</h2>
            <p className="text-sm text-text-muted">{kullanici.ad} {kullanici.soyad}</p>
            <p className="text-xs text-text-muted">{kullanici.email}</p>
          </div>
          <button onClick={onKapat} className="rounded-lg p-1 hover:bg-bg-tertiary transition-colors">
            <X className="h-5 w-5 text-text-muted" />
          </button>
        </div>

        {hata && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            {hata}
          </div>
        )}

        {/* Plan Seçimi */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-text-secondary">Plan</label>
          <div className="grid grid-cols-3 gap-2">
            {(['FREE', 'PREMIUM', 'ULTRA'] as PlanTuru[]).map((p) => {
              const meta = PLAN_META[p];
              const Ikon = meta.Ikon;
              return (
                <button
                  key={p}
                  onClick={() => setPlan(p)}
                  className={clsx(
                    'flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors',
                    plan === p
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border bg-bg-tertiary text-text-secondary hover:border-accent/50'
                  )}
                >
                  <Ikon className="h-3.5 w-3.5" />
                  {meta.etiket}
                </button>
              );
            })}
          </div>
        </div>

        {/* Toggle'lar */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between rounded-lg border border-border bg-bg-tertiary px-4 py-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-text-secondary">Admin Yetkisi</span>
            </div>
            <button
              onClick={() => setAdminMi(!adminMi)}
              className={clsx(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                adminMi ? 'bg-accent' : 'bg-bg-tertiary border border-border'
              )}
            >
              <span className={clsx(
                'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                adminMi ? 'translate-x-6' : 'translate-x-1'
              )} />
            </button>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-bg-tertiary px-4 py-3">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-success" />
              <span className="text-sm font-medium text-text-secondary">Hesap Aktif</span>
            </div>
            <button
              onClick={() => setAktif(!aktif)}
              className={clsx(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                aktif ? 'bg-success' : 'bg-bg-tertiary border border-border'
              )}
            >
              <span className={clsx(
                'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                aktif ? 'translate-x-6' : 'translate-x-1'
              )} />
            </button>
          </div>
        </div>

        {/* Butonlar */}
        <div className="flex gap-3">
          <button
            onClick={onKapat}
            className="flex-1 rounded-lg border border-border bg-bg-tertiary px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-border transition-colors"
          >
            İptal
          </button>
          <button
            onClick={handleKaydet}
            disabled={yukleniyor}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors disabled:opacity-60"
          >
            {yukleniyor ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminKullanicilarPage() {
  const { kullanici: mevcutKullanici } = useAuthStore();
  const [kullanicilar, setKullanicilar] = useState<AdminKullaniciDto[]>([]);
  const [toplamSayfa, setToplamSayfa] = useState(0);
  const [toplamEleman, setToplamEleman] = useState(0);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState<string | null>(null);

  const [arama, setArama] = useState('');
  const [aramaSonucu, setAramaSonucu] = useState('');
  const [planFiltre, setPlanFiltre] = useState('');
  const [aktifFiltre, setAktifFiltre] = useState<boolean | undefined>(undefined);
  const [sayfa, setSayfa] = useState(0);

  const [duzenleKullanici, setDuzenleKullanici] = useState<AdminKullaniciDto | null>(null);
  const [silKullaniciId, setSilKullaniciId] = useState<number | null>(null);

  const veriYukle = useCallback(async () => {
    try {
      setYukleniyor(true);
      setHata(null);
      const data = await adminService.kullanicilariGetir({
        arama: aramaSonucu || undefined,
        plan: planFiltre || undefined,
        aktif: aktifFiltre,
        sayfa,
        boyut: 15,
      });
      setKullanicilar(data.content);
      setToplamSayfa(data.totalPages);
      setToplamEleman(data.totalElements);
    } catch {
      setHata('Kullanıcılar yüklenemedi');
    } finally {
      setYukleniyor(false);
    }
  }, [aramaSonucu, planFiltre, aktifFiltre, sayfa]);

  useEffect(() => {
    veriYukle();
  }, [veriYukle]);

  const handleArama = (e: React.FormEvent) => {
    e.preventDefault();
    setSayfa(0);
    setAramaSonucu(arama);
  };

  const handleKullaniciGuncelle = async (id: number, req: AdminKullaniciGuncelleRequest) => {
    await adminService.kullaniciGuncelle(id, req);
    await veriYukle();
  };

  const handleKullaniciSil = async () => {
    if (silKullaniciId === null) return;
    await adminService.kullaniciSil(silKullaniciId);
    setSilKullaniciId(null);
    await veriYukle();
  };

  const tarihFormatla = (tarih: string | null) => {
    if (!tarih) return '-';
    return new Date(tarih).toLocaleDateString('tr-TR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  };

  return (
    <PageContainer>
      <PageHeader
        baslik="Kullanıcı Yönetimi"
        altBaslik={`Toplam ${toplamEleman} kullanıcı`}
      />

      {/* Filtreler */}
      <div className="mb-5 flex flex-wrap gap-3">
        <form onSubmit={handleArama} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={arama}
              onChange={(e) => setArama(e.target.value)}
              placeholder="İsim veya e-posta ara..."
              className="h-9 rounded-lg border border-border bg-bg-secondary pl-9 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="h-9 rounded-lg bg-accent px-4 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
          >
            Ara
          </button>
          {aramaSonucu && (
            <button
              type="button"
              onClick={() => { setArama(''); setAramaSonucu(''); setSayfa(0); }}
              className="h-9 rounded-lg border border-border bg-bg-secondary px-3 text-sm text-text-muted hover:bg-bg-tertiary transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>

        <select
          value={planFiltre}
          onChange={(e) => { setPlanFiltre(e.target.value); setSayfa(0); }}
          className="h-9 rounded-lg border border-border bg-bg-secondary px-3 text-sm text-text-secondary focus:border-accent focus:outline-none"
        >
          <option value="">Tüm Planlar</option>
          <option value="FREE">Ücretsiz</option>
          <option value="PREMIUM">Premium</option>
          <option value="ULTRA">Ultra</option>
        </select>

        <select
          value={aktifFiltre === undefined ? '' : String(aktifFiltre)}
          onChange={(e) => {
            setSayfa(0);
            setAktifFiltre(e.target.value === '' ? undefined : e.target.value === 'true');
          }}
          className="h-9 rounded-lg border border-border bg-bg-secondary px-3 text-sm text-text-secondary focus:border-accent focus:outline-none"
        >
          <option value="">Tüm Durumlar</option>
          <option value="true">Aktif</option>
          <option value="false">Pasif</option>
        </select>
      </div>

      {hata && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          {hata}
        </div>
      )}

      {/* Tablo */}
      <div className="overflow-hidden rounded-xl border border-border bg-bg-secondary">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-border bg-bg-tertiary">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Kullanıcı</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Durum</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Gider</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Son Giriş</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Kayıt</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {yukleniyor ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border border-t-accent" />
                  </td>
                </tr>
              ) : kullanicilar.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-text-muted">
                    Kullanıcı bulunamadı
                  </td>
                </tr>
              ) : kullanicilar.map((k) => {
                const planMeta = PLAN_META[k.plan];
                const PlanIkon = planMeta.Ikon;
                const benimHesabim = mevcutKullanici?.id === k.id;
                return (
                  <tr key={k.id} className={clsx('hover:bg-bg-tertiary/50 transition-colors', benimHesabim && 'bg-accent/5')}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent">
                          {k.ad.charAt(0)}{k.soyad.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium text-text-primary">{k.ad} {k.soyad}</span>
                            {k.adminMi && <Shield className="h-3.5 w-3.5 text-accent" title="Admin" />}
                            {benimHesabim && <span className="rounded-full bg-accent/20 px-1.5 py-0.5 text-xs text-accent">Siz</span>}
                          </div>
                          <span className="text-xs text-text-muted">{k.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium', planMeta.renk)}>
                        <PlanIkon className="h-3 w-3" />
                        {planMeta.etiket}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {k.aktif ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-xs font-medium text-success">
                            <UserCheck className="h-3 w-3" /> Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-danger/15 px-2.5 py-1 text-xs font-medium text-danger">
                            <UserX className="h-3 w-3" /> Pasif
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{k.giderSayisi}</td>
                    <td className="px-4 py-3 text-sm text-text-muted">{tarihFormatla(k.sonGirisTarihi)}</td>
                    <td className="px-4 py-3 text-sm text-text-muted">{tarihFormatla(k.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setDuzenleKullanici(k)}
                          className="rounded-lg p-1.5 text-text-muted hover:bg-accent/10 hover:text-accent transition-colors"
                          title="Düzenle"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {!benimHesabim && !k.adminMi && (
                          <button
                            onClick={() => setSilKullaniciId(k.id)}
                            className="rounded-lg p-1.5 text-text-muted hover:bg-danger/10 hover:text-danger transition-colors"
                            title="Sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Sayfalama */}
        {toplamSayfa > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-sm text-text-muted">
              Sayfa {sayfa + 1} / {toplamSayfa} ({toplamEleman} kullanıcı)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setSayfa((s) => s - 1)}
                disabled={sayfa === 0}
                className="flex items-center gap-1 rounded-lg border border-border bg-bg-tertiary px-3 py-1.5 text-sm text-text-secondary hover:bg-border transition-colors disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" /> Önceki
              </button>
              <button
                onClick={() => setSayfa((s) => s + 1)}
                disabled={sayfa >= toplamSayfa - 1}
                className="flex items-center gap-1 rounded-lg border border-border bg-bg-tertiary px-3 py-1.5 text-sm text-text-secondary hover:bg-border transition-colors disabled:opacity-40"
              >
                Sonraki <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Düzenleme Modalı */}
      {duzenleKullanici && (
        <DuzenleModal
          kullanici={duzenleKullanici}
          onKapat={() => setDuzenleKullanici(null)}
          onKaydet={handleKullaniciGuncelle}
        />
      )}

      {/* Silme Onay */}
      <ConfirmDialog
        acik={silKullaniciId !== null}
        baslik="Kullanıcıyı Sil"
        mesaj="Bu kullanıcı hesabını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        onayEtiket="Evet, Sil"
        onOnayla={handleKullaniciSil}
        onIptal={() => setSilKullaniciId(null)}
      />
    </PageContainer>
  );
}
