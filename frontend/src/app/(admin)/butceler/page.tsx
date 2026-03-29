'use client';

import React, { useState } from 'react';
import { useButceOzetler, useButceEkle, useButceSil, useButceGuncelle } from '@/hooks/useButceler';
import { useKategoriler } from '@/hooks/useKategoriler';
import { ButceOzetResponse, ButceOlusturRequest } from '@/types/butce.types';
import { useAuthStore } from '@/stores/authStore';

const AY_ADLARI = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

const formatPara = (tutar: number, paraBirimi = 'TRY') =>
  tutar.toLocaleString('tr-TR', { style: 'currency', currency: paraBirimi });

type ModalTip = 'ekle' | { tip: 'duzenle'; ozet: ButceOzetResponse } | null;

export default function ButcelerPage() {
  const { kullanici } = useAuthStore();
  const para = (t: number) => formatPara(t, kullanici?.paraBirimi ?? 'TRY');

  const bugun = new Date();
  const [ay, setAy] = useState(bugun.getMonth() + 1);
  const [yil, setYil] = useState(bugun.getFullYear());
  const [modal, setModal] = useState<ModalTip>(null);
  const [silOnay, setSilOnay] = useState<number | null>(null);
  const [formHata, setFormHata] = useState('');

  const { data: ozetler, isLoading, isError } = useButceOzetler(ay, yil);
  const { data: kategoriler } = useKategoriler();
  const butceEkle = useButceEkle();
  const butceSil = useButceSil();
  const butceGuncelle = useButceGuncelle();

  const [form, setForm] = useState<Partial<ButceOlusturRequest>>({ uyariYuzdesi: 80 });

  const modalAc = (tip: ModalTip) => {
    if (tip && typeof tip === 'object' && tip.tip === 'duzenle') {
      setForm({ limitTutar: tip.ozet.limitTutar });
    } else {
      setForm({ ay, yil, uyariYuzdesi: 80 });
    }
    setFormHata('');
    setModal(tip);
  };

  const kaydet = async () => {
    if (modal && typeof modal === 'object' && modal.tip === 'duzenle') {
      if (!form.limitTutar || form.limitTutar <= 0) { setFormHata('Geçerli limit girin.'); return; }
      try {
        await butceGuncelle.mutateAsync({ id: modal.ozet.butceId, data: { limitTutar: form.limitTutar, uyariYuzdesi: form.uyariYuzdesi } });
        setModal(null);
      } catch { setFormHata('Hata oluştu.'); }
    } else {
      if (!form.kategoriId) { setFormHata('Kategori seçin.'); return; }
      if (!form.limitTutar || form.limitTutar <= 0) { setFormHata('Geçerli limit girin.'); return; }
      try {
        await butceEkle.mutateAsync(form as ButceOlusturRequest);
        setModal(null);
      } catch { setFormHata('Hata oluştu.'); }
    }
  };

  const progressRenk = (yuzde: number, asimi: boolean) => {
    if (asimi) return 'bg-red-500';
    if (yuzde >= 90) return 'bg-red-400';
    if (yuzde >= 70) return 'bg-orange-400';
    return 'bg-green-500';
  };

  const yillar = [yil - 1, yil, yil + 1];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Bütçeler</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Kategori bazlı harcama limitlerinizi yönetin</p>
        </div>
        <button
          onClick={() => modalAc('ekle')}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Bütçe
        </button>
      </div>

      {/* Ay/Yıl seçici */}
      <div className="flex flex-wrap gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <select
          value={ay}
          onChange={(e) => setAy(Number(e.target.value))}
          className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          {AY_ADLARI.map((ad, i) => <option key={i + 1} value={i + 1}>{ad}</option>)}
        </select>
        <select
          value={yil}
          onChange={(e) => setYil(Number(e.target.value))}
          className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          {yillar.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500" />
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          Bütçeler yüklenemedi.
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {(!ozetler || ozetler.length === 0) ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white py-16 text-center dark:border-gray-700 dark:bg-gray-800">
              <p className="text-gray-400">{AY_ADLARI[ay - 1]} {yil} için bütçe yok</p>
              <button onClick={() => modalAc('ekle')} className="mt-3 text-sm font-medium text-brand-500 hover:underline">
                İlk bütçeyi oluştur
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ozetler.map((o) => (
                <div key={o.butceId} className={`rounded-2xl border bg-white p-5 dark:bg-gray-800 ${
                  o.limitAsildi ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-700'
                }`}>
                  {o.limitAsildi && (
                    <div className="mb-3 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 dark:bg-red-900/30 dark:text-red-400">
                      ⚠️ Limit aşıldı
                    </div>
                  )}
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full text-sm"
                        style={{ backgroundColor: (o.kategori.renk || '#6366F1') + '20', color: o.kategori.renk || '#6366F1' }}>
                        {o.kategori.ikon || '💳'}
                      </span>
                      <span className="font-semibold text-gray-800 dark:text-white">{o.kategori.ad}</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => modalAc({ tip: 'duzenle', ozet: o })}
                        className="text-gray-400 hover:text-brand-500 transition-colors p-1">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => setSilOnay(o.butceId)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Harcanan</span>
                    <span className="font-semibold text-gray-800 dark:text-white">{para(o.harcananTutar)}</span>
                  </div>
                  <div className="mb-1 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                    <div
                      className={`h-full rounded-full transition-all ${progressRenk(o.kullanimYuzdesi, o.limitAsildi)}`}
                      style={{ width: `${Math.min(o.kullanimYuzdesi, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>%{o.kullanimYuzdesi.toFixed(0)}</span>
                    <span>Limit: {para(o.limitTutar)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Ekle/Düzenle Modal */}
      {modal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {typeof modal === 'object' && modal.tip === 'duzenle' ? 'Bütçeyi Düzenle' : 'Yeni Bütçe'}
              </h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              {modal === 'ekle' && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Kategori</label>
                  <select
                    value={form.kategoriId ?? ''}
                    onChange={(e) => setForm(f => ({ ...f, kategoriId: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Seçin...</option>
                    {kategoriler?.map(k => <option key={k.id} value={k.id}>{k.ikon} {k.ad}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Limit (₺)</label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={form.limitTutar ?? ''}
                  onChange={(e) => setForm(f => ({ ...f, limitTutar: parseFloat(e.target.value) }))}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Uyarı Eşiği (%) — Varsayılan: 80
                </label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={form.uyariYuzdesi ?? 80}
                  onChange={(e) => setForm(f => ({ ...f, uyariYuzdesi: parseInt(e.target.value) }))}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                disabled={butceEkle.isPending || butceGuncelle.isPending}
                className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60">
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Silme onayı */}
      {silOnay !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800">
            <h2 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">Bütçeyi Sil</h2>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Bu bütçe kalıcı olarak silinecek. Emin misiniz?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setSilOnay(null)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">
                İptal
              </button>
              <button onClick={async () => { await butceSil.mutateAsync(silOnay); setSilOnay(null); }}
                disabled={butceSil.isPending}
                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60">
                {butceSil.isPending ? 'Siliniyor...' : 'Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
