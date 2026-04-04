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
  DestekTalebiOlusturRequest,
} from '@/types/destek.types';

const DURUM_ETIKET: Record<DestekDurumu, { ad: string; renk: string }> = {
  ACIK: { ad: 'Açık', renk: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  YANITLANDI: { ad: 'Yanıtlandı', renk: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  COZULDU: { ad: 'Çözüldü', renk: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' },
  KAPATILDI: { ad: 'Kapatıldı', renk: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
};

const ONCELIK_ETIKET: Record<DestekOnceligi, { ad: string; renk: string }> = {
  DUSUK: { ad: 'Düşük', renk: 'text-gray-500' },
  NORMAL: { ad: 'Normal', renk: 'text-blue-500' },
  YUKSEK: { ad: 'Yüksek', renk: 'text-orange-500' },
  ACIL: { ad: 'Acil', renk: 'text-red-500' },
};

const KATEGORI_ETIKET: Record<DestekKategorisi, string> = {
  GENEL: 'Genel',
  TEKNIK: 'Teknik',
  FATURA: 'Fatura',
  ONERI: 'Öneri',
  HATA: 'Hata Bildirimi',
};

export default function DestekPage() {
  const queryClient = useQueryClient();
  const [formAcik, setFormAcik] = useState(false);
  const [seciliTalep, setSeciliTalep] = useState<DestekTalebiResponse | null>(null);
  const [form, setForm] = useState<DestekTalebiOlusturRequest>({
    konu: '',
    mesaj: '',
    kategori: 'GENEL',
    oncelik: 'NORMAL',
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['destek-talepleri'],
    queryFn: () => destekService.listele(0, 50),
  });

  const olusturMutation = useMutation({
    mutationFn: (request: DestekTalebiOlusturRequest) => destekService.olustur(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['destek-talepleri'] });
      setFormAcik(false);
      setForm({ konu: '', mesaj: '', kategori: 'GENEL', oncelik: 'NORMAL' });
    },
  });

  const silMutation = useMutation({
    mutationFn: (id: number) => destekService.sil(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['destek-talepleri'] });
      setSeciliTalep(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.konu.trim() || !form.mesaj.trim()) return;
    olusturMutation.mutate(form);
  };

  const talepler = data?.icerik ?? [];

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Yardım & Destek</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Sorularınız veya sorunlarınız için destek talebi oluşturun
          </p>
        </div>
        <button
          onClick={() => setFormAcik(!formAcik)}
          className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
        >
          {formAcik ? 'İptal' : 'Yeni Talep Oluştur'}
        </button>
      </div>

      {/* Yeni Talep Formu */}
      {formAcik && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">Yeni Destek Talebi</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Konu</label>
              <input
                type="text"
                value={form.konu}
                onChange={(e) => setForm({ ...form, konu: e.target.value })}
                placeholder="Sorununuzu kısaca açıklayın"
                maxLength={200}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Kategori</label>
              <select
                value={form.kategori}
                onChange={(e) => setForm({ ...form, kategori: e.target.value as DestekKategorisi })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              >
                {(Object.keys(KATEGORI_ETIKET) as DestekKategorisi[]).map((k) => (
                  <option key={k} value={k}>{KATEGORI_ETIKET[k]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Öncelik</label>
              <select
                value={form.oncelik}
                onChange={(e) => setForm({ ...form, oncelik: e.target.value as DestekOnceligi })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              >
                {(Object.keys(ONCELIK_ETIKET) as DestekOnceligi[]).map((o) => (
                  <option key={o} value={o}>{ONCELIK_ETIKET[o].ad}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Mesaj</label>
              <textarea
                value={form.mesaj}
                onChange={(e) => setForm({ ...form, mesaj: e.target.value })}
                placeholder="Sorununuzu detaylı şekilde anlatın..."
                rows={5}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setFormAcik(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={olusturMutation.isPending}
              className="rounded-lg bg-brand-500 px-5 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60 transition-colors"
            >
              {olusturMutation.isPending ? 'Gönderiliyor...' : 'Gönder'}
            </button>
          </div>

          {olusturMutation.isError && (
            <p className="mt-3 text-sm text-red-500">Talep oluşturulurken bir hata oluştu.</p>
          )}
        </form>
      )}

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

      {/* Talep Listesi */}
      {!isLoading && !isError && (
        <div className="space-y-3">
          {talepler.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white py-16 text-center dark:border-gray-700 dark:bg-gray-800">
              <span className="mb-3 text-4xl">📬</span>
              <p className="text-gray-500 dark:text-gray-400">Henüz destek talebiniz yok</p>
              <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                Yardıma ihtiyacınız varsa yukarıdaki butona tıklayarak talep oluşturabilirsiniz
              </p>
            </div>
          ) : (
            talepler.map((talep) => (
              <div
                key={talep.id}
                onClick={() => setSeciliTalep(seciliTalep?.id === talep.id ? null : talep)}
                className="cursor-pointer rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-brand-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-brand-600"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-gray-800 dark:text-white">{talep.konu}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${DURUM_ETIKET[talep.durum].renk}`}>
                    {DURUM_ETIKET[talep.durum].ad}
                  </span>
                  <span className={`text-xs font-medium ${ONCELIK_ETIKET[talep.oncelik].renk}`}>
                    {ONCELIK_ETIKET[talep.oncelik].ad}
                  </span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                    {KATEGORI_ETIKET[talep.kategori]}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{talep.mesaj}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {format(new Date(talep.createdAt), 'dd.MM.yyyy HH:mm')}
                </p>

                {/* Detay Paneli */}
                {seciliTalep?.id === talep.id && (
                  <div className="mt-4 space-y-3 border-t border-gray-100 pt-4 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Mesajınız</p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">{talep.mesaj}</p>
                    </div>

                    {talep.adminYaniti && (
                      <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                        <p className="text-xs font-medium text-green-700 dark:text-green-400">
                          Yanıt {talep.yanitlayanAdminAdi && `- ${talep.yanitlayanAdminAdi}`}
                          {talep.yanitlanmaTarihi && ` (${format(new Date(talep.yanitlanmaTarihi), 'dd.MM.yyyy HH:mm')})`}
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-green-800 dark:text-green-300">{talep.adminYaniti}</p>
                      </div>
                    )}

                    {talep.durum === 'ACIK' && (
                      <button
                        onClick={() => silMutation.mutate(talep.id)}
                        disabled={silMutation.isPending}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        Talebi Sil
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* SSS / İletişim Bilgileri */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Sıkça Sorulan Sorular</h2>
        <div className="mt-4 space-y-3">
          {[
            { soru: 'Gider nasıl eklenir?', cevap: 'Sol menüden "Giderler" sayfasına gidin ve "Yeni Gider" butonuna tıklayın.' },
            { soru: 'Bütçe limiti nasıl belirlenir?', cevap: '"Bütçeler" sayfasından kategori bazlı aylık bütçe limitleri tanımlayabilirsiniz.' },
            { soru: 'CSV dosyası nasıl yüklenir?', cevap: '"CSV Yükle" sayfasından banka hesap özetinizi CSV formatında yükleyebilirsiniz.' },
            { soru: 'AI Koç nedir?', cevap: 'AI Koç, harcama alışkanlıklarınızı analiz eden ve tasarruf önerileri sunan yapay zeka asistanınızdır.' },
          ].map((item, idx) => (
            <details key={idx} className="group">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-brand-500 dark:text-gray-300 dark:hover:text-brand-400">
                {item.soru}
              </summary>
              <p className="mt-1 pl-4 text-sm text-gray-500 dark:text-gray-400">{item.cevap}</p>
            </details>
          ))}
        </div>

        <div className="mt-6 border-t border-gray-100 pt-4 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Daha fazla yardım için <span className="font-medium text-brand-500">destek@giderlerim.net</span> adresine e-posta gönderebilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
}
