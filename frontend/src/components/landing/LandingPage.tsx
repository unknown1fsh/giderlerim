import dynamic from 'next/dynamic';
import { LandingDecor } from '@/components/landing/LandingDecor';
import { LandingFeatures } from '@/components/landing/LandingFeatures';
import { LandingFinalCta } from '@/components/landing/LandingFinalCta';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { LandingHero } from '@/components/landing/LandingHero';
import { LandingHowItWorks } from '@/components/landing/LandingHowItWorks';
import { LandingNav } from '@/components/landing/LandingNav';

const LandingPricing = dynamic(
  () => import('@/components/landing/LandingPricing').then((m) => ({ default: m.LandingPricing })),
  {
    loading: () => (
      <section id="fiyatlandirma" className="relative min-h-[520px] scroll-mt-20 py-24" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-[#070c18] via-[#0a1020] to-[#050810]" />
      </section>
    ),
  }
);

export function LandingPage() {
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-[#050810] text-white overflow-x-hidden selection:bg-brand-500/40">
      <LandingDecor />
      <LandingNav />
      <LandingHero />
      <LandingHowItWorks />
      <LandingFeatures />
      <LandingPricing />
      <LandingFinalCta />
      <LandingFooter year={year} />
    </div>
  );
}
