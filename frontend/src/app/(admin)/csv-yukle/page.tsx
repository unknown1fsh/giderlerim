'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { csvService, CsvYuklemeResponse } from '@/services/csvService';
import { useAuthStore } from '@/stores/authStore';

const DURUM_GORUNUM: Record<CsvYuklemeResponse['durum'], { renk: string; etiket: string }> = {
  ISLENIYOR: { renk: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', etiket: 'İşleniyor...' },
  TAMAMLANDI: { renk: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', etiket: 'Tamamlandı' },
  HATA: { renk: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', etiket: 'Hata' },
};

export default function CsvYuklePage() {
  const { kullanici } = useAuthStore();
  const [suruklenenVar, setSuruklenenVar] = useState(false);
  const [secilenDosya, setSecilenDosya] = useState<File | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [sonDurum, setSonDurum] = useState<CsvYuklemeResponse | null>(null);
  const [gecmis, setGecmis] = useState<CsvYuklemeResponse[]>([]);
  const [hata, setHata] = useState('');
  const dosyaInputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    gecmisYukle();
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

  const gecmisYukle = async () => {
    try {
      const r = await csvService.gecmis();
      setGecmis(r.data);
    } catch { /* sessizce */ }
  };

  const pollingBaslat = (id: number) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      try {
        const r = await csvService.durumSorgula(id);
        setSonDurum(r.data);
        if (r.data.durum !== 'ISLENIYOR') {
          clearInterval(pollingRef.current!);
          pollingRef.current = null;
          gecmisYukle();
        }
      } catch {
        clearInterval(pollingRef.current!);
        pollingRef.current = null;
      }
    }, 2000);
  };

  const dosyaYukle = async () => {
    if (!secilenDosya) return;
    setYukleniyor(true);
    setHata('');
    setSonDurum(null);
    try {
      const formData = new FormData();
      formData.append('dosya', secilenDosya);
      const r = await csvService.dosyaYukle(formData);
      setSonDurum(r.data);
      setSecilenDosya(null);
      if (dosyaInputRef.current) dosyaInputRef.current.value = '';
      if (r.data.durum === 'ISLENIYOR') pollingBaslat(r.data.id);
      else gecmisYukle();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { mesaj?: string } } };
      setHata(err?.response?.data?.mesaj ?? 'Yükleme başarısız.');
    } finally {
      setYukleniyor(false);
    }
  };

  const dosyaSec = useCallback((dosya: File) => {
    if (!dosya.name.endsWith('.csv')) {
      setHata('Yalnızca .csv dosyaları kabul edilir.');
      return;
    }
    setHata('');
    setSecilenDosya(dosya);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setSuruklenenVar(false);
    const dosya = e.dataTransfer.files[0];
    if (dosya) dosyaSec(dosya);
  }, [dosyaSec]);

  const isPremium = kullanici?.plan === 'PREMIUM' || kullanici?.plan === 'ULTRA';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">CSV İçe Aktar</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">CSV dosyanızı yükleyerek harcamalarınızı toplu ekleyin</p>
      </div>

      {/* Plan bilgisi */}
      <div className={`rounded-xl border p-4 text-sm ${
        isPremium
          ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-900/20 dark:text-green-400'
          : 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
      }`}>
        {isPremium
          ? '✅ Sınırsız CSV yükleme hakkınız var.'
          : '⚠️ Ücretsiz planda ayda 1 CSV yükleme hakkınız var. Pro\'ya geçerek sınırsız yükleyin.'}
      </div>

      {/* Yükleme alanı */}
      <div
        onDragOver={(e) => { e.preventDefault(); setSuruklenenVar(true); }}
        onDragLeave={() => setSuruklenenVar(false)}
        onDrop={onDrop}
        onClick={() => dosyaInputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-colors ${
          suruklenenVar
            ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20'
            : 'border-gray-300 bg-white hover:border-brand-300 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-brand-600'
        }`}
      >
        <input
          ref={dosyaInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) dosyaSec(f); }}
        />
        <svg className={`mb-3 h-12 w-12 ${suruklenenVar ? 'text-brand-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        {secilenDosya ? (
          <div className="text-center">
            <p className="font-semibold text-brand-600 dark:text-brand-400">{secilenDosya.name}</p>
            <p className="text-sm text-gray-400">{(secilenDosya.size / 1024).toFixed(1)} KB</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="font-medium text-gray-700 dark:text-gray-300">Dosyayı sürükle veya tıkla</p>
            <p className="mt-1 text-sm text-gray-400">Yalnızca .csv dosyaları</p>
          </div>
        )}
      </div>

      {hata && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{hata}</div>
      )}

      {secilenDosya && (
        <div className="flex justify-end">
          <button
            onClick={dosyaYukle}
            disabled={yukleniyor}
            className="rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60 transition-colors"
          >
            {yukleniyor ? 'Yükleniyor...' : 'Yükle'}
          </button>
        </div>
      )}

      {/* Son yükleme durumu */}
      {sonDurum && (
        <div className={`rounded-xl border p-4 ${
          sonDurum.durum === 'TAMAMLANDI' ? 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
          : sonDurum.durum === 'HATA' ? 'border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-900/20'
          : 'border-yellow-200 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800 dark:text-white">{sonDurum.dosyaAdi}</p>
              {sonDurum.durum === 'TAMAMLANDI' && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  {sonDurum.islenenSatir} / {sonDurum.toplamSatir} satır işlendi
                </p>
              )}
              {sonDurum.durum === 'HATA' && sonDurum.hataMesaji && (
                <p className="text-sm text-red-600 dark:text-red-400">{sonDurum.hataMesaji}</p>
              )}
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${DURUM_GORUNUM[sonDurum.durum].renk}`}>
              {DURUM_GORUNUM[sonDurum.durum].etiket}
            </span>
          </div>
        </div>
      )}

      {/* Geçmiş */}
      {gecmis.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-white">Yükleme Geçmişi</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Dosya</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Satırlar</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Durum</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Tarih</th>
                </tr>
              </thead>
              <tbody>
                {gecmis.map(g => (
                  <tr key={g.id} className="border-b border-gray-50 dark:border-gray-700/50">
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{g.dosyaAdi}</td>
                    <td className="px-4 py-3 text-gray-500">{g.islenenSatir} / {g.toplamSatir}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${DURUM_GORUNUM[g.durum].renk}`}>
                        {DURUM_GORUNUM[g.durum].etiket}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{format(new Date(g.createdAt), 'dd.MM.yyyy HH:mm')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
