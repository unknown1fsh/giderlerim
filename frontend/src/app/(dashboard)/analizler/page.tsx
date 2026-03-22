'use client';

import { useState } from 'react';
import {
  BarChart3,
  Wallet,
  AlertTriangle,
  TrendingDown,
  Loader2,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Lock,
} from 'lucide-react';
import { PageContainer } from '@/components/shared/PageContainer';
import { PageHeader } from '@/components/shared/PageHeader';
import { aiAnalizService } from '@/services/aiService';
import { AiAnalizResponse, AnalizTuru } from '@/types/ai.types';
import { useAuthStore } from '@/stores/authStore';
import { clsx } from 'clsx';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

interface AnalizKart {
  tur: AnalizTuru;
  baslik: string;
  aciklama: string;
  ikon: React.ElementType;
  renk: string;
  bgRenk: string;
  gerekliPlan: 'FREE' | 'PREMIUM' | 'ULTRA';
}

const ANALIZLER: AnalizKart[] = [
  {
    tur: 'HARCAMA_ANALIZI',
    baslik: 'Harcama Analizi',
    aciklama: 'Bu ayki harcamalarınızın detaylı AI analizi ve önerileri.',
    ikon: BarChart3,
    renk: 'text-accent',
    bgRenk: 'bg-accent/10',
    gerekliPlan: 'PREMIUM',
  },
  {
    tur: 'BUTCE_ONERISI',
    baslik: 'Bütçe Önerisi',
    aciklama: 'Harcama alışkanlıklarınıza göre kişiselleştirilmiş bütçe planı.',
    ikon: Wallet,
    renk: 'text-success',
    bgRenk: 'bg-success/10',
    gerekliPlan: 'PREMIUM',
  },
  {
    tur: 'ANOMALI_TESPITI',
    baslik: 'Anomali Tespiti',
    aciklama: 'Olağandışı ve şüpheli harcamaların tespiti ve analizi.',
    ikon: AlertTriangle,
    renk: 'text-warning',
    bgRenk: 'bg-warning/10',
    gerekliPlan: 'ULTRA',
  },
  {
    tur: 'TASARRUF_FIRSATI',
    baslik: 'Tasarruf Fırsatları',
    aciklama: 'Harcamalarınızı azaltabilecek ve tasarruf edebileceğiniz alanlar.',
    ikon: TrendingDown,
    renk: 'text-info',
    bgRenk: 'bg-info/10',
    gerekliPlan: 'PREMIUM',
  },
];

const bugun = new Date();

function AnalizKartBileseni({ kart, plan }: { kart: AnalizKart; plan: string }) {
  const [yukleniyor, setYukleniyor] = useState(false);
  const [sonuc, setSonuc] = useState<AiAnalizResponse | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const [acik, setAcik] = useState(false);

  const planSiralamasi = { FREE: 0, PREMIUM: 1, ULTRA: 2 };
  const kilitli =
    planSiralamasi[plan as keyof typeof planSiralamasi] <
    planSiralamasi[kart.gerekliPlan];

  const analizEt = async () => {
    if (kilitli) return;
    setYukleniyor(true);
    setHata(null);
    try {
      let res: { data: AiAnalizResponse };
      if (kart.tur === 'HARCAMA_ANALIZI') {
        res = await aiAnalizService.harcamaAnaliziYap(
          bugun.getMonth() + 1,
          bugun.getFullYear()
        );
      } else if (kart.tur === 'BUTCE_ONERISI') {
        res = await aiAnalizService.butceOnerisiAl();
      } else if (kart.tur === 'ANOMALI_TESPITI') {
        res = await aiAnalizService.anomaliTespitEt();
      } else {
        res = await aiAnalizService.tasarrufFirsatlari();
      }
      setSonuc(res.data);
      setAcik(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setHata(error?.response?.data?.message || 'Analiz yapılırken hata oluştu.');
    } finally {
      setYukleniyor(false);
    }
  };

  const Ikon = kart.ikon;

  return (
    <div className="rounded-xl border border-border bg-bg-primary shadow-sm shadow-black/[0.04] overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={clsx('rounded-xl p-2.5', kart.bgRenk)}>
              <Ikon className={clsx('h-5 w-5', kart.renk)} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-text-primary">{kart.baslik}</h3>
                {kart.gerekliPlan !== 'FREE' && (
                  <span className={clsx(
                    'rounded-full px-1.5 py-0.5 text-xs font-medium',
                    kart.gerekliPlan === 'ULTRA' ? 'bg-accent/20 text-accent' : 'bg-warning/20 text-warning'
                  )}>
                    {kart.gerekliPlan}
                  </span>
                )}
              </div>
              <p className="text-xs text-text-muted mt-0.5">{kart.aciklama}</p>
            </div>
          </div>
        </div>

        {kilitli ? (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-bg-secondary px-4 py-3 text-sm text-text-muted">
            <Lock className="h-4 w-4" />
            <span>{kart.gerekliPlan} planı gerektirir</span>
          </div>
        ) : (
          <button
            onClick={analizEt}
            disabled={yukleniyor}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-accent/10 border border-accent/30 px-4 py-2.5 text-sm font-medium text-accent hover:bg-accent/20 disabled:opacity-60 transition-colors"
          >
            {yukleniyor ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analiz Yapılıyor...
              </>
            ) : (
              <>
                <Ikon className="h-4 w-4" />
                Analiz Et
              </>
            )}
          </button>
        )}

        {hata && (
          <div className="mt-3 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
            {hata}
          </div>
        )}
      </div>

      {/* Result */}
      {sonuc && (
        <div className="border-t border-border">
          <button
            onClick={() => setAcik(!acik)}
            className="flex w-full items-center justify-between px-5 py-3 text-sm font-medium text-text-primary hover:bg-bg-secondary transition-colors"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>Analiz Sonucu</span>
              {sonuc.onbellekten && (
                <div className="flex items-center gap-1 rounded-full bg-info/10 px-2 py-0.5">
                  <Clock className="h-3 w-3 text-info" />
                  <span className="text-xs text-info">Önbellekten</span>
                </div>
              )}
            </div>
            {acik ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {acik && (
            <div className="px-5 pb-5 space-y-4">
              {/* Tarih */}
              <p className="text-xs text-text-disabled">
                {(() => {
                  try {
                    return format(parseISO(sonuc.olusturmaTarihi), 'd MMMM yyyy HH:mm', { locale: tr });
                  } catch {
                    return '';
                  }
                })()}
              </p>

              {/* Özet */}
              <div className="rounded-lg bg-bg-secondary p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Özet</p>
                <p className="text-sm text-text-primary leading-relaxed">{sonuc.ozet}</p>
              </div>

              {/* Bulgular */}
              {sonuc.bulgular.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Bulgular</p>
                  <ul className="space-y-1.5">
                    {sonuc.bulgular.map((bulgu, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-text-primary">
                        <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
                        {bulgu}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Öneriler */}
              {sonuc.oneriler.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Öneriler</p>
                  <ul className="space-y-1.5">
                    {sonuc.oneriler.map((oneri, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-text-primary">
                        <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                        {oneri}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Öncelikli Eylem */}
              {sonuc.oncelikliEylem && (
                <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-1">
                    Öncelikli Eylem
                  </p>
                  <p className="text-sm text-text-primary">{sonuc.oncelikliEylem}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AnalizlerPage() {
  const { kullanici } = useAuthStore();
  const plan = kullanici?.plan ?? 'FREE';

  return (
    <PageContainer>
      <PageHeader
        baslik="AI Analizler"
        altBaslik="Yapay zeka destekli finansal analizleriniz"
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {ANALIZLER.map((kart) => (
          <AnalizKartBileseni key={kart.tur} kart={kart} plan={plan} />
        ))}
      </div>
    </PageContainer>
  );
}
