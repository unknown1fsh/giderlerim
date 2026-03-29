import { Outfit } from 'next/font/google';
import './globals.css';
import 'flatpickr/dist/flatpickr.css';
import { Metadata } from 'next';
import RootProviders from './providers';

export const metadata: Metadata = {
  title: 'Giderlerim',
  description: 'Harcamalarınızı akıllıca takip edin.',
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
