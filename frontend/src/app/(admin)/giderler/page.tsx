'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { useGiderler, useGiderEkle, useGiderSil } from '@/hooks/useGiderler';
import { useKategoriler } from '@/hooks/useKategoriler';
import { giderService } from '@/services/giderService';
import { useQueryClient } from '@tanstack/react-query';
import { GiderFiltre, GiderOlusturRequest, GiderResponse, OdemeYontemi } from '@/types/gider.types';
import type { KategoriResponse } from '@/types/kategori.types';
import { useAuthStore } from '@/stores/authStore';

const ODEME_YONTEMLERI: { value: OdemeYontemi; label: string }[] = [
  { value: 'NAKIT', label: 'Nakit' },
  { value: 'KREDI_KARTI', label: 'Kredi Kartı' },
  { value: 'BANKA_KARTI', label: 'Banka Kartı' },
  { value: 'HAVALE', label: 'Havale' },
  { value: 'DIGER', label: 'Diğer' },
];

const formatPara = (tutar: number, paraBirimi = 'TRY') =>
  tutar.toLocaleString('tr-TR', { style: 'currency', currency: paraBirimi });

type Modal = { tip: 'ekle' } | { tip: 'duzenle'; gider: GiderResponse } | null;

export default function GiderlerPage() {
  const { kullanici } = useAuthStore();
  const queryClient = useQueryClient();
  const para = (t: number) => formatPara(t, kullanici?.paraBirimi ?? 'TRY');

  const [filtre, setFiltre] = useState<GiderFiltre>({ page: 0, size: 20 });
  const [modal, setModal] = useState<Modal>(null);
  const [silOnay, setSilOnay] = useState<number | null>(null);

  const { data: sayfali, isLoading, isError } = useGiderler(filtre);
  const { data: kategoriler } = useKategoriler();
  const giderEkle = useGiderEkle();
  const giderSil = useGiderSil();

  const giderler = sayfali?.icerik ?? [];
  const toplamSayfa = sayfali?.toplamSayfa ?? 1;
  const mevcutSayfa = filtre.page ?? 0;

  const [form, setForm] = useState<Partial<GiderOlusturRequest>>({
    tarih: format(new Date(), 'yyyy-MM-dd'),
    odemeYontemi: 'NAKIT',
  });
  const [formHata, setFormHata] = useState('');

  const modalAc = (tip: Modal) => {
    if (tip?.tip === 'duzenle') {
      setForm({
        kategoriId: tip.gider.kategori.id,
        tutar: tip.gider.tutar,
        tarih: tip.gider.tarih,
        odemeYontemi: tip.gider.odemeYontemi,
        aciklama: tip.gider.aciklama ?? '',
        notlar: tip.gider.notlar ?? '',
      });
    } else {
      setForm({ tarih: format(new Date(), 'yyyy-MM-dd'), odemeYontemi: 'NAKIT' });
    }
    setFormHata('');
    setModal(tip);
  };

  const kaydet = async () => {
    if (!form.kategoriId) { setFormHata('Kategori seçin.'); return; }
    if (!form.tutar || form.tutar <= 0) { setFormHata('Geçerli bir tutar girin.'); return; }
    if (!form.tarih) { setFormHata('Tarih girin.'); return; }
    setFormHata('');

    try {
      const req = form as GiderOlusturRequest;
      if (modal?.tip === 'duzenle') {
        await giderService.guncelle(modal.gider.id, req);
        queryClient.invalidateQueries({ queryKey: ['giderler'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      } else {
        await giderEkle.mutateAsync(req);
      }
      setModal(null);
    } catch {
      setFormHata('İşlem sırasında hata oluştu.');
    }
  };

  const sil = async (id: number) => {
    await giderSil.mutateAsync(id);
    setSilOnay(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Giderler</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Tüm harcamalarınızı yönetin</p>
        </div>
        <button
          onClick={() => modalAc({ tip: 'ekle' })}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Gider
        </button>
      </div>

      {/* Filtreler */}
      <div className="flex flex-wrap gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <select
          value={filtre.kategoriId ?? ''}
          onChange={(e) => setFiltre(f => ({ ...f, kategoriId: e.target.value ? Number(e.target.value) : undefined, page: 0 }))}
          className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option value="">Tüm Kategoriler</option>
          {kategoriler?.map((k: KategoriResponse) => <option key={k.id} value={k.id}>{k.ikon} {k.ad}</option>)}
        </select>
        <input
          type="date"
          value={filtre.baslangicTarihi ?? ''}
          onChange={(e) => setFiltre(f => ({ ...f, baslangicTarihi: e.target.value || undefined, page: 0 }))}
          className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          placeholder="Başlangıç"
        />
        <input
          type="date"
          value={filtre.bitisTarihi ?? ''}
          onChange={(e) => setFiltre(f => ({ ...f, bitisTarihi: e.target.value || undefined, page: 0 }))}
          className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          placeholder="Bitiş"
        />
        <select
          value={filtre.odemeYontemi ?? ''}
          onChange={(e) => setFiltre(f => ({ ...f, odemeYontemi: (e.target.value as OdemeYontemi) || undefined, page: 0 }))}
          className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option value="">Tüm Yöntemler</option>
          {ODEME_YONTEMLERI.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {(filtre.kategoriId || filtre.baslangicTarihi || filtre.bitisTarihi || filtre.odemeYontemi) && (
          <button
            onClick={() => setFiltre({ page: 0, size: 20 })}
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400"
          >
            Temizle
          </button>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500" />
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          Giderler yüklenemedi.
        </div>
      )}

      {!isLoading && !isError && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          {giderler.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-gray-400">Henüz gider yok</p>
              <button onClick={() => modalAc({ tip: 'ekle' })} className="mt-3 text-sm font-medium text-brand-500 hover:underline">
                İlk gideri ekle
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Tarih</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Kategori</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Açıklama</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Yöntem</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">Tutar</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500"></th>
                  </tr>
                </thead>
                <tbody>
                  {giderler.map((g: GiderResponse) => (
                    <tr key={g.id} className="border-b border-gray-50 hover:bg-gray-50 dark:border-gray-700/50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {format(new Date(g.tarih), 'dd.MM.yyyy')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full text-sm"
                            style={{ backgroundColor: (g.kategori.renk || '#6366F1') + '20', color: g.kategori.renk || '#6366F1' }}>
                            {g.kategori.ikon || '💳'}
                          </span>
                          <span className="font-medium text-gray-700 dark:text-gray-200">{g.kategori.ad}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 max-w-[200px] truncate">
                        {g.aciklama || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {ODEME_YONTEMLERI.find(o => o.value === g.odemeYontemi)?.label ?? g.odemeYontemi}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-red-500 whitespace-nowrap">
                        -{para(g.tutar)}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button onClick={() => modalAc({ tip: 'duzenle', gider: g })}
                          className="mr-2 text-gray-400 hover:text-brand-500 transition-colors">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => setSilOnay(g.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Sayfalama */}
          {toplamSayfa > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 dark:border-gray-700">
              <span className="text-sm text-gray-500">{mevcutSayfa + 1} / {toplamSayfa}</span>
              <div className="flex gap-2">
                <button
                  disabled={mevcutSayfa === 0}
                  onClick={() => setFiltre(f => ({ ...f, page: (f.page ?? 0) - 1 }))}
                  className="rounded-lg border border-gray-200 px-3 py-1 text-sm disabled:opacity-40 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                >
                  Önceki
                </button>
                <button
                  disabled={mevcutSayfa >= toplamSayfa - 1}
                  onClick={() => setFiltre(f => ({ ...f, page: (f.page ?? 0) + 1 }))}
                  className="rounded-lg border border-gray-200 px-3 py-1 text-sm disabled:opacity-40 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                >
                  Sonraki
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {modal.tip === 'ekle' ? 'Yeni Gider' : 'Gideri Düzenle'}
              </h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Kategori</label>
                <select
                  value={form.kategoriId ?? ''}
                  onChange={(e) => setForm(f => ({ ...f, kategoriId: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Seçin...</option>
                  {kategoriler?.map((k: KategoriResponse) => <option key={k.id} value={k.id}>{k.ikon} {k.ad}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Tutar</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.tutar ?? ''}
                  onChange={(e) => setForm(f => ({ ...f, tutar: parseFloat(e.target.value) }))}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Tarih</label>
                <input
                  type="date"
                  value={form.tarih ?? ''}
                  onChange={(e) => setForm(f => ({ ...f, tarih: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Ödeme Yöntemi</label>
                <select
                  value={form.odemeYontemi ?? 'NAKIT'}
                  onChange={(e) => setForm(f => ({ ...f, odemeYontemi: e.target.value as OdemeYontemi }))}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  {ODEME_YONTEMLERI.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Açıklama</label>
                <input
                  type="text"
                  value={form.aciklama ?? ''}
                  onChange={(e) => setForm(f => ({ ...f, aciklama: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Opsiyonel"
                />
              </div>
              {formHata && <p className="text-sm text-red-500">{formHata}</p>}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setModal(null)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">
                İptal
              </button>
              <button onClick={kaydet}
                disabled={giderEkle.isPending}
                className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60">
                {giderEkle.isPending ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Silme onayı */}
      {silOnay !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800">
            <h2 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">Gideri Sil</h2>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Bu gider kalıcı olarak silinecek. Emin misiniz?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setSilOnay(null)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">
                İptal
              </button>
              <button onClick={() => sil(silOnay)}
                disabled={giderSil.isPending}
                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60">
                {giderSil.isPending ? 'Siliniyor...' : 'Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
