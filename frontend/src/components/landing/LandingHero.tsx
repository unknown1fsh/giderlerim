import Link from 'next/link';
import { DashboardMockup } from '@/components/landing/DashboardMockup';
import { LockIcon, ShieldIcon } from '@/components/landing/icons';

export function LandingHero() {
  return (
    <section className="relative min-h-[min(100dvh,920px)] flex flex-col justify-center pt-20 pb-16 overflow-hidden">
      <div className="absolute top-1/4 -left-20 w-[28rem] h-[28rem] rounded-full bg-brand-500/12 blur-3xl animate-blob motion-reduce:animate-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-violet-600/10 blur-3xl animate-blob animation-delay-2000 motion-reduce:animate-none" />
      <div
        className="absolute inset-0 opacity-[0.03] motion-reduce:opacity-0"
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
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-60 motion-reduce:animate-none" />
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
              Giderlerim; manuel kayıt, banka CSV&apos;si veya fiş fotoğrafı ile içe aktarma, kategori bütçeleri,
              akıllı uyarılar ve yapay zeka harcama koçu sunar. Türkiye&apos;deki günlük harcama alışkanlıklarına göre
              tasarlandı.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-10">
              <Link
                href="/signup"
                className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-base transition-all hover:shadow-xl hover:shadow-brand-500/30 hover:-translate-y-0.5 active:scale-[0.98] motion-reduce:hover:translate-y-0"
              >
                Hemen ücretsiz hesap aç
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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

          <div className="relative z-10 w-full max-w-md lg:max-w-none mx-auto animate-fade-in animation-delay-400 motion-reduce:animate-none">
            <DashboardMockup />
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050810] to-transparent pointer-events-none" />
    </section>
  );
}
