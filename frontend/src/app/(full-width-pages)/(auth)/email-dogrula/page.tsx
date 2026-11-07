import { Suspense } from 'react';
import EmailDogrulaForm from '@/components/auth/EmailDogrulaForm';
import type { Metadata } from 'next';

// Bağlantıdaki token, Referer başlığıyla üçüncü taraflara sızmasın.
export const metadata: Metadata = {
  title: 'E-posta doğrulama',
  referrer: 'no-referrer',
  robots: { index: false, follow: false },
};

export default function EmailDogrulaPage() {
  return (
    <Suspense>
      <EmailDogrulaForm />
    </Suspense>
  );
}
