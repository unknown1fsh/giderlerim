'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { adminService } from '@/services/adminService';
import type { ShopierSiparisDto, SiparisDurumu } from '@giderlerim/shared/types/admin.types';

const DURUM_ETIKET: Record<SiparisDurumu, { ad: string; renk: string }> = {
  ISLENDI: { ad: 'İşlendi', renk: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  KULLANICI_BULUNAMADI: { ad: 'Kullanıcı bulunamadı', renk: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  TUTAR_UYUSMUYOR: { ad: 'Tutar uyuşmuyor', renk: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
  URUN_TANIMSIZ: { ad: 'Ürün tanımsız', renk: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' },
  ODENMEDI: { ad: 'Ödenmedi', renk: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' },
  IADE_EDILDI: { ad: 'İade edildi', renk: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  KISMI_IADE: { ad: 'Kısmi iade', renk: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
};

const ATANABILIR: SiparisDurumu[] = ['KULLANICI_BULUNAMADI', 'TUTAR_UYUSMUYOR'];

const PLAN_AD: Record<string, string> = { PREMIUM: 'Pro', ULTRA: 'Ultra' };
const DONEM_AD: Record<string, string> = { AYLIK: 'Aylık', YILLIK: 'Yıllık' };

function tutarYaz(s: ShopierSiparisDto): string {
  if (s.tutar == null) return '—';
  return s.tutar.toLocaleString('tr-TR', { style: 'currency', currency: s.paraBirimi || 'TRY' });
}

export default function AdminOdemelerPage() {
  const queryClient = useQueryClient();
  const [filtreDurum, setFiltreDurum] = useState<SiparisDurumu | ''>('');
  const [sayfa, setSayfa] = useState(0);
  const [atanacak, setAtanacak] = useState<ShopierSiparisDto | null>(null);
  const [kullaniciId, setKullaniciId] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'odemeler', filtreDurum, sayfa],
    queryFn: () => adminService.odemeleriGetir({ durum: filtreDurum || undefined, sayfa, boyut: 20 }),
  });

  const atamaMutation = useMutation({
    mutationFn: ({ siparisId, id }: { siparisId: number; id: number }) =>
      adminService.odemeyiKullaniciyaAta(siparisId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'odemeler'] });
      setAtanacak(null);
      setKullaniciId('');
    },
  });

  const siparisler = data?.icerik ?? [];
  const gecerliKullaniciId = /^\d+$/.test(kullaniciId.trim());

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Ödemeler</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Shopier siparişleri ve otomatik plan ataması sonuçları
          </p>
        </div>
        <Link href="/admin" className="text-sm text-brand-500 hover:underline">
          ← Admin paneli
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={filtreDurum}
          onChange={(e) => {
            setFiltreDurum(e.target.value as SiparisDurumu | '');
            setSayfa(0);
          }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          aria-label="Durum filtresi"
        >
          <option value="">Tüm durumlar</option>
          {(Object.keys(DURUM_ETIKET) as SiparisDurumu[]).map((d) => (
            <option key={d} value={d}>
              {DURUM_ETIKET[d].ad}
            </option>
          ))}
        </select>
      </div>

      {isLoading && (
        <div className="flex min-h-[200px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500" />
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          Ödemeler yüklenemedi. Lütfen sayfayı yenileyin.
        </div>
      )}

      {!isLoading && !isError && siparisler.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
          Henüz kayıtlı ödeme yok.
        </div>
      )}

      {siparisler.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500 dark:bg-gray-900 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">Tarih</th>
                <th className="px-4 py-3">Sipariş</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Tutar</th>
                <th className="px-4 py-3">Alıcı e-postası</th>
                <th className="px-4 py-3">Kullanıcı</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {siparisler.map((s) => (
                <tr key={s.id} className="text-gray-700 dark:text-gray-300">
                  <td className="whitespace-nowrap px-4 py-3">{format(new Date(s.createdAt), 'dd.MM.yyyy HH:mm')}</td>
                  <td className="px-4 py-3 font-mono text-xs">{s.shopierSiparisId}</td>
                  <td className="px-4 py-3">
                    {s.plan ? `${PLAN_AD[s.plan]} · ${s.donem ? DONEM_AD[s.donem] : ''}` : s.urunId ?? '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{tutarYaz(s)}</td>
                  <td className="px-4 py-3">{s.aliciEmail ?? '—'}</td>
                  <td className="px-4 py-3">{s.kullaniciEmail ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${DURUM_ETIKET[s.durum].renk}`}>
                      {DURUM_ETIKET[s.durum].ad}
                    </span>
                    {s.aciklama && <p className="mt-1 max-w-xs text-xs text-gray-500 dark:text-gray-400">{s.aciklama}</p>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {ATANABILIR.includes(s.durum) && s.plan && (
                      <button
                        type="button"
                        onClick={() => setAtanacak(s)}
                        className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600"
                      >
                        Kullanıcıya ata
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.toplamSayfa > 1 && (
        <div className="flex items-center justify-end gap-2 text-sm">
          <button
            type="button"
            disabled={sayfa === 0}
            onClick={() => setSayfa((p) => p - 1)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-gray-700"
          >
            Önceki
          </button>
          <span className="text-gray-500">
            {sayfa + 1} / {data.toplamSayfa}
          </span>
          <button
            type="button"
            disabled={data.sonSayfa}
            onClick={() => setSayfa((p) => p + 1)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-gray-700"
          >
            Sonraki
          </button>
        </div>
      )}

      {atanacak && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Ödemeyi kullanıcıya ata</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Sipariş <span className="font-mono">{atanacak.shopierSiparisId}</span> ({atanacak.aliciEmail ?? 'e-posta yok'}).
              Kullanıcının ID&apos;sini Kullanıcılar sayfasından bulabilirsiniz. Atama aboneliği hemen başlatır.
            </p>
            <label className="mt-4 block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="kullanici-id">
              Kullanıcı ID
            </label>
            <input
              id="kullanici-id"
              value={kullaniciId}
              onChange={(e) => setKullaniciId(e.target.value)}
              inputMode="numeric"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            />
            {atamaMutation.isError && (
              <p className="mt-2 text-sm text-red-600">Atama yapılamadı. Kullanıcı ID&apos;sini kontrol edin.</p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setAtanacak(null);
                  setKullaniciId('');
                  atamaMutation.reset();
                }}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm dark:border-gray-700 dark:text-gray-300"
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={!gecerliKullaniciId || atamaMutation.isPending}
                onClick={() => atamaMutation.mutate({ siparisId: atanacak.id, id: Number(kullaniciId.trim()) })}
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
              >
                {atamaMutation.isPending ? 'Atanıyor…' : 'Ata'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
