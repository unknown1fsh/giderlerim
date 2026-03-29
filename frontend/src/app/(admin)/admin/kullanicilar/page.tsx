'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/adminService';
import { AdminKullaniciDto, AdminKullaniciGuncelleRequest } from '@/types/admin.types';
import { PlanTuru } from '@/types/kullanici.types';

const PLAN_ETIKETLER: Record<string, { label: string; cls: string }> = {
  FREE: { label: 'Ücretsiz', cls: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300' },
  PREMIUM: { label: 'Pro', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  ULTRA: { label: 'Ultra', cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
};

const tarihFormatla = (tarih: string | null) =>
  tarih ? new Date(tarih).toLocaleDateString('tr-TR') : '—';

export default function KullanicilarPage() {
  const queryClient = useQueryClient();

  const [arama, setArama] = useState('');
  const [planFiltre, setPlanFiltre] = useState('');
  const [aktifFiltre, setAktifFiltre] = useState<'' | 'true' | 'false'>('');
  const [sayfa, setSayfa] = useState(0);

  const [modal, setModal] = useState<AdminKullaniciDto | null>(null);
  const [silOnay, setSilOnay] = useState<AdminKullaniciDto | null>(null);
  const [form, setForm] = useState<AdminKullaniciGuncelleRequest>({});
  const [hata, setHata] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'kullanicilar', { arama, planFiltre, aktifFiltre, sayfa }],
    queryFn: () =>
      adminService.kullanicilariGetir({
        arama: arama || undefined,
        plan: planFiltre || undefined,
        aktif: aktifFiltre === '' ? undefined : aktifFiltre === 'true',
        sayfa,
        boyut: 20,
      }),
  });

  const guncelle = useMutation({
    mutationFn: ({ id, req }: { id: number; req: AdminKullaniciGuncelleRequest }) =>
      adminService.kullaniciGuncelle(id, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'kullanicilar'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'istatistikler'] });
      setModal(null);
    },
    onError: () => setHata('Güncelleme başarısız.'),
  });

  const sil = useMutation({
    mutationFn: (id: number) => adminService.kullaniciSil(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'kullanicilar'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'istatistikler'] });
      setSilOnay(null);
    },
  });

  const modalAc = (k: AdminKullaniciDto) => {
    setForm({ plan: k.plan, adminMi: k.adminMi, aktif: k.aktif });
    setHata('');
    setModal(k);
  };

  const kullanicilar = data?.content ?? [];
  const toplamSayfa = data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Kullanıcı Yönetimi</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {data?.totalElements ?? 0} kullanıcı
          </p>
        </div>
      </div>

      {/* Filtreler */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Ad, soyad, e-posta..."
          value={arama}
          onChange={e => { setArama(e.target.value); setSayfa(0); }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 w-56"
        />
        <select
          value={planFiltre}
          onChange={e => { setPlanFiltre(e.target.value); setSayfa(0); }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
        >
          <option value="">Tüm Planlar</option>
          <option value="FREE">Ücretsiz</option>
          <option value="PREMIUM">Pro</option>
          <option value="ULTRA">Ultra</option>
        </select>
        <select
          value={aktifFiltre}
          onChange={e => { setAktifFiltre(e.target.value as '' | 'true' | 'false'); setSayfa(0); }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
        >
          <option value="">Tüm Durumlar</option>
          <option value="true">Aktif</option>
          <option value="false">Pasif</option>
        </select>
      </div>

      {/* Tablo */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500" />
          </div>
        ) : isError ? (
          <div className="py-12 text-center text-red-500">Kullanıcılar yüklenemedi.</div>
        ) : kullanicilar.length === 0 ? (
          <div className="py-12 text-center text-gray-400">Kullanıcı bulunamadı.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Kullanıcı</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">E-posta</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Plan</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Durum</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Gider</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Kayıt</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {kullanicilar.map(k => {
                const plan = PLAN_ETIKETLER[k.plan] ?? PLAN_ETIKETLER.FREE;
                return (
                  <tr key={k.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900 dark:text-brand-300 font-semibold text-xs">
                          {k.ad[0]}{k.soyad[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">
                            {k.ad} {k.soyad}
                            {k.adminMi && (
                              <span className="ml-1.5 rounded-full bg-purple-100 px-1.5 py-0.5 text-[10px] font-semibold text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                                ADMIN
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{k.email}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${plan.cls}`}>
                        {plan.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          k.aktif
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                        }`}
                      >
                        {k.aktif ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{k.giderSayisi}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{tarihFormatla(k.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => modalAc(k)}
                          className="rounded-lg px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950 transition-colors"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => setSilOnay(k)}
                          className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Sayfalama */}
      {toplamSayfa > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setSayfa(s => Math.max(0, s - 1))}
            disabled={sayfa === 0}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Önceki
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {sayfa + 1} / {toplamSayfa}
          </span>
          <button
            onClick={() => setSayfa(s => Math.min(toplamSayfa - 1, s + 1))}
            disabled={sayfa >= toplamSayfa - 1}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Sonraki
          </button>
        </div>
      )}

      {/* Düzenle Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Kullanıcı Düzenle
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {modal.ad} {modal.soyad} — {modal.email}
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Plan
                </label>
                <select
                  value={form.plan ?? modal.plan}
                  onChange={e => setForm(f => ({ ...f, plan: e.target.value as PlanTuru }))}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                >
                  <option value="FREE">Ücretsiz</option>
                  <option value="PREMIUM">Pro</option>
                  <option value="ULTRA">Ultra</option>
                </select>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={form.adminMi ?? modal.adminMi}
                    onChange={e => setForm(f => ({ ...f, adminMi: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300 text-brand-500"
                  />
                  Admin
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={form.aktif ?? modal.aktif}
                    onChange={e => setForm(f => ({ ...f, aktif: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300 text-brand-500"
                  />
                  Aktif
                </label>
              </div>

              {hata && <p className="text-sm text-red-500">{hata}</p>}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setModal(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
              >
                İptal
              </button>
              <button
                onClick={() => guncelle.mutate({ id: modal.id, req: form })}
                disabled={guncelle.isPending}
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60 transition-colors"
              >
                {guncelle.isPending ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sil Onay Modal */}
      {silOnay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Kullanıcıyı Sil</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <strong>{silOnay.ad} {silOnay.soyad}</strong> adlı kullanıcı ve tüm verileri silinecek. Bu işlem geri alınamaz.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSilOnay(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
              >
                İptal
              </button>
              <button
                onClick={() => sil.mutate(silOnay.id)}
                disabled={sil.isPending}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-60 transition-colors"
              >
                {sil.isPending ? 'Siliniyor...' : 'Evet, Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
