'use client';

import React, { useState } from 'react';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import { authService } from '@/services/authService';
import { apiHataMesaji } from '@/lib/apiHataMesaji';
import HesapIslemKarti, { BasariMesaji, HataMesaji } from './HesapIslemKarti';

export default function SifremiUnuttumForm() {
  const [email, setEmail] = useState('');
  const [gonderildi, setGonderildi] = useState(false);
  const [hata, setHata] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  const gonder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setHata('E-posta adresinizi girin.');
      return;
    }
    setHata('');
    setYukleniyor(true);
    try {
      await authService.sifreSifirlamaTalepEt(email.trim());
      setGonderildi(true);
    } catch (err) {
      setHata(apiHataMesaji(err, 'İstek gönderilemedi. Lütfen daha sonra tekrar deneyin.'));
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <HesapIslemKarti
      baslik="Şifremi unuttum"
      aciklama="Hesabınızın e-posta adresini girin; şifrenizi sıfırlamanız için bir bağlantı gönderelim."
    >
      {gonderildi ? (
        <BasariMesaji>
          Bu adresle kayıtlı bir hesap varsa şifre sıfırlama bağlantısı gönderildi. Bağlantı 30 dakika geçerlidir.
          Gelen kutunuzu ve spam klasörünü kontrol edin.
        </BasariMesaji>
      ) : (
        <form onSubmit={gonder} className="space-y-6">
          <div>
            <Label>E-posta <span className="text-error-500">*</span></Label>
            <Input type="email" placeholder="ornek@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {hata && <HataMesaji>{hata}</HataMesaji>}
          <Button className="w-full" size="sm" disabled={yukleniyor}>
            {yukleniyor ? 'Gönderiliyor…' : 'Sıfırlama bağlantısı gönder'}
          </Button>
        </form>
      )}
    </HesapIslemKarti>
  );
}
