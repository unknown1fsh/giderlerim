'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

const CheckIcon = () => (
  <svg className="w-4 h-4 text-brand-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SoonIcon = () => (
  <svg className="w-4 h-4 text-violet-400/90 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
    />
  </svg>
);

const LockIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
    />
  </svg>
);

function DashboardMockup() {
  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="absolute inset-0 rounded-2xl bg-brand-500/20 blur-2xl scale-95 animate-glow-pulse" />
      <div className="relative rounded-2xl border border-white/10 bg-[#0f1628]/90 backdrop-blur-md shadow-2xl overflow-hidden animate-float">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <span className="text-xs text-gray-400 font-medium">Örnek panel — Nisan 2026</span>
          <div className="w-16" />
        </div>
        <p className="px-5 pt-3 text-[10px] text-gray-500">Gösterim amaçlı örnek veriler</p>
        <div className="p-5 pt-2 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Toplam', value: '₺8.240', color: 'text-brand-400', bg: 'bg-brand-500/10' },
              { label: 'Nakit', value: '₺2.100', color: 'text-green-400', bg: 'bg-green-500/10' },
              { label: 'K. Kartı', value: '₺6.140', color: 'text-red-400', bg: 'bg-red-500/10' },
            ].map((stat) => (
              <div key={stat.label} className={`rounded-xl ${stat.bg} p-3`}>
                <p className="text-[10px] text-gray-400 mb-1">{stat.label}</p>
                <p className={`text-sm font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-white/5 p-3">
            <p className="text-[10px] text-gray-400 mb-3">Haftalık harcama</p>
            <div className="flex items-end gap-1.5 h-12">
              {[45, 70, 30, 85, 55, 90, 60].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-sm origin-bottom"
                    style={{
                      height: `${h}%`,
                      background: i === 5 ? '#465fff' : 'rgba(70,95,255,0.3)',
                      animation: `bar-grow 0.6s ease-out ${i * 0.08}s both`,
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-1.5 mt-1.5">
              {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((d) => (
                <p key={d} className="flex-1 text-center text-[8px] text-gray-500">
                  {d}
                </p>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            {[
              { icon: '🛒', name: 'Market', amount: '-₺340', cat: 'Gıda' },
              { icon: '⛽', name: 'Benzin', amount: '-₺650', cat: 'Ulaşım' },
              { icon: '🎬', name: 'Netflix', amount: '-₺170', cat: 'Eğlence' },
            ].map((tx) => (
              <div key={tx.name} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{tx.icon}</span>
                  <div>
                    <p className="text-[11px] font-medium text-white">{tx.name}</p>
                    <p className="text-[9px] text-gray-500">{tx.cat}</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-red-400">{tx.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const navLinkClass =
  'text-sm font-medium text-gray-400 hover:text-white transition-colors hidden md:inline';

export function LandingPageClient() {
  const [yillik, setYillik] = useState(false);

  const proAylik = yillik ? 79 : 99;
  const ultraAylik = yillik ? 159 : 199;
  const proYillikTasarruf = (99 - proAylik) * 12;
  const ultraYillikTasarruf = (199 - ultraAylik) * 12;

  return (
    <div className="min-h-screen bg-[#050810] text-white overflow-x-hidden selection:bg-brand-500/40">
      {/* Film grain + vignette */}
      <div
        className="pointer-events-none fixed inset-0 z-[1] opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(70,95,255,0.15),transparent)]" />

      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#050810]/75 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Link href="/" className="shrink-0 flex items-center gap-2">
                <Image src="/images/logo/logo-dark.svg" alt="Giderlerim" width={130} height={30} priority />
              </Link>
              <span className="hidden sm:inline text-[11px] text-gray-600 font-medium tracking-wide truncate">
                www.giderlerim.net
              </span>
            </div>
            <div className="flex items-center gap-1 md:gap-5">
              <a href="#nasil-calisir" className={navLinkClass}>
                Nasıl çalışır?
              </a>
              <a href="#ozellikler" className={navLinkClass}>
                Özellikler
              </a>
              <a href="#fiyatlandirma" className={navLinkClass}>
                Fiyatlar
              </a>
              <Link
                href="/signin"
                className="hidden sm:inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Giriş
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-all hover:shadow-lg hover:shadow-brand-500/25 active:scale-[0.98]"
              >
                Ücretsiz başla
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[min(100dvh,920px)] flex flex-col justify-center pt-20 pb-16 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-[28rem] h-[28rem] rounded-full bg-brand-500/12 blur-3xl animate-blob" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-violet-600/10 blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-cyan-500/8 blur-3xl animate-blob animation-delay-4000" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)`,
            backgroundSize: '56px 56px',
          }}
        />

        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/[0.08] px-3 py-1.5 mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-widest text-brand-300">
                  Web · iOS · Android — tek hesap
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.35rem] font-bold leading-[1.08] tracking-tight mb-6">
                Harcamalarınızı{' '}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, #93a8ff 0%, #c4b5fd 45%, #67e8f9 100%)',
                  }}
                >
                  görünür
                </span>
                <br />
                kılın, bütçeyi{' '}
                <span className="text-white underline decoration-brand-500/50 decoration-2 underline-offset-4">
                  kontrol altına
                </span>{' '}
                alın.
              </h1>

              <p className="text-lg text-gray-400 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
                Giderlerim; manuel kayıt, banka CSV&apos;si veya fiş fotoğrafı ile içe aktarma, kategori
                bütçeleri, akıllı uyarılar ve yapay zeka harcama koçu sunar. Türkiye&apos;deki günlük
                harcama alışkanlıklarına göre tasarlandı.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-10">
                <Link
                  href="/signup"
                  className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-base transition-all hover:shadow-xl hover:shadow-brand-500/30 hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  Hemen ücretsiz hesap aç
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                <a
                  href="#nasil-calisir"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white font-medium text-base transition-all"
                >
                  Nasıl çalışır?
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                  </svg>
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start text-xs text-gray-500">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
                  <ShieldIcon />
                  HTTPS ile şifreli bağlantı
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
                  <LockIcon />
                  Veriler hesabınıza özel
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
                  🇹🇷 TRY ve yerel kategoriler
                </span>
              </div>
            </div>

            <div className="relative z-10 w-full max-w-md lg:max-w-none mx-auto animate-fade-in animation-delay-400">
              <DashboardMockup />
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050810] to-transparent pointer-events-none" />
      </section>

      {/* Nasıl çalışır */}
      <section id="nasil-calisir" className="relative py-24 scroll-mt-20 border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-400 mb-3">Nasıl çalışır?</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Dört adımda kontrol sizde</h2>
            <p className="text-gray-400">
              Karmaşık tablolar yok: kayıt olun, veriyi girin veya içe aktarın, bütçe tanımlayın, uyarılar ve AI
              ile takip edin.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Ücretsiz hesap',
                desc: 'E-posta ile kayıt; web veya mobil uygulamadan aynı hesapla devam edin.',
                accent: 'from-brand-500/30 to-transparent',
              },
              {
                step: '02',
                title: 'Harcama kaydı',
                desc: 'Tek tek ekleyin, banka CSV yükleyin (ücretsiz planda ayda 1) veya Pro ile fiş ve belge yükleyin.',
                accent: 'from-violet-500/25 to-transparent',
              },
              {
                step: '03',
                title: 'Bütçe ve uyarılar',
                desc: 'Kategori limitleri ve eşik uyarıları ile ay sonu sürprizlerini azaltın.',
                accent: 'from-cyan-500/20 to-transparent',
              },
              {
                step: '04',
                title: 'AI koç ve analiz',
                desc: 'Pro ve Ultra planlarda sohbet koçu; gelişmiş analiz türleri Ultra ile genişler.',
                accent: 'from-amber-500/20 to-transparent',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="group relative rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-transparent p-6 hover:border-brand-500/30 transition-colors"
              >
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.accent} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}
                />
                <p className="text-4xl font-black text-white/10 mb-3 font-mono">{item.step}</p>
                <h3 className="text-lg font-semibold text-white mb-2 relative">{item.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed relative">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Özellikler */}
      <section id="ozellikler" className="relative py-24 scroll-mt-20 bg-[#070c18]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-400 mb-3">Neden Giderlerim?</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Vaat değil: <span className="text-brand-400">bugün kullanılabilen</span> özellikler
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              Aşağıdakiler uygulamada mevcut. Yakında eklenecekleri ayrıca işaretledik.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                emoji: '📊',
                title: 'Özet ve gider listesi',
                desc: 'Web ve mobilde toplamlar, ödeme yöntemi kırılımı ve filtreli gider geçmişi.',
                border: 'border-white/10 hover:border-brand-500/40',
                grad: 'from-brand-500/15 to-transparent',
              },
              {
                emoji: '📁',
                title: 'CSV içe aktarma',
                desc: 'Banka hesap özetinizi CSV olarak yükleyin; ücretsiz planda ayda 1, Pro ve Ultra’da sınırsız.',
                border: 'border-white/10 hover:border-emerald-500/40',
                grad: 'from-emerald-500/12 to-transparent',
              },
              {
                emoji: '📸',
                title: 'Belge ve fiş (Pro+)',
                desc: 'PDF veya görüntü yükleyerek AI ile tutar ve kategori çıkarımı — Premium ve Ultra’da.',
                border: 'border-white/10 hover:border-sky-500/40',
                grad: 'from-sky-500/12 to-transparent',
              },
              {
                emoji: '💬',
                title: 'AI harcama koçu',
                desc: 'Sohbet arayüzüyle harcama alışkanlıklarınız hakkında soru sorun; Pro ve Ultra’da aktif.',
                border: 'border-white/10 hover:border-violet-500/40',
                grad: 'from-violet-500/15 to-transparent',
              },
              {
                emoji: '📈',
                title: 'AI analizleri',
                desc: 'Aylık harcama analizi ve bütçe önerisi Pro’da; anomali ve tasarruf fırsatı analizleri Ultra’da.',
                border: 'border-white/10 hover:border-amber-500/40',
                grad: 'from-amber-500/12 to-transparent',
              },
              {
                emoji: '🔔',
                title: 'Akıllı uyarılar',
                desc: 'Bütçe aşımı, yaklaşan limit ve olağandışı harcama bildirimleri ile kontrolü elinizde tutun.',
                border: 'border-white/10 hover:border-orange-500/40',
                grad: 'from-orange-500/12 to-transparent',
              },
            ].map((f) => (
              <div
                key={f.title}
                className={`group rounded-2xl border bg-gradient-to-br ${f.grad} ${f.border} p-6 transition-all duration-300 hover:-translate-y-1`}
              >
                <div className="mb-3 text-3xl">{f.emoji}</div>
                <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-dashed border-brand-500/30 bg-brand-500/[0.06] p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="text-xl">🚀</span> Yol haritası — yakında
              </h3>
              <span className="self-start sm:self-auto text-[11px] font-bold uppercase tracking-wide text-brand-200 bg-brand-500/25 px-3 py-1 rounded-full">
                Geliştiriliyor
              </span>
            </div>
            <ul className="grid sm:grid-cols-2 gap-4 text-sm text-gray-400">
              <li>
                <strong className="text-gray-300">Banka SMS parse:</strong> Türkiye&apos;deki yaygın banka SMS
                formatlarından otomatik işlem.
              </li>
              <li>
                <strong className="text-gray-300">Abonelik takibi:</strong> Tekrarlayan ödemeleri ve
                &quot;sızıntı&quot; harcamaları daha net gösterme.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Fiyatlandırma */}
      <section id="fiyatlandirma" className="relative py-24 scroll-mt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-[#070c18] via-[#0a1020] to-[#050810]" />
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-400 mb-3">Fiyatlandırma</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">İhtiyacınıza göre yükseltin</h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-2">
              Ücretsiz planla başlayın. Pro ve Ultra için uygulama içi plan yükseltmesi ve ödeme altyapısı
              hazır olduğunda tamamlanacaktır; şu an tüm katmanlar için net limitler backend tarafında tanımlıdır.
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
                  <p className="text-xs text-gray-500 mt-1">Yıllık: ₺{79 * 12} /yıl (-20%)</p>
                )}
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {[
                  'Sınırsız gider',
                  'Sınırsız CSV yükleme',
                  'Fiş ve belge ile içe aktarma',
                  'AI harcama koçu (sohbet)',
                  'AI harcama analizi ve bütçe önerisi',
                  'Öncelikli destek',
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
              <Link
                href="/signup"
                className="block text-center py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-all hover:shadow-lg hover:shadow-brand-500/30 active:scale-[0.98]"
              >
                Ücretsiz hesap oluştur
              </Link>
            </div>

            <div className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-7 ring-1 ring-violet-500/20">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-gray-400">Ultra (Aile)</p>
                <span className="text-[10px] font-bold uppercase tracking-wide bg-violet-500/20 text-violet-200 px-2 py-0.5 rounded">
                  Aile · yol haritası
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-4 -mt-2">
                Çoklu hesap ve paylaşımlı bütçe gibi aile özellikleri geliştirme aşamasındadır; şu an bu planda
                tüm Pro özellikleri ve aşağıdaki gelişmiş AI analizleri sunulur.
              </p>
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">₺{ultraAylik}</span>
                  <span className="text-gray-400 text-sm">/ay</span>
                </div>
                {yillik ? (
                  <p className="text-xs text-green-400 mt-1">Yıllık ödemede {ultraYillikTasarruf} ₺ tasarruf</p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">Yıllık: ₺{159 * 12} /yıl (-20%)</p>
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
              <Link
                href="/signup"
                className="block text-center py-3 rounded-xl border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/15 text-white text-sm font-medium transition-all"
              >
                Başla
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 overflow-hidden border-t border-white/[0.06]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050810] to-[#0a0f22]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(600px,90vw)] h-[280px] bg-brand-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Bugün kayıt olun,
            <br />
            <span className="text-brand-400">ilk harcamayı dakikalar içinde ekleyin</span>
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Ücretsiz planda ayda 50 gider ve 1 CSV ile başlayın. İhtiyaç duyduğunuzda Pro veya Ultra&apos;ya
            geçiş için uygulama içi yükseltme yakında tamamlanacak.
          </p>
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-lg font-bold transition-all hover:shadow-2xl hover:shadow-brand-500/40 hover:-translate-y-0.5 active:scale-[0.98]"
          >
            Ücretsiz hesap oluştur
            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <ShieldIcon />
              Şeffaf plan limitleri
            </span>
            <span className="inline-flex items-center gap-1.5">
              <LockIcon />
              Veri güvenliği odaklı mimari
            </span>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] py-10 bg-[#050810]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Image src="/images/logo/logo-dark.svg" alt="Giderlerim" width={110} height={26} />
              <span className="text-sm text-gray-500">www.giderlerim.net</span>
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-gray-500">
              <Link href="/gizlilik" className="hover:text-gray-300 transition-colors">
                Gizlilik politikası
              </Link>
              <Link href="/kullanim" className="hover:text-gray-300 transition-colors">
                Kullanım koşulları
              </Link>
              <a href="mailto:destek@giderlerim.net" className="hover:text-gray-300 transition-colors">
                İletişim
              </a>
              <a href="#fiyatlandirma" className="hover:text-gray-300 transition-colors">
                Fiyatlar
              </a>
            </nav>
            <p className="text-xs text-gray-600 text-center lg:text-right">
              © {new Date().getFullYear()} Giderlerim · www.giderlerim.net
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
