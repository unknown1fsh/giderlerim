import { Suspense } from 'react';
import SifreSifirlaForm from '@/components/auth/SifreSifirlaForm';
import type { Metadata } from 'next';

// Bağlantıdaki token, Referer başlığıyla üçüncü taraflara sızmasın.
export const metadata: Metadata = {
  title: 'Şifre sıfırlama',
  referrer: 'no-referrer',
  robots: { index: false, follow: false },
};

export default function SifreSifirlaPage() {
  return (
    <Suspense>
      <SifreSifirlaForm />
    </Suspense>
  );
}
