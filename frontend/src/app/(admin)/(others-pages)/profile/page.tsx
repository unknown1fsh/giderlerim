'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/services/apiClient';
import { useAuthStore } from '@/stores/authStore';
import { PlanTuru, ParaBirimi, ProfilGuncelleRequest } from '@/types/kullanici.types';
import { ApiResponse } from '@/types/api.types';
import { KullaniciResponse } from '@/types/kullanici.types';

const PLAN_RENK: Record<PlanTuru, string> = {
  FREE: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  PREMIUM: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
  ULTRA: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
};
const PLAN_AD: Record<PlanTuru, string> = { FREE: 'Ücretsiz', PREMIUM: 'Pro', ULTRA: 'Ultra' };

export default function ProfilPage() {
  const { kullanici, kullaniciGuncelle, cikisYap } = useAuthStore();
  const router = useRouter();
  const [form, setForm] = useState<ProfilGuncelleRequest>({
    ad: kullanici?.ad ?? '',
    soyad: kullanici?.soyad ?? '',
    paraBirimi: kullanici?.paraBirimi ?? 'TRY',
  });
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [basariMesaji, setBasariMesaji] = useState('');
  const [hataMesaji, setHataMesaji] = useState('');
  const [silOnay, setSilOnay] = useState(false);
  const [silIsleniyor, setSilIsleniyor] = useState(false);

  const kaydet = async () => {
    if (!form.ad?.trim() || !form.soyad?.trim()) {
      setHataMesaji('Ad ve soyad zorunludur.');
      return;
    }
    setKaydediliyor(true);
    setHataMesaji('');
    setBasariMesaji('');
    try {
      const r = await apiClient.put<ApiResponse<KullaniciResponse>>('/kullanici/profil', form);
      kullaniciGuncelle(r.data.data);
      setBasariMesaji('Profil güncellendi.');
    } catch {
      setHataMesaji('Güncelleme başarısız.');
    } finally {
      setKaydediliyor(false);
    }
  };

  const hesapSil = async () => {
    setSilIsleniyor(true);
    try {
      await apiClient.delete('/kullanici/hesap');
      cikisYap();
      router.push('/');
    } catch {
      setHataMesaji('Hesap silinemedi.');
      setSilIsleniyor(false);
      setSilOnay(false);
    }
  };

  if (!kullanici) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Profil</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Hesap bilgilerinizi yönetin</p>
      </div>

      {/* Plan kartı */}
      <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Mevcut Plan</p>
          <span className={`mt-1 inline-block rounded-full px-3 py-1 text-sm font-semibold ${PLAN_RENK[kullanici.plan]}`}>
            {PLAN_AD[kullanici.plan]}
          </span>
        </div>
        {kullanici.plan !== 'ULTRA' && (
          <a
            href="/#fiyatlandirma"
            className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
          >
            Yükselt ↑
          </a>
        )}
      </div>

      {/* Profil formu */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-5 text-base font-semibold text-gray-800 dark:text-white">Kişisel Bilgiler</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Ad</label>
              <input
                type="text"
                value={form.ad ?? ''}
                onChange={(e) => setForm(f => ({ ...f, ad: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Soyad</label>
              <input
                type="text"
                value={form.soyad ?? ''}
                onChange={(e) => setForm(f => ({ ...f, soyad: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">E-posta</label>
            <input
              type="email"
              value={kullanici.email}
              disabled
              className="w-full rounded-xl border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-400 dark:border-gray-600 dark:bg-gray-700/50"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Para Birimi</label>
            <select
              value={form.paraBirimi ?? 'TRY'}
              onChange={(e) => setForm(f => ({ ...f, paraBirimi: e.target.value as ParaBirimi }))}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="TRY">₺ Türk Lirası (TRY)</option>
              <option value="USD">$ Amerikan Doları (USD)</option>
              <option value="EUR">€ Euro (EUR)</option>
            </select>
          </div>

          {hataMesaji && <p className="text-sm text-red-500">{hataMesaji}</p>}
          {basariMesaji && <p className="text-sm text-green-500">{basariMesaji}</p>}

          <div className="flex justify-end">
            <button
              onClick={kaydet}
              disabled={kaydediliyor}
              className="rounded-xl bg-brand-500 px-6 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60 transition-colors"
            >
              {kaydediliyor ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      </div>

      {/* Tehlikeli alan */}
      <div className="rounded-2xl border border-red-200 bg-white p-6 dark:border-red-800 dark:bg-gray-800">
        <h2 className="mb-2 text-base font-semibold text-red-600 dark:text-red-400">Tehlikeli Alan</h2>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Hesabınızı sildiğinizde tüm verileriniz kalıcı olarak silinir ve bu işlem geri alınamaz.
        </p>
        <button
          onClick={() => setSilOnay(true)}
          className="rounded-xl border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
        >
          Hesabı Sil
        </button>
      </div>

      {/* Silme onayı modal */}
      {silOnay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800">
            <h2 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">Hesabı Sil</h2>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              Tüm verileriniz kalıcı olarak silinecek. Bu işlem geri alınamaz. Emin misiniz?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setSilOnay(false)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">
                İptal
              </button>
              <button onClick={hesapSil}
                disabled={silIsleniyor}
                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60">
                {silIsleniyor ? 'Siliniyor...' : 'Evet, Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
