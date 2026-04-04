import Link from 'next/link';
import { LockIcon, ShieldIcon } from '@/components/landing/icons';

export function LandingFinalCta() {
  return (
    <section className="relative py-24 overflow-hidden border-t border-white/[0.06] [content-visibility:auto]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#050810] to-[#0a0f22]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(600px,90vw)] h-[280px] bg-brand-500/10 rounded-full blur-3xl motion-reduce:blur-2xl" />
      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
          Bugün kayıt olun,
          <br />
          <span className="text-brand-400">ilk harcamayı dakikalar içinde ekleyin</span>
        </h2>
        <p className="text-gray-400 text-lg mb-8">
          Ücretsiz planda ayda 50 gider ve 1 CSV ile başlayın. İhtiyaç duyduğunuzda Pro veya Ultra&apos;ya geçiş için
          uygulama içi yükseltme yakında tamamlanacak.
        </p>
        <Link
          href="/signup"
          className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-lg font-bold transition-all hover:shadow-2xl hover:shadow-brand-500/40 hover:-translate-y-0.5 active:scale-[0.98] motion-reduce:hover:translate-y-0"
        >
          Ücretsiz hesap oluştur
          <svg className="w-5 h-5 transition-transform group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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
  );
}
