'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

const CheckIcon = () => (
  <svg className="w-4 h-4 text-brand-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

const DashboardMockup = () => (
  <div className="relative w-full max-w-md mx-auto">
    {/* Outer glow */}
    <div className="absolute inset-0 rounded-2xl bg-brand-500/20 blur-2xl scale-95 animate-glow-pulse" />

    {/* Main card */}
    <div className="relative rounded-2xl border border-white/10 bg-[#0f1628]/90 backdrop-blur-md shadow-2xl overflow-hidden animate-float">
      {/* Card header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <span className="text-xs text-gray-400 font-medium">Dashboard — Mart 2025</span>
        <div className="w-16" />
      </div>

      <div className="p-5 space-y-4">
        {/* Stat cards */}
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

        {/* Mini bar chart */}
        <div className="rounded-xl bg-white/5 p-3">
          <p className="text-[10px] text-gray-400 mb-3">Haftalık Harcama</p>
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
              <p key={d} className="flex-1 text-center text-[8px] text-gray-500">{d}</p>
            ))}
          </div>
        </div>

        {/* Recent transactions */}
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

export default function LandingPage() {
  const [yillik, setYillik] = useState(false);

  const proAylik = yillik ? 79 : 99;
  const aileAylik = yillik ? 159 : 199;

  return (
    <div className="min-h-screen bg-[#070c1b] text-white overflow-x-hidden">

      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#070c1b]/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <Link href="/">
              <Image
                src="/images/logo/logo-dark.svg"
                alt="Giderlerim"
                width={140}
                height={32}
                priority
              />
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/signin"
                className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Giriş Yap
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-all hover:shadow-lg hover:shadow-brand-500/25 active:scale-95"
              >
                Ücretsiz Başla
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-brand-500/15 blur-3xl animate-blob" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-purple-600/10 blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl animate-blob animation-delay-4000" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center py-20 lg:py-0">

            {/* Left: Copy */}
            <div className="text-center lg:text-left">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1.5 mb-6 animate-fade-in">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-400">
                  🇹🇷 Türkiye&apos;nin Akıllı Harcama Takip Uygulaması
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6 animate-fade-in-up">
                Paranız Nereye{' '}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, #465fff 0%, #a78bfa 50%, #60a5fa 100%)',
                  }}
                >
                  Gidiyor,
                </span>
                <br />
                Artık Biliyorsunuz.
              </h1>

              {/* Subtitle */}
              <p className="text-lg text-gray-400 leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0 animate-fade-in-up animation-delay-200">
                Tüm harcamalarınızı tek ekranda görün. Bütçenizi kontrol altına alın.
                Yapay zeka destekli analizlerle finansal özgürlüğe ulaşın.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-10 animate-fade-in-up animation-delay-400">
                <Link
                  href="/signup"
                  className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-base transition-all hover:shadow-xl hover:shadow-brand-500/30 hover:-translate-y-0.5 active:scale-95"
                >
                  Ücretsiz Başla
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                <a
                  href="#ozellikler"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium text-base transition-all hover:-translate-y-0.5"
                >
                  Nasıl Çalışır?
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                  </svg>
                </a>
              </div>

              {/* Trust stats */}
              <div className="flex flex-wrap items-center gap-6 justify-center lg:justify-start animate-fade-in-up animation-delay-600">
                <div className="h-px w-px" /> {/* spacer */}
                {[
                  { value: '12K+', label: 'Aktif Kullanıcı' },
                  { value: '₺2.4M', label: 'Tasarruf Edildi' },
                  { value: '4.9★', label: 'Kullanıcı Puanı' },
                ].map((stat, i) => (
                  <div key={i} className={`text-center ${i > 0 ? 'pl-6 border-l border-white/10' : ''}`}>
                    <p className="text-xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Dashboard Mockup */}
            <div className="relative hidden lg:block animate-fade-in animation-delay-400">
              <DashboardMockup />
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#070c1b] to-transparent" />
      </section>

      {/* ─── ÖZELLİKLER ─── */}
      <section id="ozellikler" className="relative py-24 bg-[#070c1b]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-400 mb-3">Neden Giderlerim?</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Finansal hayatınızı{' '}
              <span className="text-brand-400">basitleştiriyoruz</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                emoji: '🤖',
                title: 'Yapay Zeka Analizi',
                desc: 'Kişisel yapay zeka koçunuz harcama alışkanlıklarınızı analiz eder, tasarruf fırsatlarını gösterir ve aylık hedeflerinize ulaşmanızı sağlar.',
                gradient: 'from-brand-500/20 to-purple-500/10',
                border: 'border-brand-500/20 hover:border-brand-500/50',
              },
              {
                emoji: '📊',
                title: 'Akıllı Bütçeler',
                desc: 'Kategori bazlı bütçe hedefleri belirleyin. Gerçek zamanlı ilerleme takibi ile ay sonunda sürprizlerle karşılaşmayın.',
                gradient: 'from-green-500/15 to-teal-500/10',
                border: 'border-green-500/20 hover:border-green-500/50',
              },
              {
                emoji: '🔔',
                title: 'Anlık Uyarılar',
                desc: 'Bütçe limitinize yaklaştığınızda veya beklenmedik bir harcama tespit edildiğinde anında bildirim alın.',
                gradient: 'from-orange-500/15 to-red-500/10',
                border: 'border-orange-500/20 hover:border-orange-500/50',
              },
              {
                emoji: '📱',
                title: 'SMS İçe Aktarma',
                desc: 'Garanti, İş Bankası, Akbank, Yapı Kredi banka SMS\'lerini otomatik olarak parse edip harcamalarınıza ekleyin.',
                gradient: 'from-blue-500/15 to-cyan-500/10',
                border: 'border-blue-500/20 hover:border-blue-500/50',
              },
              {
                emoji: '🎯',
                title: 'Tasarruf Hedefleri',
                desc: 'Tatil, araba, ev — hayalinizdeki hedef için ne kadar biriktirmeniz gerektiğini planlayın ve takip edin.',
                gradient: 'from-pink-500/15 to-rose-500/10',
                border: 'border-pink-500/20 hover:border-pink-500/50',
              },
              {
                emoji: '📋',
                title: 'Abonelik Takibi',
                desc: 'Netflix, Spotify, YouTube Premium — kullanmadığınız abonelikleri otomatik tespit edin ve para sızdıran kalemleri keşfedin.',
                gradient: 'from-violet-500/15 to-indigo-500/10',
                border: 'border-violet-500/20 hover:border-violet-500/50',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className={`group relative rounded-2xl border bg-gradient-to-br ${feature.gradient} ${feature.border} p-6 transition-all duration-300 hover:-translate-y-1.5 cursor-default`}
              >
                <div className="mb-4 text-3xl">{feature.emoji}</div>
                <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FİYATLANDIRMA ─── */}
      <section id="fiyatlandirma" className="relative py-24">
        {/* Subtle background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#070c1b] via-[#0a0f22] to-[#070c1b]" />
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-400 mb-3">Fiyatlandırma</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Size uygun planı seçin
            </h2>
            <p className="text-gray-400 mb-8">İlk 14 gün tamamen ücretsiz. Kredi kartı gerekmez.</p>

            {/* Toggle */}
            <div className="inline-flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 p-1">
              <button
                onClick={() => setYillik(false)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  !yillik ? 'bg-brand-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                }`}
              >
                Aylık
              </button>
              <button
                onClick={() => setYillik(true)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  yillik ? 'bg-brand-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                }`}
              >
                Yıllık
                <span className="text-[10px] font-bold bg-green-500 text-white rounded-full px-1.5 py-0.5">-20%</span>
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-5 items-stretch">
            {/* Ücretsiz */}
            <div className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-7">
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-400 mb-2">Ücretsiz</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">₺0</span>
                  <span className="text-gray-400 text-sm">/ay</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Sonsuza kadar ücretsiz</p>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {['3 aylık geçmiş', '3 bütçe kategorisi', 'Temel analizler', 'Mobil uygulama'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
                    <CheckIcon /> {f}
                  </li>
                ))}
                {['AI Koç', 'SMS içe aktarma', 'Abonelik takibi'].map((f) => (
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

            {/* Pro — highlighted */}
            <div className="relative flex flex-col rounded-2xl border border-brand-500/50 bg-gradient-to-b from-brand-500/15 to-brand-600/5 p-7 animate-glow-pulse">
              {/* Popular badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-500 px-3 py-1 text-[11px] font-bold text-white uppercase tracking-wide shadow-lg shadow-brand-500/40">
                  ✨ En Popüler
                </span>
              </div>

              <div className="mb-6">
                <p className="text-sm font-medium text-brand-300 mb-2">Pro</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">₺{proAylik}</span>
                  <span className="text-gray-400 text-sm">/ay</span>
                </div>
                {yillik && <p className="text-xs text-green-400 mt-1">Yıllık ödemede ₺{(99 - proAylik) * 12}₺ tasarruf</p>}
                {!yillik && <p className="text-xs text-gray-500 mt-1">ya da yıllık ₺{79 * 12}₺</p>}
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {[
                  'Sınırsız geçmiş',
                  'Sınırsız bütçe',
                  'AI Harcama Koçu',
                  'SMS içe aktarma',
                  'Abonelik takibi',
                  'Tasarruf hedefleri',
                  'Öncelikli destek',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-200">
                    <CheckIcon /> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block text-center py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-all hover:shadow-lg hover:shadow-brand-500/30 active:scale-95"
              >
                14 Gün Ücretsiz Dene
              </Link>
            </div>

            {/* Aile */}
            <div className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-7">
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-400 mb-2">Aile</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">₺{aileAylik}</span>
                  <span className="text-gray-400 text-sm">/ay</span>
                </div>
                {yillik && <p className="text-xs text-green-400 mt-1">Yıllık ödemede tasarruf</p>}
                {!yillik && <p className="text-xs text-gray-500 mt-1">ya da yıllık ₺{159 * 12}₺</p>}
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {[
                  '5 üye hesabı',
                  'Paylaşımlı bütçe',
                  'Tüm Pro özellikler',
                  'Aile harcama raporu',
                  'Çocuk bütçesi',
                  '7/24 öncelikli destek',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
                    <CheckIcon /> {f}
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
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#070c1b] to-[#0a0f22]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Finansal Geleceğinizi
            <br />
            <span className="text-brand-400">Bugün Şekillendirin</span>
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            14 gün ücretsiz deneyin. İstediğiniz zaman iptal edin. Kredi kartı gerekmez.
          </p>
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-lg font-bold transition-all hover:shadow-2xl hover:shadow-brand-500/40 hover:-translate-y-1 active:scale-95"
          >
            Ücretsiz Hesap Oluştur
            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <ShieldIcon />
              <span>SSL ile şifreli</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <LockIcon />
              <span>Veriler Türkiye&apos;de saklanır</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span>Kredi kartı gerekmez</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/5 py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Image
              src="/images/logo/logo-dark.svg"
              alt="Giderlerim"
              width={110}
              height={26}
            />
            <div className="flex items-center gap-6 text-xs text-gray-600">
              <a href="#" className="hover:text-gray-400 transition-colors">Gizlilik Politikası</a>
              <a href="#" className="hover:text-gray-400 transition-colors">Kullanım Koşulları</a>
              <a href="#" className="hover:text-gray-400 transition-colors">İletişim</a>
            </div>
            <p className="text-xs text-gray-600">
              &copy; {new Date().getFullYear()} Giderlerim. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
