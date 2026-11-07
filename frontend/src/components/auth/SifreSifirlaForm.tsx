'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import { authService } from '@/services/authService';
import { apiHataMesaji } from '@/lib/apiHataMesaji';
import HesapIslemKarti, { BasariMesaji, HataMesaji } from './HesapIslemKarti';

const MIN_SIFRE = 8;

/** Bağlantıdaki tokenı okur ve adres çubuğundan siler (geçmiş ve ekran paylaşımlarında görünmesin). */
export function useUrlToken(): string | null {
  const params = useSearchParams();
  const [token] = useState(() => params.get('token'));
  useEffect(() => {
    if (token && typeof window !== 'undefined') {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [token]);
  return token;
}

export default function SifreSifirlaForm() {
  const token = useUrlToken();
  const [sifre, setSifre] = useState('');
  const [sifreTekrar, setSifreTekrar] = useState('');
  const [tamamlandi, setTamamlandi] = useState(false);
  const [hata, setHata] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  const gonder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sifre.length < MIN_SIFRE) {
      setHata(`Şifre en az ${MIN_SIFRE} karakter olmalıdır.`);
      return;
    }
    if (sifre !== sifreTekrar) {
      setHata('Şifreler eşleşmiyor.');
      return;
    }
    setHata('');
    setYukleniyor(true);
    try {
      await authService.sifreSifirla(token as string, sifre);
      setTamamlandi(true);
    } catch (err) {
      setHata(apiHataMesaji(err, 'Şifre güncellenemedi. Bağlantının süresi dolmuş olabilir.'));
    } finally {
      setYukleniyor(false);
    }
  };

  if (!token) {
    return (
      <HesapIslemKarti baslik="Şifre sıfırlama">
        <HataMesaji>Bağlantı geçersiz veya eksik.</HataMesaji>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          <Link href="/sifremi-unuttum" className="text-brand-500 hover:underline">Yeni bağlantı isteyin</Link>.
        </p>
      </HesapIslemKarti>
    );
  }

  return (
    <HesapIslemKarti baslik="Yeni şifre belirleyin" aciklama={`En az ${MIN_SIFRE} karakterli yeni bir şifre girin.`}>
      {tamamlandi ? (
        <BasariMesaji>
          Şifreniz güncellendi.{' '}
          <Link href="/signin" className="font-semibold underline">Yeni şifrenizle giriş yapın</Link>.
        </BasariMesaji>
      ) : (
        <form onSubmit={gonder} className="space-y-6">
          <div>
            <Label>Yeni şifre <span className="text-error-500">*</span></Label>
            <Input type="password" value={sifre} onChange={(e) => setSifre(e.target.value)} placeholder="Yeni şifreniz" />
          </div>
          <div>
            <Label>Yeni şifre (tekrar) <span className="text-error-500">*</span></Label>
            <Input type="password" value={sifreTekrar} onChange={(e) => setSifreTekrar(e.target.value)} placeholder="Yeni şifrenizi tekrar girin" />
          </div>
          {hata && (
            <div className="space-y-2">
              <HataMesaji>{hata}</HataMesaji>
              <Link href="/sifremi-unuttum" className="text-sm text-brand-500 hover:underline">Yeni bağlantı iste</Link>
            </div>
          )}
          <Button className="w-full" size="sm" disabled={yukleniyor}>
            {yukleniyor ? 'Kaydediliyor…' : 'Şifremi güncelle'}
          </Button>
        </form>
      )}
    </HesapIslemKarti>
  );
}
