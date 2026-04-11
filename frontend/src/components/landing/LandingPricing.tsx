'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CheckIcon, SoonIcon, XIcon } from '@/components/landing/icons';
import { shopierLandingUrl } from '@/config/shopier';
import {
  FIYAT_PRO_AYLIK_YILLIK_PAKETTE,
  FIYAT_ULTRA_AYLIK_YILLIK_PAKETTE,
  proGosterimAylikFiyat,
  ultraGosterimAylikFiyat,
  proYillikTasarrufTl,
  ultraYillikTasarrufTl,
} from '@/lib/planFiyatlari';

export function LandingPricing() {
  const [yillik, setYillik] = useState(false);

  const proAylik = proGosterimAylikFiyat(yillik);
  const ultraAylik = ultraGosterimAylikFiyat(yillik);
  const proYillikTasarruf = proYillikTasarrufTl();
  const ultraYillikTasarruf = ultraYillikTasarrufTl();

  const proOdemeUrl = shopierLandingUrl('pro', yillik);
  const ultraOdemeUrl = shopierLandingUrl('ultra', yillik);

  const odemeBtnClass =
    'block text-center py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-all hover:shadow-lg hover:shadow-brand-500/30 active:scale-[0.98]';
  const odemeBtnClassUltra =
    'block text-center py-3 rounded-xl border border-violet-500/50 bg-violet-500/90 hover:bg-violet-600 text-white text-sm font-semibold transition-all';

  return (
    <section id="fiyatlandirma" className="relative py-24 scroll-mt-20 [content-visibility:auto]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#070c18] via-[#0a1020] to-[#050810]" />
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-400 mb-3">Fiyatlandırma</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">İhtiyacınıza göre yükseltin</h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-2">
            Ücretsiz planla başlayın. Pro ve Ultra satın alımları güvenli ödeme için Shopier ödeme linki ile
            yapılır; ödeme sonrası planınız hesabınıza tanımlanır (otomasyon yoksa kısa süreli manuel işlem).
            Tüm katmanlar için limitler backend tarafında net tanımlıdır.
          </p>
        </div>

        <div className="inline-flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 p-1 mx-auto mb-12 w-full max-w-xs justify-center">
          <button
            type="button"
            onClick={() => setYillik(false)}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              !yillik ? 'bg-brand-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            Aylık
          </button>
          <button
            type="button"
            onClick={() => setYillik(true)}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              yillik ? 'bg-brand-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            Yıllık
            <span className="text-[10px] font-bold bg-green-500 text-white rounded-full px-1.5 py-0.5">-20%</span>
          </button>
        </div>

        <div className="grid sm:grid-cols-3 gap-5 items-stretch">
          <div className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-7">
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-400 mb-2">Ücretsiz</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">₺0</span>
                <span className="text-gray-400 text-sm">/ay</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Süresiz, kayıt ile hemen kullanım</p>
            </div>
            <ul className="space-y-3 flex-1 mb-8">
              {['Ayda 50 gider kaydı', 'Ayda 1 CSV yükleme', 'Dashboard ve kategoriler', 'Bütçe ve uyarılar', 'Mobil + web'].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
                  <CheckIcon /> {f}
                </li>
              ))}
              {['AI koç ve AI analizleri', 'Fiş / belge (OCR) yükleme'].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-gray-500">
                  <XIcon /> {f}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="block text-center py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-all"
            >
              Başla
            </Link>
          </div>

          <div className="relative flex flex-col rounded-2xl border border-brand-500/50 bg-gradient-to-b from-brand-500/15 to-brand-600/[0.07] p-7 shadow-[0_0_40px_-10px_rgba(70,95,255,0.5)]">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-500 px-3 py-1 text-[11px] font-bold text-white uppercase tracking-wide shadow-lg shadow-brand-500/40">
                En popüler
              </span>
            </div>
            <div className="mb-6">
              <p className="text-sm font-medium text-brand-300 mb-2">Pro</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">₺{proAylik}</span>
                <span className="text-gray-400 text-sm">/ay</span>
              </div>
              {yillik ? (
                <p className="text-xs text-green-400 mt-1">Yıllık ödemede {proYillikTasarruf} ₺ tasarruf</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">Yıllık: ₺{FIYAT_PRO_AYLIK_YILLIK_PAKETTE * 12} /yıl (-20%)</p>
              )}
            </div>
            <ul className="space-y-3 flex-1 mb-8">
              {[
                'Sınırsız gider',
                'Sınırsız CSV yükleme',
                'Fiş ve belge ile içe aktarma',
                'AI harcama koçu (sohbet)',
                'AI harcama analizi ve bütçe önerisi',
                'Destek taleplerinde otomatik yüksek öncelik (Pro ve Ultra)',
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-gray-200">
                  <CheckIcon /> {f}
                </li>
              ))}
              {['Anomali ve tasarruf fırsatı AI (Ultra’da)'].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-gray-500">
                  <XIcon /> {f}
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2">
              {proOdemeUrl ? (
                <a
                  href={proOdemeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={odemeBtnClass}
                >
                  Pro&apos;yu öde (Shopier)
                </a>
              ) : null}
              <Link
                href="/signup"
                className="block text-center py-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-all"
              >
                Ücretsiz hesap oluştur
              </Link>
            </div>
          </div>

          <div className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-7 ring-1 ring-violet-500/20">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-gray-400">Ultra (Aile)</p>
              <span className="text-[10px] font-bold uppercase tracking-wide bg-violet-500/20 text-violet-200 px-2 py-0.5 rounded">
                Aile · yol haritası
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-4 -mt-2">
              Çoklu hesap ve paylaşımlı bütçe gibi aile özellikleri geliştirme aşamasındadır; şu an bu planda tüm Pro
              özellikleri ve aşağıdaki gelişmiş AI analizleri sunulur.
            </p>
            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">₺{ultraAylik}</span>
                <span className="text-gray-400 text-sm">/ay</span>
              </div>
              {yillik ? (
                <p className="text-xs text-green-400 mt-1">Yıllık ödemede {ultraYillikTasarruf} ₺ tasarruf</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">Yıllık: ₺{FIYAT_ULTRA_AYLIK_YILLIK_PAKETTE * 12} /yıl (-20%)</p>
              )}
            </div>
            <ul className="space-y-3 flex-1 mb-8">
              {[
                { text: "Pro'daki her şey", icon: 'check' as const },
                { text: 'AI anomali tespiti', icon: 'check' as const },
                { text: 'AI tasarruf fırsatları analizi', icon: 'check' as const },
                { text: '5 üye hesabı', icon: 'soon' as const },
                { text: 'Paylaşımlı bütçe', icon: 'soon' as const },
                { text: 'Aile harcama raporu', icon: 'soon' as const },
              ].map((f) => (
                <li key={f.text} className="flex items-center gap-2.5 text-sm text-gray-300">
                  {f.icon === 'check' ? <CheckIcon /> : <SoonIcon />}
                  <span className={f.icon === 'soon' ? 'text-gray-400' : undefined}>
                    {f.text}
                    {f.icon === 'soon' ? <span className="text-violet-400/80 text-xs ml-1">(yakında)</span> : null}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2">
              {ultraOdemeUrl ? (
                <a
                  href={ultraOdemeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={odemeBtnClassUltra}
                >
                  Ultra&apos;yı öde (Shopier)
                </a>
              ) : null}
              <Link
                href="/signup"
                className="block text-center py-3 rounded-xl border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/15 text-white text-sm font-medium transition-all"
              >
                Ücretsiz hesap oluştur
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
