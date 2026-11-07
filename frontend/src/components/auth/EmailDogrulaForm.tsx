'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/button/Button';
import { authService } from '@/services/authService';
import { apiHataMesaji } from '@/lib/apiHataMesaji';
import { useAuthStore } from '@/stores/authStore';
import HesapIslemKarti, { BasariMesaji, HataMesaji } from './HesapIslemKarti';
import { useUrlToken } from './SifreSifirlaForm';

/**
 * Doğrulama düğmeye basınca yapılır; e-posta güvenlik tarayıcılarının bağlantıyı açması tokenı tüketmez.
 */
export default function EmailDogrulaForm() {
  const token = useUrlToken();
  const { kullanici, kullaniciGuncelle } = useAuthStore();
  const [dogrulandi, setDogrulandi] = useState(false);
  const [hata, setHata] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  const dogrula = async () => {
    setHata('');
    setYukleniyor(true);
    try {
      await authService.emailDogrula(token as string);
      setDogrulandi(true);
      if (kullanici) {
        kullaniciGuncelle({ ...kullanici, emailDogrulandi: true, emailDogrulamaGerekli: false });
      }
    } catch (err) {
      setHata(apiHataMesaji(err, 'E-posta doğrulanamadı. Bağlantının süresi dolmuş olabilir.'));
    } finally {
      setYukleniyor(false);
    }
  };

  if (!token) {
    return (
      <HesapIslemKarti baslik="E-posta doğrulama">
        <HataMesaji>Bağlantı geçersiz veya eksik. Uygulamadan yeni bir doğrulama e-postası isteyebilirsiniz.</HataMesaji>
      </HesapIslemKarti>
    );
  }

  return (
    <HesapIslemKarti baslik="E-posta adresinizi doğrulayın">
      {dogrulandi ? (
        <BasariMesaji>
          E-posta adresiniz doğrulandı.{' '}
          <Link href={kullanici ? '/dashboard' : '/signin'} className="font-semibold underline">
            {kullanici ? 'Uygulamaya dön' : 'Giriş yapın'}
          </Link>
          .
        </BasariMesaji>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Hesabınızı doğrulamak için aşağıdaki düğmeye basın.
          </p>
          {hata && <HataMesaji>{hata}</HataMesaji>}
          <Button className="w-full" size="sm" disabled={yukleniyor} onClick={dogrula}>
            {yukleniyor ? 'Doğrulanıyor…' : 'E-postamı doğrula'}
          </Button>
        </div>
      )}
    </HesapIslemKarti>
  );
}
