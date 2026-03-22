'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Settings,
  Plus,
  RotateCcw,
  Edit,
  Trash2,
  Save,
  X,
  AlertTriangle,
  Check,
  Lock,
} from 'lucide-react';
import { PageContainer } from '@/components/shared/PageContainer';
import { PageHeader } from '@/components/shared/PageHeader';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { adminService } from '@/services/adminService';
import { SistemParametresiDto, SistemParametresiOlusturRequest } from '@/types/admin.types';
import { clsx } from 'clsx';

type Kategori = 'HEPSI' | 'GENEL' | 'GUVENLIK' | 'AI' | 'SISTEM' | 'PLAN';

const KATEGORILER: { deger: Kategori; etiket: string; renk: string }[] = [
  { deger: 'HEPSI', etiket: 'Tümü', renk: 'text-text-secondary' },
  { deger: 'GENEL', etiket: 'Genel', renk: 'text-text-secondary' },
  { deger: 'GUVENLIK', etiket: 'Güvenlik', renk: 'text-danger' },
  { deger: 'AI', etiket: 'Yapay Zeka', renk: 'text-accent' },
  { deger: 'SISTEM', etiket: 'Sistem', renk: 'text-warning' },
  { deger: 'PLAN', etiket: 'Planlar', renk: 'text-success' },
];

const TIP_RENK: Record<string, string> = {
  STRING: 'bg-accent/10 text-accent',
  NUMBER: 'bg-success/10 text-success',
  BOOLEAN: 'bg-warning/10 text-warning',
};

interface SatirProps {
  parametre: SistemParametresiDto;
  onGuncelle: (id: number, deger: string) => Promise<void>;
  onVarsayilan: (id: number) => Promise<void>;
  onSil: (id: number) => void;
}

function ParametreSatiri({ parametre, onGuncelle, onVarsayilan, onSil }: SatirProps) {
  const [duzenle, setDuzenle] = useState(false);
  const [yeniDeger, setYeniDeger] = useState(parametre.deger);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  const varsayilandanFarkli = parametre.deger !== parametre.varsayilanDeger;

  const handleKaydet = async () => {
    try {
      setYukleniyor(true);
      setHata(null);
      await onGuncelle(parametre.id, yeniDeger);
      setDuzenle(false);
    } catch {
      setHata('Güncellenemedi');
    } finally {
      setYukleniyor(false);
    }
  };

  const handleIptal = () => {
    setYeniDeger(parametre.deger);
    setDuzenle(false);
    setHata(null);
  };

  const handleVarsayilan = async () => {
    try {
      setYukleniyor(true);
      await onVarsayilan(parametre.id);
      setYeniDeger(parametre.varsayilanDeger);
    } catch {
      setHata('Sıfırlanamadı');
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div className={clsx(
      'rounded-xl border p-4 transition-colors',
      varsayilandanFarkli ? 'border-warning/40 bg-warning/5' : 'border-border bg-bg-secondary'
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <code className="text-sm font-mono font-semibold text-text-primary">{parametre.anahtar}</code>
            <span className={clsx('rounded-full px-2 py-0.5 text-xs font-medium', TIP_RENK[parametre.tip] ?? 'bg-bg-tertiary text-text-muted')}>
              {parametre.tip}
            </span>
            {!parametre.duzenlenebilir && (
              <span className="flex items-center gap-1 rounded-full bg-bg-tertiary px-2 py-0.5 text-xs text-text-muted">
                <Lock className="h-3 w-3" /> Salt okunur
              </span>
            )}
            {varsayilandanFarkli && (
              <span className="rounded-full bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning">
                Özelleştirilmiş
              </span>
            )}
          </div>
          {parametre.aciklama && (
            <p className="text-xs text-text-muted mb-2">{parametre.aciklama}</p>
          )}

          {/* Değer alanı */}
          {duzenle ? (
            <div className="space-y-2">
              {parametre.tip === 'BOOLEAN' ? (
                <div className="flex gap-3">
                  {['true', 'false'].map((val) => (
                    <button
                      key={val}
                      onClick={() => setYeniDeger(val)}
                      className={clsx(
                        'rounded-lg border px-4 py-1.5 text-sm font-medium transition-colors',
                        yeniDeger === val
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border bg-bg-tertiary text-text-secondary hover:border-accent/50'
                      )}
                    >
                      {val === 'true' ? 'Açık (true)' : 'Kapalı (false)'}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type={parametre.tip === 'NUMBER' ? 'number' : 'text'}
                  value={yeniDeger}
                  onChange={(e) => setYeniDeger(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg-tertiary px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
                  autoFocus
                />
              )}
              {hata && <p className="text-xs text-danger">{hata}</p>}
              <div className="flex gap-2">
                <button
                  onClick={handleKaydet}
                  disabled={yukleniyor}
                  className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-hover transition-colors disabled:opacity-60"
                >
                  {yukleniyor ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Save className="h-3 w-3" />}
                  Kaydet
                </button>
                <button
                  onClick={handleIptal}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-bg-tertiary px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-border transition-colors"
                >
                  <X className="h-3 w-3" /> İptal
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="rounded-lg border border-border bg-bg-tertiary px-3 py-1.5 font-mono text-sm text-text-primary">
                  {parametre.deger}
                </span>
                {varsayilandanFarkli && (
                  <span className="text-xs text-text-muted">
                    (Varsayılan: <code className="font-mono">{parametre.varsayilanDeger}</code>)
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Aksiyonlar */}
        {!duzenle && (
          <div className="flex items-center gap-1 flex-shrink-0">
            {parametre.duzenlenebilir && (
              <button
                onClick={() => { setDuzenle(true); setYeniDeger(parametre.deger); }}
                className="rounded-lg p-1.5 text-text-muted hover:bg-accent/10 hover:text-accent transition-colors"
                title="Düzenle"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
            {varsayilandanFarkli && parametre.duzenlenebilir && (
              <button
                onClick={handleVarsayilan}
                disabled={yukleniyor}
                className="rounded-lg p-1.5 text-text-muted hover:bg-warning/10 hover:text-warning transition-colors"
                title="Varsayılana sıfırla"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => onSil(parametre.id)}
              className="rounded-lg p-1.5 text-text-muted hover:bg-danger/10 hover:text-danger transition-colors"
              title="Sil"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface YeniParametreFormProps {
  onKapat: () => void;
  onKaydet: (req: SistemParametresiOlusturRequest) => Promise<void>;
}

function YeniParametreForm({ onKapat, onKaydet }: YeniParametreFormProps) {
  const [form, setForm] = useState<SistemParametresiOlusturRequest>({
    anahtar: '',
    deger: '',
    varsayilanDeger: '',
    aciklama: '',
    tip: 'STRING',
    kategori: 'GENEL',
  });
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  const handleKaydet = async () => {
    if (!form.anahtar || !form.deger || !form.varsayilanDeger) {
      setHata('Anahtar, değer ve varsayılan değer zorunludur');
      return;
    }
    try {
      setYukleniyor(true);
      setHata(null);
      await onKaydet(form);
      onKapat();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      setHata(msg.includes('409') || msg.includes('Conflict') ? 'Bu anahtar zaten mevcut' : 'Parametre eklenemedi');
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div className="rounded-xl border-2 border-dashed border-accent/40 bg-accent/5 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-text-primary">Yeni Parametre Ekle</h3>
        <button onClick={onKapat} className="rounded-lg p-1 hover:bg-bg-tertiary transition-colors">
          <X className="h-4 w-4 text-text-muted" />
        </button>
      </div>
      {hata && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" /> {hata}
        </div>
      )}
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-text-muted">Anahtar *</label>
          <input
            type="text"
            placeholder="ornek.anahtar.adi"
            value={form.anahtar}
            onChange={(e) => setForm({ ...form, anahtar: e.target.value })}
            className="w-full rounded-lg border border-border bg-bg-secondary px-3 py-2 font-mono text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-text-muted">Değer *</label>
          <input
            type="text"
            value={form.deger}
            onChange={(e) => setForm({ ...form, deger: e.target.value })}
            className="w-full rounded-lg border border-border bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-text-muted">Varsayılan Değer *</label>
          <input
            type="text"
            value={form.varsayilanDeger}
            onChange={(e) => setForm({ ...form, varsayilanDeger: e.target.value })}
            className="w-full rounded-lg border border-border bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-text-muted">Açıklama</label>
          <input
            type="text"
            value={form.aciklama}
            onChange={(e) => setForm({ ...form, aciklama: e.target.value })}
            className="w-full rounded-lg border border-border bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-text-muted">Tip</label>
          <select
            value={form.tip}
            onChange={(e) => setForm({ ...form, tip: e.target.value as 'STRING' | 'NUMBER' | 'BOOLEAN' })}
            className="w-full rounded-lg border border-border bg-bg-secondary px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
          >
            <option value="STRING">Metin (STRING)</option>
            <option value="NUMBER">Sayı (NUMBER)</option>
            <option value="BOOLEAN">Boolean (true/false)</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-text-muted">Kategori</label>
          <select
            value={form.kategori}
            onChange={(e) => setForm({ ...form, kategori: e.target.value as SistemParametresiOlusturRequest['kategori'] })}
            className="w-full rounded-lg border border-border bg-bg-secondary px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
          >
            <option value="GENEL">Genel</option>
            <option value="GUVENLIK">Güvenlik</option>
            <option value="AI">Yapay Zeka</option>
            <option value="SISTEM">Sistem</option>
            <option value="PLAN">Planlar</option>
          </select>
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        <button
          onClick={onKapat}
          className="rounded-lg border border-border bg-bg-secondary px-4 py-2 text-sm font-medium text-text-secondary hover:bg-bg-tertiary transition-colors"
        >
          İptal
        </button>
        <button
          onClick={handleKaydet}
          disabled={yukleniyor}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors disabled:opacity-60"
        >
          {yukleniyor ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Check className="h-4 w-4" />}
          Parametre Ekle
        </button>
      </div>
    </div>
  );
}

export default function AdminSistemParametreleriPage() {
  const [parametreler, setParametreler] = useState<SistemParametresiDto[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState<string | null>(null);
  const [aktifKategori, setAktifKategori] = useState<Kategori>('HEPSI');
  const [yeniFormAcik, setYeniFormAcik] = useState(false);
  const [silId, setSilId] = useState<number | null>(null);

  const veriYukle = useCallback(async () => {
    try {
      setYukleniyor(true);
      setHata(null);
      const data = await adminService.parametreleriGetir();
      setParametreler(data);
    } catch {
      setHata('Parametreler yüklenemedi');
    } finally {
      setYukleniyor(false);
    }
  }, []);

  useEffect(() => {
    veriYukle();
  }, [veriYukle]);

  const handleGuncelle = async (id: number, deger: string) => {
    await adminService.parametreGuncelle(id, { deger });
    await veriYukle();
  };

  const handleVarsayilan = async (id: number) => {
    await adminService.parametreVarsayilanaGetir(id);
    await veriYukle();
  };

  const handleYeniParametre = async (req: SistemParametresiOlusturRequest) => {
    await adminService.parametreOlustur(req);
    await veriYukle();
  };

  const handleSil = async () => {
    if (silId === null) return;
    await adminService.parametreSil(silId);
    setSilId(null);
    await veriYukle();
  };

  const filtrelenmis = aktifKategori === 'HEPSI'
    ? parametreler
    : parametreler.filter((p) => p.kategori === aktifKategori);

  const ozellestirilmisSayisi = parametreler.filter((p) => p.deger !== p.varsayilanDeger).length;

  return (
    <PageContainer>
      <PageHeader
        baslik="Sistem Parametreleri"
        altBaslik={`${parametreler.length} parametre${ozellestirilmisSayisi > 0 ? ` • ${ozellestirilmisSayisi} özelleştirilmiş` : ''}`}
        eylem={
          <button
            onClick={() => setYeniFormAcik(true)}
            className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
          >
            <Plus className="h-4 w-4" />
            Yeni Parametre
          </button>
        }
      />

      {hata && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" /> {hata}
        </div>
      )}

      {/* Yeni parametre formu */}
      {yeniFormAcik && (
        <div className="mb-6">
          <YeniParametreForm
            onKapat={() => setYeniFormAcik(false)}
            onKaydet={handleYeniParametre}
          />
        </div>
      )}

      {/* Kategori tabları */}
      <div className="mb-5 flex flex-wrap gap-2">
        {KATEGORILER.map((k) => {
          const sayi = k.deger === 'HEPSI'
            ? parametreler.length
            : parametreler.filter((p) => p.kategori === k.deger).length;
          return (
            <button
              key={k.deger}
              onClick={() => setAktifKategori(k.deger)}
              className={clsx(
                'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
                aktifKategori === k.deger
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border bg-bg-secondary text-text-muted hover:border-accent/50 hover:text-text-secondary'
              )}
            >
              <span>{k.etiket}</span>
              <span className={clsx(
                'rounded-full px-1.5 py-0.5 text-xs',
                aktifKategori === k.deger ? 'bg-accent/20' : 'bg-bg-tertiary'
              )}>
                {sayi}
              </span>
            </button>
          );
        })}
      </div>

      {/* Parametre listesi */}
      {yukleniyor ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-accent" />
        </div>
      ) : filtrelenmis.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Settings className="mb-3 h-10 w-10 text-text-muted" />
          <p className="text-sm text-text-muted">Bu kategoride parametre yok</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtrelenmis.map((p) => (
            <ParametreSatiri
              key={p.id}
              parametre={p}
              onGuncelle={handleGuncelle}
              onVarsayilan={handleVarsayilan}
              onSil={setSilId}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        acik={silId !== null}
        baslik="Parametreyi Sil"
        mesaj="Bu sistem parametresini silmek istediğinizden emin misiniz?"
        onayEtiket="Evet, Sil"
        onOnayla={handleSil}
        onIptal={() => setSilId(null)}
      />
    </PageContainer>
  );
}
