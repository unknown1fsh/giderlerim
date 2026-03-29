'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/adminService';
import { SistemParametresiDto, SistemParametresiOlusturRequest } from '@/types/admin.types';

const KATEGORI_ETIKETLER: Record<string, string> = {
  GENEL: 'Genel',
  GUVENLIK: 'Güvenlik',
  AI: 'AI',
  SISTEM: 'Sistem',
  PLAN: 'Plan',
};

const TIP_ETIKETLER: Record<string, string> = {
  STRING: 'Metin',
  NUMBER: 'Sayı',
  BOOLEAN: 'Boolean',
};

const KATEGORI_RENK: Record<string, string> = {
  GENEL: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  GUVENLIK: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300',
  AI: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300',
  SISTEM: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
  PLAN: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
};

export default function SistemParametreleriPage() {
  const queryClient = useQueryClient();

  const [kategoriFiltre, setKategoriFiltre] = useState('');
  const [duzenleModal, setDuzenleModal] = useState<SistemParametresiDto | null>(null);
  const [yeniModal, setYeniModal] = useState(false);
  const [silOnay, setSilOnay] = useState<SistemParametresiDto | null>(null);
  const [degerInput, setDegerInput] = useState('');
  const [yeniForm, setYeniForm] = useState<Partial<SistemParametresiOlusturRequest>>({ tip: 'STRING', kategori: 'GENEL' });
  const [hata, setHata] = useState('');

  const { data: parametreler, isLoading, isError } = useQuery({
    queryKey: ['admin', 'sistem-parametreleri'],
    queryFn: () => adminService.parametreleriGetir(),
  });

  const guncelle = useMutation({
    mutationFn: ({ id, deger }: { id: number; deger: string }) =>
      adminService.parametreGuncelle(id, { deger }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sistem-parametreleri'] });
      setDuzenleModal(null);
    },
    onError: () => setHata('Güncelleme başarısız.'),
  });

  const varsayilanaGetir = useMutation({
    mutationFn: (id: number) => adminService.parametreVarsayilanaGetir(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'sistem-parametreleri'] }),
  });

  const olustur = useMutation({
    mutationFn: (req: SistemParametresiOlusturRequest) => adminService.parametreOlustur(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sistem-parametreleri'] });
      setYeniModal(false);
      setYeniForm({ tip: 'STRING', kategori: 'GENEL' });
    },
    onError: () => setHata('Oluşturma başarısız.'),
  });

  const sil = useMutation({
    mutationFn: (id: number) => adminService.parametreSil(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sistem-parametreleri'] });
      setSilOnay(null);
    },
  });

  const duzenleAc = (p: SistemParametresiDto) => {
    setDegerInput(p.deger);
    setHata('');
    setDuzenleModal(p);
  };

  const filtrelenmis = (parametreler ?? []).filter(p =>
    kategoriFiltre ? p.kategori === kategoriFiltre : true
  );

  // Kategoriye göre grupla
  const gruplar = filtrelenmis.reduce<Record<string, SistemParametresiDto[]>>((acc, p) => {
    const k = p.kategori;
    if (!acc[k]) acc[k] = [];
    acc[k].push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Sistem Parametreleri</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {filtrelenmis.length} parametre
          </p>
        </div>
        <button
          onClick={() => { setYeniForm({ tip: 'STRING', kategori: 'GENEL' }); setHata(''); setYeniModal(true); }}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
        >
          + Yeni Parametre
        </button>
      </div>

      {/* Kategori filtresi */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setKategoriFiltre('')}
          className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
            kategoriFiltre === ''
              ? 'bg-brand-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          Tümü
        </button>
        {Object.entries(KATEGORI_ETIKETLER).map(([k, etiket]) => (
          <button
            key={k}
            onClick={() => setKategoriFiltre(k)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              kategoriFiltre === k
                ? 'bg-brand-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            {etiket}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500" />
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          Parametreler yüklenemedi.
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(gruplar).map(([kategori, liste]) => (
            <div key={kategori}>
              <div className="mb-3 flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${KATEGORI_RENK[kategori] ?? KATEGORI_RENK.GENEL}`}>
                  {KATEGORI_ETIKETLER[kategori] ?? kategori}
                </span>
                <span className="text-xs text-gray-400">{liste.length} parametre</span>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Anahtar</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Değer</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Varsayılan</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Tip</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {liste.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-mono text-xs font-semibold text-gray-700 dark:text-gray-300">{p.anahtar}</p>
                          {p.aciklama && (
                            <p className="mt-0.5 text-xs text-gray-400">{p.aciklama}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-gray-800 dark:text-white">{p.deger}</span>
                          {p.deger !== p.varsayilanDeger && (
                            <span className="ml-2 rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] font-medium text-orange-600 dark:bg-orange-900 dark:text-orange-300">
                              değiştirilmiş
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">{p.varsayilanDeger}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-500 dark:text-gray-400">{TIP_ETIKETLER[p.tip] ?? p.tip}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {p.duzenlenebilir && (
                              <button
                                onClick={() => duzenleAc(p)}
                                className="rounded-lg px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950 transition-colors"
                              >
                                Düzenle
                              </button>
                            )}
                            {p.deger !== p.varsayilanDeger && p.duzenlenebilir && (
                              <button
                                onClick={() => varsayilanaGetir.mutate(p.id)}
                                className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                              >
                                Sıfırla
                              </button>
                            )}
                            <button
                              onClick={() => setSilOnay(p)}
                              className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                            >
                              Sil
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          {filtrelenmis.length === 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white py-12 text-center text-gray-400 dark:border-gray-800 dark:bg-gray-900">
              Bu kategoride parametre yok.
            </div>
          )}
        </div>
      )}

      {/* Düzenle Modal */}
      {duzenleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Parametre Düzenle</h2>
            <p className="mt-1 font-mono text-sm text-gray-500">{duzenleModal.anahtar}</p>
            {duzenleModal.aciklama && (
              <p className="mt-1 text-xs text-gray-400">{duzenleModal.aciklama}</p>
            )}
            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Değer</label>
              {duzenleModal.tip === 'BOOLEAN' ? (
                <select
                  value={degerInput}
                  onChange={e => setDegerInput(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              ) : (
                <input
                  type={duzenleModal.tip === 'NUMBER' ? 'number' : 'text'}
                  value={degerInput}
                  onChange={e => setDegerInput(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-mono text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                />
              )}
              <p className="mt-1 text-xs text-gray-400">Varsayılan: {duzenleModal.varsayilanDeger}</p>
            </div>
            {hata && <p className="mt-2 text-sm text-red-500">{hata}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDuzenleModal(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
              >
                İptal
              </button>
              <button
                onClick={() => guncelle.mutate({ id: duzenleModal.id, deger: degerInput })}
                disabled={guncelle.isPending}
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60 transition-colors"
              >
                {guncelle.isPending ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Yeni Parametre Modal */}
      {yeniModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Yeni Parametre</h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Anahtar *</label>
                <input
                  type="text"
                  placeholder="ornek.parametre.adi"
                  value={yeniForm.anahtar ?? ''}
                  onChange={e => setYeniForm(f => ({ ...f, anahtar: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-mono text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Değer *</label>
                <input
                  type="text"
                  value={yeniForm.deger ?? ''}
                  onChange={e => setYeniForm(f => ({ ...f, deger: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-mono text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Varsayılan Değer *</label>
                <input
                  type="text"
                  value={yeniForm.varsayilanDeger ?? ''}
                  onChange={e => setYeniForm(f => ({ ...f, varsayilanDeger: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-mono text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Açıklama</label>
                <input
                  type="text"
                  value={yeniForm.aciklama ?? ''}
                  onChange={e => setYeniForm(f => ({ ...f, aciklama: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Tip</label>
                  <select
                    value={yeniForm.tip ?? 'STRING'}
                    onChange={e => setYeniForm(f => ({ ...f, tip: e.target.value as 'STRING' | 'NUMBER' | 'BOOLEAN' }))}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  >
                    <option value="STRING">Metin</option>
                    <option value="NUMBER">Sayı</option>
                    <option value="BOOLEAN">Boolean</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Kategori</label>
                  <select
                    value={yeniForm.kategori ?? 'GENEL'}
                    onChange={e => setYeniForm(f => ({ ...f, kategori: e.target.value as SistemParametresiOlusturRequest['kategori'] }))}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  >
                    {Object.entries(KATEGORI_ETIKETLER).map(([k, etiket]) => (
                      <option key={k} value={k}>{etiket}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            {hata && <p className="mt-2 text-sm text-red-500">{hata}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setYeniModal(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
              >
                İptal
              </button>
              <button
                onClick={() => {
                  if (!yeniForm.anahtar || !yeniForm.deger || !yeniForm.varsayilanDeger) {
                    setHata('Anahtar, değer ve varsayılan değer zorunludur.');
                    return;
                  }
                  olustur.mutate(yeniForm as SistemParametresiOlusturRequest);
                }}
                disabled={olustur.isPending}
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60 transition-colors"
              >
                {olustur.isPending ? 'Oluşturuluyor...' : 'Oluştur'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sil Onay */}
      {silOnay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Parametreyi Sil</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <code className="font-mono font-semibold">{silOnay.anahtar}</code> parametresi silinecek. Bu işlem geri alınamaz.
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
