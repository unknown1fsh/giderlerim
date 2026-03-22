'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Wallet, Eye, EyeOff, AlertCircle, UserPlus } from 'lucide-react';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';
import { KullaniciResponse } from '@/types/kullanici.types';

export default function KayitPage() {
  const router = useRouter();
  const { girisYap } = useAuthStore();

  const [form, setForm] = useState({
    ad: '',
    soyad: '',
    email: '',
    sifre: '',
    sifreTekrar: '',
  });
  const [sifreGoster, setSifreGoster] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHata(null);

    if (!form.ad || !form.soyad || !form.email || !form.sifre) {
      setHata('Tüm alanlar zorunludur.');
      return;
    }

    if (form.sifre.length < 6) {
      setHata('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    if (form.sifre !== form.sifreTekrar) {
      setHata('Şifreler eşleşmiyor.');
      return;
    }

    setYukleniyor(true);
    try {
      const response = await authService.kayitOl({
        ad: form.ad,
        soyad: form.soyad,
        email: form.email,
        sifre: form.sifre,
      });

      if (response.success && response.data) {
        const { accessToken, refreshToken } = response.data;
        const profileRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/kullanici/profil`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        let kullanici: KullaniciResponse | null = null;
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          kullanici = profileData.data;
        }
        girisYap(accessToken, refreshToken, kullanici as KullaniciResponse);
        router.push('/dashboard');
      } else {
        setHata(response.message || 'Kayıt oluşturulamadı.');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; alanHatalari?: { mesaj: string }[] } } };
      const alanHatalari = error?.response?.data?.alanHatalari;
      if (alanHatalari && alanHatalari.length > 0) {
        setHata(alanHatalari[0].mesaj);
      } else {
        setHata(error?.response?.data?.message || 'Kayıt sırasında bir hata oluştu.');
      }
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-accent mb-4 shadow-lg shadow-accent/25">
            <Wallet className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">giderlerim.net</h1>
          <p className="mt-2 text-text-muted text-sm">AI Destekli Kişisel Finans Koçunuz</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-bg-primary p-8 shadow-sm shadow-black/[0.06]">
          <h2 className="text-xl font-bold text-text-primary mb-6">Ücretsiz Hesap Oluşturun</h2>

          {/* Error Alert */}
          {hata && (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3">
              <AlertCircle className="h-5 w-5 text-danger flex-shrink-0 mt-0.5" />
              <p className="text-sm text-danger">{hata}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Ad - Soyad */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-muted">Ad</label>
                <input
                  type="text"
                  value={form.ad}
                  onChange={(e) => setForm({ ...form, ad: e.target.value })}
                  placeholder="Adınız"
                  required
                  className="w-full rounded-lg border border-border bg-bg-secondary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-muted">Soyad</label>
                <input
                  type="text"
                  value={form.soyad}
                  onChange={(e) => setForm({ ...form, soyad: e.target.value })}
                  placeholder="Soyadınız"
                  required
                  className="w-full rounded-lg border border-border bg-bg-secondary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-muted">
                E-posta Adresi
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="ornek@email.com"
                required
                className="w-full rounded-lg border border-border bg-bg-secondary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-muted">Şifre</label>
              <div className="relative">
                <input
                  type={sifreGoster ? 'text' : 'password'}
                  value={form.sifre}
                  onChange={(e) => setForm({ ...form, sifre: e.target.value })}
                  placeholder="En az 6 karakter"
                  required
                  className="w-full rounded-lg border border-border bg-bg-secondary px-4 py-2.5 pr-10 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setSifreGoster(!sifreGoster)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  {sifreGoster ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Password Confirm */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-muted">
                Şifre Tekrar
              </label>
              <input
                type={sifreGoster ? 'text' : 'password'}
                value={form.sifreTekrar}
                onChange={(e) => setForm({ ...form, sifreTekrar: e.target.value })}
                placeholder="Şifrenizi tekrar girin"
                required
                className="w-full rounded-lg border border-border bg-bg-secondary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={yukleniyor}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-accent py-3 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-2"
            >
              {yukleniyor ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              {yukleniyor ? 'Kayıt Oluşturuluyor...' : 'Kayıt Ol'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-text-muted">
            Zaten hesabınız var mı?{' '}
            <Link href="/giris" className="font-semibold text-accent hover:text-accent-light transition-colors">
              Giriş Yapın
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-text-disabled">
          Kaydolarak{' '}
          <span className="text-accent">Kullanım Şartları</span>
          {' '}ve{' '}
          <span className="text-accent">Gizlilik Politikası</span>
          &apos;nı kabul etmiş olursunuz.
        </p>
      </div>
    </div>
  );
}
