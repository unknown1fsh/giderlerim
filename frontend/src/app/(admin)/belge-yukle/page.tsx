'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { belgeService, BelgeYuklemeResponse } from '@/services/belgeService';
import PlanKapisi from '@/components/shared/PlanKapisi';

const KABUL_FORMATLARI = ['.csv', '.xlsx', '.pdf', '.jpg', '.jpeg', '.png', '.bmp'];
const ACCEPT_MIME = '.csv,.xlsx,.pdf,.jpg,.jpeg,.png,.bmp,image/*';

const DURUM_GORUNUM: Record<BelgeYuklemeResponse['durum'], { renk: string; etiket: string }> = {
  ISLENIYOR: { renk: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', etiket: 'İşleniyor...' },
  TAMAMLANDI: { renk: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', etiket: 'Tamamlandı' },
  HATA: { renk: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', etiket: 'Hata' },
};

function BelgeYukleIcerigi() {
  const [suruklenenVar, setSuruklenenVar] = useState(false);
  const [secilenDosya, setSecilenDosya] = useState<File | null>(null);
  const [onizleme, setOnizleme] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [sonDurum, setSonDurum] = useState<BelgeYuklemeResponse | null>(null);
  const [gecmis, setGecmis] = useState<BelgeYuklemeResponse[]>([]);
  const [hata, setHata] = useState('');
  const dosyaInputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    gecmisYukle();
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

  const gecmisYukle = async () => {
    try {
      const r = await belgeService.gecmis();
      setGecmis(r.data);
    } catch { /* sessizce */ }
  };

  const pollingBaslat = (id: number) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      try {
        const r = await belgeService.durumSorgula(id);
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

  const dosyaSec = useCallback((dosya: File) => {
    const uzanti = '.' + dosya.name.split('.').pop()?.toLowerCase();
    if (!KABUL_FORMATLARI.includes(uzanti)) {
      setHata(`Desteklenmeyen format. İzin verilenler: ${KABUL_FORMATLARI.join(', ')}`);
      return;
    }
    setHata('');
    setSecilenDosya(dosya);
    if (dosya.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setOnizleme(e.target?.result as string);
      reader.readAsDataURL(dosya);
    } else {
      setOnizleme(null);
    }
  }, []);

  const dosyaYukle = async () => {
    if (!secilenDosya) return;
    setYukleniyor(true);
    setHata('');
    setSonDurum(null);
    try {
      const formData = new FormData();
      formData.append('dosya', secilenDosya);
      const r = await belgeService.dosyaYukle(formData);
      setSonDurum(r.data);
      setSecilenDosya(null);
      setOnizleme(null);
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

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setSuruklenenVar(false);
    const dosya = e.dataTransfer.files[0];
    if (dosya) dosyaSec(dosya);
  }, [dosyaSec]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
        🤖 AI Vision ile fiş, fatura veya banka ekstrenizi yükleyin — harcamalar otomatik çıkarılır.
        <br />
        <span className="text-xs text-blue-500">Desteklenen formatlar: {KABUL_FORMATLARI.join(', ')}</span>
      </div>

      {/* Yükleme alanı */}
      <div
        onDragOver={(e) => { e.preventDefault(); setSuruklenenVar(true); }}
        onDragLeave={() => setSuruklenenVar(false)}
        onDrop={onDrop}
        onClick={() => dosyaInputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 transition-colors ${
          suruklenenVar
            ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20'
            : 'border-gray-300 bg-white hover:border-brand-300 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-brand-600'
        }`}
      >
        <input
          ref={dosyaInputRef}
          type="file"
          accept={ACCEPT_MIME}
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) dosyaSec(f); }}
        />
        {onizleme ? (
          <div className="text-center">
            <img src={onizleme} alt="Önizleme" className="mb-3 max-h-40 rounded-xl object-contain" />
            <p className="font-semibold text-brand-600 dark:text-brand-400">{secilenDosya?.name}</p>
          </div>
        ) : secilenDosya ? (
          <div className="text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-900/30">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="font-semibold text-brand-600 dark:text-brand-400">{secilenDosya.name}</p>
            <p className="text-sm text-gray-400">{(secilenDosya.size / 1024).toFixed(1)} KB</p>
          </div>
        ) : (
          <div className="text-center">
            <svg className={`mb-3 h-12 w-12 mx-auto ${suruklenenVar ? 'text-brand-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="font-medium text-gray-700 dark:text-gray-300">Dosyayı sürükle veya tıkla</p>
            <p className="mt-1 text-sm text-gray-400">Fiş, fatura, CSV, Excel, PDF</p>
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
            {yukleniyor ? 'İşleniyor...' : 'Yükle ve Analiz Et'}
          </button>
        </div>
      )}

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
                  {sonDurum.islenenSatir} kayıt işlendi
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
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Tür</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Kayıtlar</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Durum</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Tarih</th>
                </tr>
              </thead>
              <tbody>
                {gecmis.map(g => (
                  <tr key={g.id} className="border-b border-gray-50 dark:border-gray-700/50">
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{g.dosyaAdi}</td>
                    <td className="px-4 py-3 text-gray-500 uppercase">{g.dosyaTuru}</td>
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

export default function BelgeYuklePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Belge Yükle</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          AI ile fiş ve fatura tarama — harcamalar otomatik eklenir
        </p>
      </div>
      <PlanKapisi gerekliPlan="PREMIUM">
        <BelgeYukleIcerigi />
      </PlanKapisi>
    </div>
  );
}
