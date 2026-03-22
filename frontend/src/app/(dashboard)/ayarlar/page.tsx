'use client';

import { useState } from 'react';
import {
  User,
  Crown,
  Zap,
  Star,
  Check,
  AlertTriangle,
  Save,
  AlertCircle,
  Sun,
  Moon,
  Settings,
  Shield,
  Palette,
  Lock,
  Monitor,
  Smartphone,
  Globe,
  Info,
} from 'lucide-react';
import { PageContainer } from '@/components/shared/PageContainer';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import apiClient from '@/services/apiClient';
import { ProfilGuncelleRequest, ParaBirimi, PlanTuru, KullaniciResponse } from '@/types/kullanici.types';
import { clsx } from 'clsx';

// ── Static Data ──────────────────────────────────────────────────────────────

const PARA_BIRIMLERI: { deger: ParaBirimi; etiket: string; sembol: string }[] = [
  { deger: 'TRY', etiket: 'Türk Lirası', sembol: '₺' },
  { deger: 'USD', etiket: 'Amerikan Doları', sembol: '$' },
  { deger: 'EUR', etiket: 'Euro', sembol: '€' },
];

const PLAN_OZELLIKLER: Record<PlanTuru, string[]> = {
  FREE: [
    'Aylık 50 gider girişi',
    'Temel kategori yönetimi',
    'Basit bütçe takibi',
    'CSV yükleme (1/ay)',
  ],
  PREMIUM: [
    'Sınırsız gider girişi',
    'AI Finans Koçu (sohbet)',
    'Bütçe önerileri',
    'Tasarruf analizi',
    'CSV yükleme (sınırsız)',
    'Gelişmiş raporlar',
  ],
  ULTRA: [
    "Premium'un tüm özellikleri",
    'Anomali tespiti',
    'Öncelikli destek',
    'API erişimi',
    'Özel raporlar',
    'Çoklu hesap',
  ],
};

const PLAN_META: Record<PlanTuru, {
  etiket: string;
  fiyat: string;
  Ikon: React.ElementType;
  renk: string;
  bg: string;
  border: string;
  badge: string;
}> = {
  FREE: {
    etiket: 'Ücretsiz', fiyat: '0 ₺/ay', Ikon: Star,
    renk: 'text-text-muted', bg: 'bg-bg-secondary',
    border: 'border-border', badge: 'bg-bg-tertiary text-text-muted',
  },
  PREMIUM: {
    etiket: 'Premium', fiyat: '99 ₺/ay', Ikon: Zap,
    renk: 'text-warning', bg: 'bg-warning/5',
    border: 'border-warning', badge: 'bg-warning/20 text-warning',
  },
  ULTRA: {
    etiket: 'Ultra', fiyat: '199 ₺/ay', Ikon: Crown,
    renk: 'text-accent', bg: 'bg-accent/5',
    border: 'border-accent', badge: 'bg-accent/20 text-accent',
  },
};

const PLAN_ORDER: PlanTuru[] = ['FREE', 'PREMIUM', 'ULTRA'];

type TabId = 'genel' | 'gorunum' | 'plan' | 'guvenlik';

const TABS: { id: TabId; etiket: string; Ikon: React.ElementType }[] = [
  { id: 'genel',    etiket: 'Genel',                Ikon: Settings },
  { id: 'gorunum',  etiket: 'Görünüm',              Ikon: Palette  },
  { id: 'plan',     etiket: 'Plan',                 Ikon: Crown    },
  { id: 'guvenlik', etiket: 'Güvenlik & Gizlilik',  Ikon: Shield   },
];

// ── Helper Sub-components ────────────────────────────────────────────────────

function SectionCard({
  baslik,
  aciklama,
  children,
  className,
}: {
  baslik: string;
  aciklama?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx(
      'rounded-xl border border-border bg-bg-primary p-6 shadow-sm shadow-black/[0.04]',
      className
    )}>
      <div className="mb-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">{baslik}</h3>
        {aciklama && <p className="mt-1 text-sm text-text-secondary">{aciklama}</p>}
      </div>
      {children}
    </div>
  );
}

function YakindaBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-bg-tertiary px-2.5 py-0.5 text-xs font-medium text-text-muted">
      Yakında
    </span>
  );
}

function FormInput({
  label,
  hint,
  readOnly,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  readOnly?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-text-secondary">{label}</label>
      <input
        readOnly={readOnly}
        {...props}
        className={clsx(
          'w-full rounded-lg border border-border px-4 py-2.5 text-sm text-text-primary',
          'focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors',
          readOnly
            ? 'bg-bg-tertiary text-text-disabled cursor-not-allowed'
            : 'bg-bg-secondary',
          props.className
        )}
      />
      {hint && <p className="mt-1 text-xs text-text-muted">{hint}</p>}
    </div>
  );
}

function PillToggle({
  aktif,
  onChange,
  solEtiket,
  sagEtiket,
  SolIkon,
  SagIkon,
}: {
  aktif: boolean;
  onChange: (val: boolean) => void;
  solEtiket: string;
  sagEtiket: string;
  SolIkon: React.ElementType;
  SagIkon: React.ElementType;
}) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-bg-secondary p-0.5 gap-0.5">
      <button
        type="button"
        onClick={() => onChange(false)}
        className={clsx(
          'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all',
          !aktif
            ? 'bg-bg-primary text-text-primary shadow-sm border border-border'
            : 'text-text-muted hover:text-text-secondary'
        )}
      >
        <SolIkon className="h-3.5 w-3.5" />
        {solEtiket}
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        className={clsx(
          'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all',
          aktif
            ? 'bg-bg-primary text-text-primary shadow-sm border border-border'
            : 'text-text-muted hover:text-text-secondary'
        )}
      >
        <SagIkon className="h-3.5 w-3.5" />
        {sagEtiket}
      </button>
    </div>
  );
}

// ── Tab Components ───────────────────────────────────────────────────────────

interface GenelTabProps {
  kullanici: KullaniciResponse | null;
  profilForm: ProfilGuncelleRequest;
  setProfilForm: React.Dispatch<React.SetStateAction<ProfilGuncelleRequest>>;
  profilKaydediliyor: boolean;
  profilHata: string | null;
  profilBasari: boolean;
  handleProfilKaydet: (e: React.FormEvent) => Promise<void>;
}

function GenelTab({
  kullanici,
  profilForm,
  setProfilForm,
  profilKaydediliyor,
  profilHata,
  profilBasari,
  handleProfilKaydet,
}: GenelTabProps) {
  const initials = kullanici
    ? `${kullanici.ad.charAt(0)}${kullanici.soyad.charAt(0)}`.toUpperCase()
    : '?';

  return (
    <SectionCard baslik="Profil" aciklama="Görünen adınızı ve para birimi tercihinizi güncelleyin.">
      {/* Avatar preview row */}
      <div className="flex items-center gap-4 mb-5 pb-5 border-b border-border">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full
                        bg-gradient-to-br from-accent to-[#38A169] text-lg font-bold text-white shadow">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-primary truncate">
            {profilForm.ad} {profilForm.soyad}
          </p>
          <p className="text-xs text-text-muted truncate">{kullanici?.email}</p>
        </div>
      </div>

      {profilHata && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2">
          <AlertCircle className="h-4 w-4 text-danger flex-shrink-0 mt-0.5" />
          <p className="text-sm text-danger">{profilHata}</p>
        </div>
      )}
      {profilBasari && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-3 py-2">
          <Check className="h-4 w-4 text-success" />
          <p className="text-sm text-success">Profil başarıyla güncellendi.</p>
        </div>
      )}

      <form onSubmit={handleProfilKaydet} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormInput
            label="Ad"
            value={profilForm.ad ?? ''}
            onChange={(e) => setProfilForm({ ...profilForm, ad: e.target.value })}
          />
          <FormInput
            label="Soyad"
            value={profilForm.soyad ?? ''}
            onChange={(e) => setProfilForm({ ...profilForm, soyad: e.target.value })}
          />
        </div>

        <FormInput
          label="E-posta"
          type="email"
          value={kullanici?.email ?? ''}
          readOnly
          hint="E-posta adresi değiştirilemez."
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            Tercih Edilen Para Birimi
          </label>
          <select
            value={profilForm.paraBirimi ?? 'TRY'}
            onChange={(e) => setProfilForm({ ...profilForm, paraBirimi: e.target.value as ParaBirimi })}
            className="w-full rounded-lg border border-border bg-bg-secondary px-4 py-2.5 text-sm
                       text-text-primary focus:border-accent focus:outline-none focus:ring-1
                       focus:ring-accent transition-colors"
          >
            {PARA_BIRIMLERI.map((p) => (
              <option key={p.deger} value={p.deger}>{p.sembol}  {p.etiket}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={profilKaydediliyor}
            className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold
                       text-white hover:bg-accent-hover disabled:opacity-60 transition-colors"
          >
            {profilKaydediliyor
              ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              : <Save className="h-4 w-4" />
            }
            {profilKaydediliyor ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </button>
        </div>
      </form>
    </SectionCard>
  );
}

function GorunumTab({ tema, temaDegistir }: { tema: 'light' | 'dark'; temaDegistir: () => void }) {
  return (
    <>
      <SectionCard baslik="Tema" aciklama="Arayüz temasını seçin.">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-primary">Renk Modu</p>
            <p className="text-xs text-text-muted mt-0.5">
              {tema === 'light' ? 'Açık tema aktif' : 'Koyu tema aktif'}
            </p>
          </div>
          <PillToggle
            aktif={tema === 'dark'}
            onChange={(isDark) => { if ((tema === 'dark') !== isDark) temaDegistir(); }}
            solEtiket="Açık"
            sagEtiket="Koyu"
            SolIkon={Sun}
            SagIkon={Moon}
          />
        </div>

        <div className="mt-5 pt-5 border-t border-border">
          <p className="text-sm font-medium text-text-primary mb-3">Vurgu Rengi</p>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-accent ring-2 ring-accent/40 ring-offset-2 ring-offset-bg-primary flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-text-primary">Teal</p>
              <p className="text-xs text-text-muted">#0F9B8E — Varsayılan</p>
            </div>
            <span className="ml-auto rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent">
              Aktif
            </span>
          </div>
        </div>
      </SectionCard>

      <SectionCard baslik="Görüntü Tercihleri">
        <div className="divide-y divide-border">
          <div className="flex items-center justify-between py-3 first:pt-0">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-secondary flex-shrink-0">
                <Monitor className="h-4 w-4 text-text-muted" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">Arayüz Yoğunluğu</p>
                <p className="text-xs text-text-muted">Kompakt veya geniş görünüm</p>
              </div>
            </div>
            <YakindaBadge />
          </div>

          <div className="flex items-center justify-between py-3 last:pb-0">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-secondary flex-shrink-0">
                <Globe className="h-4 w-4 text-text-muted" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">Dil</p>
                <p className="text-xs text-text-muted">Türkçe (varsayılan)</p>
              </div>
            </div>
            <YakindaBadge />
          </div>
        </div>
      </SectionCard>
    </>
  );
}

function PlanTab({ plan }: { plan: PlanTuru }) {
  const userPlanIndex = PLAN_ORDER.indexOf(plan);
  const meta = PLAN_META[plan];
  const PlanIkon = meta.Ikon;
  const [yukseltmeMesaji, setYukseltmeMesaji] = useState<string | null>(null);

  return (
    <>
      <SectionCard baslik="Mevcut Plan">
        <div className={clsx(
          'flex items-center gap-4 rounded-xl border p-4',
          meta.border, meta.bg
        )}>
          <div className={clsx('flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0', meta.bg)}>
            <PlanIkon className={clsx('h-5 w-5', meta.renk)} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-text-primary">{meta.etiket}</p>
            <p className="text-xs text-text-muted">{meta.fiyat}</p>
          </div>
          <span className={clsx('rounded-full px-3 py-1 text-xs font-semibold flex-shrink-0', meta.badge)}>
            Aktif Plan
          </span>
        </div>
      </SectionCard>

      <SectionCard baslik="Plan Karşılaştırması">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {PLAN_ORDER.map((p) => {
            const m = PLAN_META[p];
            const pIndex = PLAN_ORDER.indexOf(p);
            const isActive = p === plan;
            const isUpgrade = pIndex > userPlanIndex;
            const PIkon = m.Ikon;

            return (
              <div
                key={p}
                className={clsx(
                  'relative rounded-xl border p-4 transition-all',
                  isActive ? clsx(m.border, m.bg, 'glow-border') : 'border-border',
                  !isActive && pIndex < userPlanIndex && 'opacity-70'
                )}
              >
                {isActive && (
                  <span className={clsx(
                    'absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
                    m.badge
                  )}>
                    Mevcut
                  </span>
                )}

                <div className="flex items-center gap-2 mb-3">
                  <div className={clsx('flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0', m.bg)}>
                    <PIkon className={clsx('h-4 w-4', m.renk)} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">{m.etiket}</p>
                    <p className="text-xs text-text-muted">{m.fiyat}</p>
                  </div>
                </div>

                <ul className="space-y-1.5 mb-4">
                  {PLAN_OZELLIKLER[p].map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-xs text-text-secondary">
                      <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-success" />
                      {f}
                    </li>
                  ))}
                </ul>

                {isUpgrade && (
                  <button
                    onClick={() => setYukseltmeMesaji(
                      `${m.etiket} planına geçmek için destek@giderlerim.com adresine e-posta gönderin veya yönetici ile iletişime geçin.`
                    )}
                    className={clsx(
                      'w-full rounded-lg border px-3 py-2 text-xs font-semibold transition-colors',
                      p === 'ULTRA'
                        ? 'border-accent/40 bg-accent/10 text-accent hover:bg-accent/20'
                        : 'border-warning/40 bg-warning/10 text-warning hover:bg-warning/20'
                    )}>
                    {m.etiket}&apos;a Geç
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>

      {yukseltmeMesaji && (
        <div className="flex items-start gap-2 rounded-xl border border-accent/30 bg-accent/10 p-3">
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-accent mt-0.5" />
          <p className="text-xs text-accent">{yukseltmeMesaji}</p>
        </div>
      )}
    </>
  );
}

function GuvenlikTab({ onHesapSilAc }: { onHesapSilAc: () => void }) {
  return (
    <>
      <SectionCard baslik="Şifre">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-secondary flex-shrink-0">
              <Lock className="h-4 w-4 text-text-muted" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Şifre Değiştir</p>
              <p className="text-xs text-text-muted">Son değişiklik: bilinmiyor</p>
            </div>
          </div>
          <YakindaBadge />
        </div>

        <div className="space-y-3 opacity-50 pointer-events-none select-none">
          <FormInput label="Mevcut Şifre" type="password" value="" readOnly />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormInput label="Yeni Şifre" type="password" value="" readOnly />
            <FormInput label="Yeni Şifre (Tekrar)" type="password" value="" readOnly />
          </div>
        </div>
      </SectionCard>

      <SectionCard baslik="Aktif Oturumlar" aciklama="Hesabınıza bağlı cihazlar.">
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-bg-secondary px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 flex-shrink-0">
              <Monitor className="h-4 w-4 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary">Bu Tarayıcı</p>
              <p className="text-xs text-text-muted">Mevcut oturum · Web</p>
            </div>
            <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success flex-shrink-0">
              Aktif
            </span>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-border px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-secondary flex-shrink-0">
              <Smartphone className="h-4 w-4 text-text-muted" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary">Mobil Uygulama</p>
              <p className="text-xs text-text-muted">Yakında desteklenecek</p>
            </div>
            <YakindaBadge />
          </div>
        </div>
      </SectionCard>

      <div className="rounded-xl border border-danger/30 bg-danger/5 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 rounded-full bg-danger/10 p-2.5">
            <AlertTriangle className="h-5 w-5 text-danger" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-danger mb-1">
              Tehlikeli Bölge
            </h3>
            <p className="text-sm text-text-secondary mb-4">
              Hesabınızı silmek tüm verilerinizi — giderler, bütçeler ve analizler dahil —
              kalıcı olarak kaldıracaktır. Bu işlem geri alınamaz.
            </p>
            <div className="mb-4 flex gap-2 rounded-lg border border-border bg-bg-secondary px-3 py-2">
              <Info className="h-4 w-4 text-text-muted flex-shrink-0 mt-0.5" />
              <p className="text-xs text-text-muted">
                Hesap silme işlemi onaylandıktan sonra tüm veriler kalıcı olarak kaldırılır ve
                kurtarılamaz hale gelir.
              </p>
            </div>
            <button
              onClick={onHesapSilAc}
              className="flex items-center gap-2 rounded-lg border border-danger/50 bg-transparent
                         px-4 py-2 text-sm font-medium text-danger
                         hover:bg-danger hover:text-white transition-all"
            >
              <User className="h-4 w-4" />
              Hesabımı Kalıcı Olarak Sil
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function AyarlarPage() {
  const { kullanici, kullaniciGuncelle } = useAuthStore();
  const { tema, temaDegistir } = useUIStore();

  const [aktifTab, setAktifTab] = useState<TabId>('genel');
  const [hesapSilModalAcik, setHesapSilModalAcik] = useState(false);

  const [profilForm, setProfilForm] = useState<ProfilGuncelleRequest>({
    ad: kullanici?.ad ?? '',
    soyad: kullanici?.soyad ?? '',
    paraBirimi: kullanici?.paraBirimi ?? 'TRY',
  });
  const [profilKaydediliyor, setProfilKaydediliyor] = useState(false);
  const [profilHata, setProfilHata] = useState<string | null>(null);
  const [profilBasari, setProfilBasari] = useState(false);

  const plan = kullanici?.plan ?? 'FREE';
  const initials = kullanici
    ? `${kullanici.ad.charAt(0)}${kullanici.soyad.charAt(0)}`.toUpperCase()
    : '?';
  const planMeta = PLAN_META[plan];
  const PlanIkon = planMeta.Ikon;

  const handleProfilKaydet = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfilHata(null);
    setProfilBasari(false);
    setProfilKaydediliyor(true);
    try {
      const res = await apiClient.put('/kullanici/profil', profilForm);
      kullaniciGuncelle(res.data.data);
      setProfilBasari(true);
      setTimeout(() => setProfilBasari(false), 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setProfilHata(error?.response?.data?.message || 'Profil güncellenemedi.');
    } finally {
      setProfilKaydediliyor(false);
    }
  };

  const handleHesapSil = async () => {
    try {
      await apiClient.delete('/kullanici/hesap');
      sessionStorage.clear();
      window.location.href = '/giris';
    } catch {
      setHesapSilModalAcik(false);
    }
  };

  return (
    <PageContainer>
      {/* Mobile pill tab bar */}
      <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl border border-border bg-bg-primary p-1 lg:hidden">
        {TABS.map(({ id, etiket, Ikon }) => (
          <button
            key={id}
            onClick={() => setAktifTab(id)}
            className={clsx(
              'flex flex-shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
              aktifTab === id
                ? 'bg-accent text-white'
                : 'text-text-muted hover:text-text-primary hover:bg-bg-secondary'
            )}
          >
            <Ikon className="h-3.5 w-3.5" />
            {etiket}
          </button>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6 items-start">

        {/* Left sidebar */}
        <aside className="hidden lg:flex w-56 flex-shrink-0 flex-col gap-3">
          {/* Avatar block */}
          <div className="rounded-xl border border-border bg-bg-primary p-5 text-center shadow-sm shadow-black/[0.04]">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full
                            bg-gradient-to-br from-accent to-[#38A169] text-xl font-bold text-white shadow-lg">
              {initials}
            </div>
            <p className="text-sm font-semibold text-text-primary">
              {kullanici?.ad} {kullanici?.soyad}
            </p>
            <p className="mt-0.5 text-xs text-text-muted truncate px-2">{kullanici?.email}</p>
            <span className={clsx(
              'mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
              planMeta.badge
            )}>
              <PlanIkon className="h-3 w-3" />
              {planMeta.etiket}
            </span>
          </div>

          {/* Tab list */}
          <nav className="rounded-xl border border-border bg-bg-primary py-1 shadow-sm shadow-black/[0.04]">
            {TABS.map(({ id, etiket, Ikon }) => (
              <button
                key={id}
                onClick={() => setAktifTab(id)}
                className={clsx(
                  'group relative flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors',
                  aktifTab === id
                    ? 'text-accent bg-accent/5'
                    : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                )}
              >
                {aktifTab === id && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r-full bg-accent" />
                )}
                <Ikon className={clsx(
                  'h-4 w-4 flex-shrink-0',
                  aktifTab === id ? 'text-accent' : 'text-text-muted group-hover:text-text-secondary'
                )} />
                {etiket}
              </button>
            ))}
          </nav>
        </aside>

        {/* Right content panel */}
        <div className="min-w-0 flex-1 space-y-5">
          {aktifTab === 'genel' && (
            <GenelTab
              kullanici={kullanici}
              profilForm={profilForm}
              setProfilForm={setProfilForm}
              profilKaydediliyor={profilKaydediliyor}
              profilHata={profilHata}
              profilBasari={profilBasari}
              handleProfilKaydet={handleProfilKaydet}
            />
          )}
          {aktifTab === 'gorunum' && (
            <GorunumTab tema={tema} temaDegistir={temaDegistir} />
          )}
          {aktifTab === 'plan' && (
            <PlanTab plan={plan} />
          )}
          {aktifTab === 'guvenlik' && (
            <GuvenlikTab onHesapSilAc={() => setHesapSilModalAcik(true)} />
          )}
        </div>
      </div>

      <ConfirmDialog
        acik={hesapSilModalAcik}
        baslik="Hesabı Sil"
        mesaj="Hesabınızı ve tüm verilerinizi kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        onayEtiket="Evet, Hesabımı Sil"
        onOnayla={handleHesapSil}
        onIptal={() => setHesapSilModalAcik(false)}
      />
    </PageContainer>
  );
}
