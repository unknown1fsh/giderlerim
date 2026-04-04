'use client';

import React, { useState } from 'react';
import { shopierOdemeUrl } from '@/config/shopier';
import { aiAnalizService } from '@/services/aiService';
import { AiAnalizResponse } from '@/types/ai.types';
import { useAuthStore } from '@/stores/authStore';
import { PlanTuru } from '@/types/kullanici.types';

const AY_ADLARI = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

const PLAN_SIRALAMA: Record<PlanTuru, number> = { FREE: 0, PREMIUM: 1, ULTRA: 2 };
const PLAN_AD: Record<PlanTuru, string> = { FREE: 'Ücretsiz', PREMIUM: 'Pro', ULTRA: 'Ultra' };

function PlanKilidi({ gerekliPlan }: { gerekliPlan: 'PREMIUM' | 'ULTRA' }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-center p-6">
      <svg className="mb-3 h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{PLAN_AD[gerekliPlan]} planı gerekiyor</p>
    </div>
  );
}

interface AnalizKartiProps {
  baslik: string;
  aciklama: string;
  gerekliPlan: 'PREMIUM' | 'ULTRA';
  kullaniciPlan: PlanTuru;
  analizYap: () => Promise<AiAnalizResponse>;
  ekGosterim?: React.ReactNode;
}

function AnalizKarti({ baslik, aciklama, gerekliPlan, kullaniciPlan, analizYap, ekGosterim }: AnalizKartiProps) {
  const [sonuc, setSonuc] = useState<AiAnalizResponse | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState('');
  const yetkili = PLAN_SIRALAMA[kullaniciPlan] >= PLAN_SIRALAMA[gerekliPlan];

  const calistir = async () => {
    setYukleniyor(true);
    setHata('');
    try {
      const resp = await analizYap();
      setSonuc(resp);
    } catch {
      setHata('Analiz yapılamadı. Tekrar deneyin.');
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div className={`relative rounded-2xl border bg-white p-6 dark:bg-gray-800 ${yetkili ? 'border-gray-200 dark:border-gray-700' : 'border-gray-200 dark:border-gray-700 overflow-hidden'}`}>
      {!yetkili && <PlanKilidi gerekliPlan={gerekliPlan} />}
      <div className={!yetkili ? 'opacity-30 pointer-events-none select-none' : ''}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <h3 className="text-base font-bold text-gray-800 dark:text-white">{baslik}</h3>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                gerekliPlan === 'ULTRA'
                  ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                  : 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400'
              }`}>{PLAN_AD[gerekliPlan]}</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{aciklama}</p>
          </div>
          <button
            onClick={calistir}
            disabled={yukleniyor || !yetkili}
            className="flex-shrink-0 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60 transition-colors"
          >
            {yukleniyor ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analiz...
              </span>
            ) : 'Analiz Et'}
          </button>
        </div>

        {ekGosterim}

        {hata && (
          <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{hata}</div>
        )}

        {sonuc && (
          <div className="mt-4 space-y-4">
            {sonuc.onbellekten && (
              <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                Önbellekten
              </span>
            )}
            <div className="rounded-xl bg-brand-50 p-4 dark:bg-brand-900/20">
              <p className="text-sm font-medium text-brand-800 dark:text-brand-200">{sonuc.ozet}</p>
            </div>
            {sonuc.bulgular.length > 0 && (
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Bulgular</h4>
                <ul className="space-y-1">
                  {sonuc.bulgular.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="mt-0.5 flex-shrink-0 text-orange-400">•</span> {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {sonuc.oneriler.length > 0 && (
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Öneriler</h4>
                <ul className="space-y-1">
                  {sonuc.oneriler.map((o, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="mt-0.5 flex-shrink-0 text-green-500">✓</span> {o}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {sonuc.oncelikliEylem && (
              <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400">Öncelikli Eylem</p>
                <p className="mt-1 text-sm text-orange-800 dark:text-orange-200">{sonuc.oncelikliEylem}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AnalizlerPage() {
  const { kullanici } = useAuthStore();
  const plan = kullanici?.plan ?? 'FREE';

  const bugun = new Date();
  const [ay, setAy] = useState(bugun.getMonth() + 1);
  const [yil, setYil] = useState(bugun.getFullYear());

  const yillar = [yil - 1, yil, yil + 1];
  const proSatinalUrl = shopierOdemeUrl('proAylik');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">AI Analizler</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Yapay zeka destekli finansal analiz ve öneriler
        </p>
      </div>

      {plan === 'FREE' && (
        <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-800 dark:bg-brand-900/20">
          <p className="text-sm text-brand-700 dark:text-brand-300">
            <span className="font-semibold">Pro planına</span> geçerek tüm AI analizlere erişin.{' '}
            {proSatinalUrl ? (
              <a href={proSatinalUrl} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
                Shopier ile satın al →
              </a>
            ) : (
              <a href="/#fiyatlandirma" className="underline hover:no-underline">Planı incele →</a>
            )}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AnalizKarti
          baslik="Harcama Analizi"
          aciklama="Seçilen ay için kategori bazlı harcama alışkanlıklarınızı analiz eder."
          gerekliPlan="PREMIUM"
          kullaniciPlan={plan}
          analizYap={async () => {
            const r = await aiAnalizService.harcamaAnaliziYap(ay, yil);
            return r.data;
          }}
          ekGosterim={
            <div className="mb-3 flex gap-2">
              <select value={ay} onChange={(e) => setAy(Number(e.target.value))}
                className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                {AY_ADLARI.map((ad, i) => <option key={i + 1} value={i + 1}>{ad}</option>)}
              </select>
              <select value={yil} onChange={(e) => setYil(Number(e.target.value))}
                className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                {yillar.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          }
        />

        <AnalizKarti
          baslik="Bütçe Önerisi"
          aciklama="Harcama geçmişinize göre kategori bazlı bütçe limitleri önerir."
          gerekliPlan="PREMIUM"
          kullaniciPlan={plan}
          analizYap={async () => {
            const r = await aiAnalizService.butceOnerisiAl();
            return r.data;
          }}
        />

        <AnalizKarti
          baslik="Anomali Tespiti"
          aciklama="Olağandışı ve şüpheli harcama kalıplarını tespit eder."
          gerekliPlan="ULTRA"
          kullaniciPlan={plan}
          analizYap={async () => {
            const r = await aiAnalizService.anomaliTespitEt();
            return r.data;
          }}
        />

        <AnalizKarti
          baslik="Tasarruf Fırsatları"
          aciklama="Harcamalarınızdaki tasarruf edilebilecek alanları belirler."
          gerekliPlan="ULTRA"
          kullaniciPlan={plan}
          analizYap={async () => {
            const r = await aiAnalizService.tasarrufFirsatlari();
            return r.data;
          }}
        />
      </div>
    </div>
  );
}
