import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Giderlerim - AI Destekli Kişisel Finans Koçu',
  description:
    'Harcamalarınızı takip edin, bütçenizi yönetin ve AI destekli finansal koçunuzla tasarruf edin.',
  keywords: 'gider takip, bütçe yönetimi, kişisel finans, yapay zeka, tasarruf',
  authors: [{ name: 'Giderlerim' }],
  openGraph: {
    title: 'Giderlerim - AI Destekli Kişisel Finans Koçu',
    description: 'Harcamalarınızı takip edin, bütçenizi yönetin ve AI destekli finansal koçunuzla tasarruf edin.',
    locale: 'tr_TR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{const t=localStorage.getItem('tema');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}` }} />
      </head>
      <body className={`${inter.className} bg-bg-primary text-text-primary antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
