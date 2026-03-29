'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { destekService } from '@/services/destekService';
import {
  DestekDurumu,
  DestekOnceligi,
  DestekKategorisi,
  DestekTalebiResponse,
} from '@/types/destek.types';

const DURUM_ETIKET: Record<DestekDurumu, { ad: string; renk: string }> = {
  ACIK: { ad: 'Açık', renk: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  YANITLANDI: { ad: 'Yanıtlandı', renk: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  COZULDU: { ad: 'Çözüldü', renk: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' },
  KAPATILDI: { ad: 'Kapatıldı', renk: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
};

const ONCELIK_ETIKET: Record<DestekOnceligi, { ad: string; renk: string }> = {
  DUSUK: { ad: 'Düşük', renk: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' },
  NORMAL: { ad: 'Normal', renk: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
  YUKSEK: { ad: 'Yüksek', renk: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
  ACIL: { ad: 'Acil', renk: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
};

const KATEGORI_ETIKET: Record<DestekKategorisi, string> = {
  GENEL: 'Genel',
  TEKNIK: 'Teknik',
  FATURA: 'Fatura',
  ONERI: 'Öneri',
  HATA: 'Hata Bildirimi',
};

export default function AdminDestekTalepleriPage() {
  const queryClient = useQueryClient();
  const [filtreDurum, setFiltreDurum] = useState('');
  const [filtreOncelik, setFiltreOncelik] = useState('');
  const [filtreKategori, setFiltreKategori] = useState('');
  const [seciliTalep, setSeciliTalep] = useState<DestekTalebiResponse | null>(null);
  const [yanitMetni, setYanitMetni] = useState('');
  const [yanitDurum, setYanitDurum] = useState<DestekDurumu>('YANITLANDI');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'destek-talepleri', filtreDurum, filtreOncelik, filtreKategori],
    queryFn: () =>
      destekService.adminListele({
        durum: filtreDurum || undefined,
        oncelik: filtreOncelik || undefined,
        kategori: filtreKategori || undefined,
        sayfa: 0,
        boyut: 50,
      }),
  });

  const yanitlaMutation = useMutation({
    mutationFn: ({ id, yanit, durum }: { id: number; yanit: string; durum: DestekDurumu }) =>
      destekService.adminYanitla(id, { adminYaniti: yanit, durum }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'destek-talepleri'] });
      setSeciliTalep(null);
      setYanitMetni('');
    },
  });

  const durumMutation = useMutation({
    mutationFn: ({ id, durum }: { id: number; durum: string }) =>
      destekService.adminDurumGuncelle(id, durum),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'destek-talepleri'] });
    },
  });

  const talepler = data?.icerik ?? [];

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Destek Talepleri</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Kullanıcılardan gelen destek taleplerini yönetin
          {data && <span className="ml-1">({data.toplamEleman} talep)</span>}
        </p>
      </div>

      {/* Filtreler */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filtreDurum}
          onChange={(e) => setFiltreDurum(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
        >
          <option value="">Tüm Durumlar</option>
          {(Object.keys(DURUM_ETIKET) as DestekDurumu[]).map((d) => (
            <option key={d} value={d}>{DURUM_ETIKET[d].ad}</option>
          ))}
        </select>

        <select
          value={filtreOncelik}
          onChange={(e) => setFiltreOncelik(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
        >
          <option value="">Tüm Öncelikler</option>
          {(Object.keys(ONCELIK_ETIKET) as DestekOnceligi[]).map((o) => (
            <option key={o} value={o}>{ONCELIK_ETIKET[o].ad}</option>
          ))}
        </select>

        <select
          value={filtreKategori}
          onChange={(e) => setFiltreKategori(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
        >
          <option value="">Tüm Kategoriler</option>
          {(Object.keys(KATEGORI_ETIKET) as DestekKategorisi[]).map((k) => (
            <option key={k} value={k}>{KATEGORI_ETIKET[k]}</option>
          ))}
        </select>

        {(filtreDurum || filtreOncelik || filtreKategori) && (
          <button
            onClick={() => { setFiltreDurum(''); setFiltreOncelik(''); setFiltreKategori(''); }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            Filtreleri Temizle
          </button>
        )}
      </div>

      {/* Yükleniyor */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500" />
        </div>
      )}

      {/* Hata */}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          Destek talepleri yüklenemedi.
        </div>
      )}

      {/* Tablo */}
      {!isLoading && !isError && (
        <>
          {talepler.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white py-16 text-center dark:border-gray-700 dark:bg-gray-800">
              <span className="mb-3 text-4xl">📭</span>
              <p className="text-gray-500 dark:text-gray-400">Destek talebi bulunamadı</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                      <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Kullanıcı</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Konu</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Kategori</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Öncelik</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Durum</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Tarih</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {talepler.map((talep) => (
                      <tr
                        key={talep.id}
                        className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-750 ${
                          talep.durum === 'ACIK' ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-850'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800 dark:text-white">{talep.kullaniciAdi}</p>
                          <p className="text-xs text-gray-400">{talep.kullaniciEmail}</p>
                        </td>
                        <td className="max-w-[200px] px-4 py-3">
                          <p className="truncate font-medium text-gray-700 dark:text-gray-300">{talep.konu}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-700 dark:text-gray-300">
                            {KATEGORI_ETIKET[talep.kategori]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ONCELIK_ETIKET[talep.oncelik].renk}`}>
                            {ONCELIK_ETIKET[talep.oncelik].ad}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${DURUM_ETIKET[talep.durum].renk}`}>
                            {DURUM_ETIKET[talep.durum].ad}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-400">
                          {format(new Date(talep.createdAt), 'dd.MM.yyyy HH:mm')}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setSeciliTalep(talep);
                                setYanitMetni(talep.adminYaniti ?? '');
                                setYanitDurum('YANITLANDI');
                              }}
                              className="rounded-lg px-2 py-1 text-xs font-medium text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20"
                            >
                              Detay
                            </button>
                            {talep.durum === 'ACIK' && (
                              <button
                                onClick={() => durumMutation.mutate({ id: talep.id, durum: 'KAPATILDI' })}
                                className="rounded-lg px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                Kapat
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Detay / Yanıtlama Modal */}
      {seciliTalep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSeciliTalep(null)}>
          <div
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">{seciliTalep.konu}</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {seciliTalep.kullaniciAdi} ({seciliTalep.kullaniciEmail})
                </p>
              </div>
              <button
                onClick={() => setSeciliTalep(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${DURUM_ETIKET[seciliTalep.durum].renk}`}>
                {DURUM_ETIKET[seciliTalep.durum].ad}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ONCELIK_ETIKET[seciliTalep.oncelik].renk}`}>
                {ONCELIK_ETIKET[seciliTalep.oncelik].ad}
              </span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-700 dark:text-gray-300">
                {KATEGORI_ETIKET[seciliTalep.kategori]}
              </span>
              <span className="text-xs text-gray-400">
                {format(new Date(seciliTalep.createdAt), 'dd.MM.yyyy HH:mm')}
              </span>
            </div>

            {/* Kullanıcı Mesajı */}
            <div className="mt-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Kullanıcı Mesajı</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">{seciliTalep.mesaj}</p>
            </div>

            {/* Mevcut Yanıt */}
            {seciliTalep.adminYaniti && (
              <div className="mt-3 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                <p className="text-xs font-medium text-green-700 dark:text-green-400">
                  Önceki Yanıt {seciliTalep.yanitlayanAdminAdi && `- ${seciliTalep.yanitlayanAdminAdi}`}
                  {seciliTalep.yanitlanmaTarihi && ` (${format(new Date(seciliTalep.yanitlanmaTarihi), 'dd.MM.yyyy HH:mm')})`}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-green-800 dark:text-green-300">{seciliTalep.adminYaniti}</p>
              </div>
            )}

            {/* Yanıt Formu */}
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Yanıt</label>
                <textarea
                  value={yanitMetni}
                  onChange={(e) => setYanitMetni(e.target.value)}
                  rows={4}
                  placeholder="Kullanıcıya yanıtınızı yazın..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Durum Güncelle</label>
                <select
                  value={yanitDurum}
                  onChange={(e) => setYanitDurum(e.target.value as DestekDurumu)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                >
                  {(Object.keys(DURUM_ETIKET) as DestekDurumu[]).map((d) => (
                    <option key={d} value={d}>{DURUM_ETIKET[d].ad}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setSeciliTalep(null)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  İptal
                </button>
                <button
                  onClick={() => {
                    if (!yanitMetni.trim()) return;
                    yanitlaMutation.mutate({
                      id: seciliTalep.id,
                      yanit: yanitMetni,
                      durum: yanitDurum,
                    });
                  }}
                  disabled={yanitlaMutation.isPending || !yanitMetni.trim()}
                  className="rounded-lg bg-brand-500 px-5 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60 transition-colors"
                >
                  {yanitlaMutation.isPending ? 'Gönderiliyor...' : 'Yanıtla'}
                </button>
              </div>

              {yanitlaMutation.isError && (
                <p className="text-sm text-red-500">Yanıt gönderilirken bir hata oluştu.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
