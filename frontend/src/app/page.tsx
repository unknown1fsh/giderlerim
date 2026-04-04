import type { Metadata } from 'next';
import { LandingPageClient } from '@/components/landing/LandingPageClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://www.giderlerim.net';

const landingTitle = 'Akıllı harcama takibi';
const landingDescription =
  'Giderlerim — harcamalarınızı web ve mobilde yönetin. Bütçe, uyarılar, CSV ve belge içe aktarma, yapay zeka koçu ve analizler. www.giderlerim.net';

export const metadata: Metadata = {
  title: landingTitle,
  description: landingDescription,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Giderlerim — Akıllı harcama takibi',
    description: landingDescription,
    url: '/',
    siteName: 'Giderlerim',
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Giderlerim — Akıllı harcama takibi',
    description: landingDescription,
  },
  authors: [{ name: 'Giderlerim', url: siteUrl }],
};

export default function HomePage() {
  return <LandingPageClient />;
}
