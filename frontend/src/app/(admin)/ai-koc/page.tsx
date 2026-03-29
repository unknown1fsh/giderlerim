'use client';

import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { aiSohbetService } from '@/services/aiService';
import { SohbetOturumResponse, SohbetMesajiResponse } from '@/types/ai.types';
import PlanKapisi from '@/components/shared/PlanKapisi';

function ChatIcerigi() {
  const [oturumlar, setOturumlar] = useState<SohbetOturumResponse[]>([]);
  const [aktifOturumId, setAktifOturumId] = useState<number | null>(null);
  const [mesajlar, setMesajlar] = useState<SohbetMesajiResponse[]>([]);
  const [mesajMetni, setMesajMetni] = useState('');
  const [gonderiminYukleniyor, setGonderimYukleniyor] = useState(false);
  const [oturumYukleniyor, setOturumYukleniyor] = useState(false);
  const [hata, setHata] = useState('');
  const mesajSonuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    oturumlariYukle();
  }, []);

  useEffect(() => {
    mesajSonuRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mesajlar]);

  const oturumlariYukle = async () => {
    try {
      const r = await aiSohbetService.getOturumlar();
      setOturumlar(r.data);
    } catch {
      setHata('Oturumlar yüklenemedi.');
    }
  };

  const oturumSec = async (id: number) => {
    setAktifOturumId(id);
    setOturumYukleniyor(true);
    try {
      const r = await aiSohbetService.getMesajlar(id);
      setMesajlar(r.data);
    } catch {
      setHata('Mesajlar yüklenemedi.');
    } finally {
      setOturumYukleniyor(false);
    }
  };

  const yeniOturumBaslat = async () => {
    try {
      const r = await aiSohbetService.yeniOturumBaslat();
      const yeni = r.data;
      setOturumlar(prev => [yeni, ...prev]);
      setAktifOturumId(yeni.id);
      setMesajlar([]);
    } catch {
      setHata('Yeni oturum başlatılamadı.');
    }
  };

  const mesajGonder = async () => {
    if (!mesajMetni.trim() || !aktifOturumId) return;
    const icerik = mesajMetni.trim();
    setMesajMetni('');
    setGonderimYukleniyor(true);
    setHata('');

    const geciciKullanici: SohbetMesajiResponse = {
      id: Date.now(),
      rol: 'KULLANICI',
      icerik,
      createdAt: new Date().toISOString(),
    };
    setMesajlar(prev => [...prev, geciciKullanici]);

    try {
      const r = await aiSohbetService.mesajGonder(aktifOturumId, icerik);
      setMesajlar(prev => [...prev, r.data]);
    } catch {
      setHata('Mesaj gönderilemedi.');
      setMesajlar(prev => prev.filter(m => m.id !== geciciKullanici.id));
    } finally {
      setGonderimYukleniyor(false);
    }
  };

  const oturumKapat = async (id: number) => {
    try {
      await aiSohbetService.oturumKapat(id);
      setOturumlar(prev => prev.map(o => o.id === id ? { ...o, aktif: false } : o));
      if (aktifOturumId === id) {
        setAktifOturumId(null);
        setMesajlar([]);
      }
    } catch {
      setHata('Oturum kapatılamadı.');
    }
  };

  return (
    <div className="flex h-[calc(100vh-200px)] gap-4">
      {/* Sol panel — Oturumlar */}
      <div className="flex w-64 flex-shrink-0 flex-col rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-100 p-4 dark:border-gray-700">
          <button
            onClick={yeniOturumBaslat}
            className="w-full rounded-xl bg-brand-500 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
          >
            + Yeni Sohbet
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {oturumlar.length === 0 ? (
            <p className="p-3 text-center text-xs text-gray-400">Henüz sohbet yok</p>
          ) : (
            oturumlar.map(o => (
              <div
                key={o.id}
                className={`group flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer transition-colors ${
                  aktifOturumId === o.id
                    ? 'bg-brand-50 dark:bg-brand-900/30'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
                onClick={() => oturumSec(o.id)}
              >
                <div className="min-w-0">
                  <p className={`truncate text-sm font-medium ${aktifOturumId === o.id ? 'text-brand-600 dark:text-brand-400' : 'text-gray-700 dark:text-gray-300'}`}>
                    {o.baslik || `Sohbet #${o.id}`}
                  </p>
                  <p className="text-xs text-gray-400">{format(new Date(o.createdAt), 'dd.MM.yyyy')}</p>
                </div>
                {o.aktif && (
                  <button
                    onClick={(e) => { e.stopPropagation(); oturumKapat(o.id); }}
                    title="Kapat"
                    className="ml-2 hidden flex-shrink-0 rounded p-1 text-gray-300 hover:text-red-400 group-hover:block"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sağ panel — Chat */}
      <div className="flex flex-1 flex-col rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        {!aktifOturumId ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center p-8">
            <div className="mb-4 text-5xl">🤖</div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">AI Finansal Koç</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Harcamalarınız, bütçeleriniz veya finansal hedefleriniz hakkında soru sorun.
            </p>
            <button onClick={yeniOturumBaslat}
              className="mt-4 rounded-xl bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors">
              Sohbet Başlat
            </button>
          </div>
        ) : (
          <>
            {/* Mesaj listesi */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {oturumYukleniyor ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500" />
                </div>
              ) : mesajlar.length === 0 ? (
                <p className="text-center text-sm text-gray-400">Mesaj yok. Soru sormaya başlayın.</p>
              ) : (
                mesajlar.map(m => (
                  <div key={m.id} className={`flex ${m.rol === 'KULLANICI' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
                      m.rol === 'KULLANICI'
                        ? 'bg-brand-500 text-white'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {m.rol === 'KULLANICI' ? (
                        <p className="whitespace-pre-wrap">{m.icerik}</p>
                      ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-li:my-0 prose-headings:my-2">
                          <ReactMarkdown>{m.icerik}</ReactMarkdown>
                        </div>
                      )}
                      <p className={`mt-1 text-xs ${m.rol === 'KULLANICI' ? 'text-brand-200' : 'text-gray-400'}`}>
                        {format(new Date(m.createdAt), 'HH:mm')}
                      </p>
                    </div>
                  </div>
                ))
              )}
              {gonderiminYukleniyor && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-gray-100 px-4 py-3 dark:bg-gray-700">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0ms' }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '150ms' }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={mesajSonuRef} />
            </div>

            {hata && (
              <div className="mx-4 mb-2 rounded-lg bg-red-50 p-2 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">{hata}</div>
            )}

            {/* Input */}
            <div className="border-t border-gray-100 p-4 dark:border-gray-700">
              <div className="flex gap-3">
                <textarea
                  value={mesajMetni}
                  onChange={(e) => setMesajMetni(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      mesajGonder();
                    }
                  }}
                  placeholder="Bir soru sorun... (Enter ile gönder)"
                  rows={2}
                  className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={mesajGonder}
                  disabled={!mesajMetni.trim() || gonderiminYukleniyor}
                  className="flex-shrink-0 rounded-xl bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 disabled:opacity-60 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function AiKocPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">AI Finansal Koç</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Kişisel finans danışmanınızla sohbet edin
        </p>
      </div>
      <PlanKapisi gerekliPlan="PREMIUM">
        <ChatIcerigi />
      </PlanKapisi>
    </div>
  );
}
