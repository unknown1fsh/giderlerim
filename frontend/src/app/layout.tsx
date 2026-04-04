import { Outfit } from 'next/font/google';
import './globals.css';
import 'flatpickr/dist/flatpickr.css';
import { Metadata } from 'next';
import RootProviders from './providers';
import { DEFAULT_PUBLIC_SITE_URL, resolvePublicSiteUrl } from '@/lib/siteUrl';

const siteUrlString = resolvePublicSiteUrl();

let metadataBase: URL;
try {
  metadataBase = new URL(siteUrlString);
} catch {
  metadataBase = new URL(DEFAULT_PUBLIC_SITE_URL);
}

const defaultTitle = 'Giderlerim';
const defaultDescription =
  'Harcamalarınızı web ve mobilde takip edin. Bütçe, uyarılar, CSV ve belge ile içe aktarma, yapay zeka harcama koçu ve analizler — giderlerim.net';

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: defaultTitle,
    template: '%s | Giderlerim',
  },
  description: defaultDescription,
  applicationName: 'Giderlerim',
  keywords: [
    'gider takibi',
    'bütçe',
    'harcama analizi',
    'kişisel finans',
    'Türkiye',
    'giderlerim.net',
  ],
  authors: [{ name: 'Giderlerim', url: siteUrlString }],
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: '/',
    siteName: 'Giderlerim',
    title: defaultTitle,
    description: defaultDescription,
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultTitle,
    description: defaultDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/',
  },
};

const outfit = Outfit({
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  );
}
