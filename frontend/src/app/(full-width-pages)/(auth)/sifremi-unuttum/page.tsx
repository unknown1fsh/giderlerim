import SifremiUnuttumForm from '@/components/auth/SifremiUnuttumForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Şifremi unuttum',
  description: 'Giderlerim şifre sıfırlama — giderlerim.net',
};

export default function SifremiUnuttumPage() {
  return <SifremiUnuttumForm />;
}
