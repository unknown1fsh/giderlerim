'use client';

import { useState, useEffect, useRef } from 'react';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  Send,
  Plus,
  Bot,
  User,
  MessageSquare,
  Trash2,
  Loader2,
} from 'lucide-react';
import { PageContainer } from '@/components/shared/PageContainer';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { PlanYukseltmeBanneri } from '@/components/feature/ai/PlanYukseltmeBanneri';
import { aiSohbetService } from '@/services/aiService';
import { useAuthStore } from '@/stores/authStore';
import { SohbetMesajiResponse, SohbetOturumResponse } from '@/types/ai.types';
import { clsx } from 'clsx';

export default function AiKocPage() {
  const { kullanici } = useAuthStore();
  const [oturumlar, setOturumlar] = useState<SohbetOturumResponse[]>([]);
  const [aktifOturumId, setAktifOturumId] = useState<number | null>(null);
  const [mesajlar, setMesajlar] = useState<SohbetMesajiResponse[]>([]);
  const [yeniMesaj, setYeniMesaj] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [oturumlarYukleniyor, setOturumlarYukleniyor] = useState(true);
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const mesajSonuRef = useRef<HTMLDivElement>(null);

  const isPremiumOrUltra = kullanici?.plan === 'PREMIUM' || kullanici?.plan === 'ULTRA';

  useEffect(() => {
    if (isPremiumOrUltra) {
      loadOturumlar();
    }
  }, [isPremiumOrUltra]);

  useEffect(() => {
    mesajSonuRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mesajlar]);

  const loadOturumlar = async () => {
    setOturumlarYukleniyor(true);
    try {
      const res = await aiSohbetService.getOturumlar();
      setOturumlar(res.data || []);
      if (res.data && res.data.length > 0) {
        selectOturum(res.data[0].id);
      }
    } catch {
      // ignore
    } finally {
      setOturumlarYukleniyor(false);
    }
  };

  const selectOturum = async (oturumId: number) => {
    setAktifOturumId(oturumId);
    setYukleniyor(true);
    try {
      const res = await aiSohbetService.getMesajlar(oturumId);
      setMesajlar(res.data || []);
    } catch {
      setMesajlar([]);
    } finally {
      setYukleniyor(false);
    }
  };

  const yeniOturumBaslat = async () => {
    try {
      const res = await aiSohbetService.yeniOturumBaslat();
      const yeniOturum = res.data;
      setOturumlar([yeniOturum, ...oturumlar]);
      setAktifOturumId(yeniOturum.id);
      setMesajlar([]);
    } catch {
      // ignore
    }
  };

  const oturumKapat = async (oturumId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await aiSohbetService.oturumKapat(oturumId);
      const kalan = oturumlar.filter((o) => o.id !== oturumId);
      setOturumlar(kalan);
      if (aktifOturumId === oturumId) {
        if (kalan.length > 0) {
          selectOturum(kalan[0].id);
        } else {
          setAktifOturumId(null);
          setMesajlar([]);
        }
      }
    } catch {
      // ignore
    }
  };

  const mesajGonder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!yeniMesaj.trim() || !aktifOturumId || gonderiliyor) return;

    const icerik = yeniMesaj.trim();
    setYeniMesaj('');
    setGonderiliyor(true);

    // Optimistic update
    const geciciMesaj: SohbetMesajiResponse = {
      id: Date.now(),
      rol: 'KULLANICI',
      icerik,
      createdAt: new Date().toISOString(),
    };
    setMesajlar((prev) => [...prev, geciciMesaj]);

    try {
      const res = await aiSohbetService.mesajGonder(aktifOturumId, icerik);
      // Replace the last message with the real one and add AI response
      setMesajlar((prev) => {
        const arr = prev.filter((m) => m.id !== geciciMesaj.id);
        return [...arr, res.data];
      });

      // Fetch updated messages to get the AI response
      const allMesajlar = await aiSohbetService.getMesajlar(aktifOturumId);
      setMesajlar(allMesajlar.data || []);
    } catch {
      setMesajlar((prev) => prev.filter((m) => m.id !== geciciMesaj.id));
    } finally {
      setGonderiliyor(false);
    }
  };

  if (!isPremiumOrUltra) {
    return (
      <PageContainer>
        <PageHeader baslik="AI Finans Koçu" altBaslik="Kişiselleştirilmiş finansal rehberlik" />
        <PlanYukseltmeBanneri
          ozellik="AI Finans Koçu"
          aciklama="Yapay zeka destekli finansal koçunuzla sohbet edin. Harcamalarınızı analiz edin, bütçe tavsiyeleri alın ve tasarruf fırsatları keşfedin."
          gerekliPlan="PREMIUM"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-0 px-0 max-w-full">
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sessions Sidebar */}
        <div className="hidden md:flex w-64 flex-shrink-0 flex-col border-r border-border bg-bg-primary">
          <div className="flex items-center justify-between px-4 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-text-primary">Sohbetler</h2>
            <button
              onClick={yeniOturumBaslat}
              className="rounded-lg p-1.5 text-text-muted hover:bg-bg-secondary hover:text-accent transition-colors"
              title="Yeni sohbet"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            {oturumlarYukleniyor ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-text-muted" />
              </div>
            ) : oturumlar.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <MessageSquare className="h-8 w-8 text-text-muted mx-auto mb-2" />
                <p className="text-xs text-text-muted">Henüz sohbet yok</p>
                <button
                  onClick={yeniOturumBaslat}
                  className="mt-2 text-xs text-accent hover:text-accent-light"
                >
                  Yeni sohbet başlat
                </button>
              </div>
            ) : (
              oturumlar.map((oturum) => (
                <button
                  key={oturum.id}
                  onClick={() => selectOturum(oturum.id)}
                  className={clsx(
                    'group flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-bg-secondary',
                    aktifOturumId === oturum.id && 'bg-bg-secondary border-l-2 border-accent'
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-text-primary">
                      {oturum.baslik || `Sohbet ${oturum.id}`}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {(() => {
                        try {
                          return format(parseISO(oturum.updatedAt), 'd MMM', { locale: tr });
                        } catch {
                          return '';
                        }
                      })()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => oturumKapat(oturum.id, e)}
                    className="ml-2 hidden rounded p-1 text-text-muted hover:text-danger group-hover:block"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b border-border bg-bg-primary px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/20">
                <Bot className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">AI Finans Koçu</p>
                <p className="text-xs text-success">Çevrimiçi</p>
              </div>
            </div>
            <button
              onClick={yeniOturumBaslat}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted hover:bg-bg-secondary hover:text-text-primary transition-colors md:hidden"
            >
              <Plus className="h-3 w-3" />
              Yeni Sohbet
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6">
            {yukleniyor ? (
              <LoadingState mesaj="Mesajlar yükleniyor..." />
            ) : aktifOturumId === null ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="rounded-full bg-accent/10 p-6 mb-4">
                  <Bot className="h-12 w-12 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  AI Finans Koçunuz Burada
                </h3>
                <p className="text-sm text-text-muted max-w-sm mb-4">
                  Harcamalarınız hakkında sorular sorun, bütçe tavsiyesi alın, tasarruf
                  fırsatlarını öğrenin.
                </p>
                <button
                  onClick={yeniOturumBaslat}
                  className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover"
                >
                  <Plus className="h-4 w-4" />
                  Sohbet Başlat
                </button>
              </div>
            ) : mesajlar.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Bot className="h-10 w-10 text-text-muted mb-3" />
                <p className="text-sm text-text-muted">
                  Merhaba! Size nasıl yardımcı olabilirim?
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {[
                    'Bu ay ne kadar harcadım?',
                    'Tasarruf önerilerin var mı?',
                    'Bütçemi nasıl optimize edebilirim?',
                  ].map((soru) => (
                    <button
                      key={soru}
                      onClick={() => setYeniMesaj(soru)}
                      className="rounded-lg border border-accent/30 bg-accent/5 px-3 py-1.5 text-xs text-accent hover:bg-accent/10 transition-colors"
                    >
                      {soru}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-w-3xl mx-auto">
                {mesajlar.map((mesaj) => (
                  <div
                    key={mesaj.id}
                    className={clsx(
                      'flex gap-3',
                      mesaj.rol === 'KULLANICI' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {mesaj.rol === 'ASISTAN' && (
                      <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-accent/20">
                        <Bot className="h-4 w-4 text-accent" />
                      </div>
                    )}
                    <div
                      className={clsx(
                        'max-w-[75%] rounded-2xl px-4 py-3 text-sm',
                        mesaj.rol === 'KULLANICI'
                          ? 'bg-accent text-white rounded-br-sm'
                          : 'bg-bg-primary border border-border text-text-primary rounded-bl-sm'
                      )}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{mesaj.icerik}</p>
                      <p className={clsx('mt-1 text-xs', mesaj.rol === 'KULLANICI' ? 'text-white/60' : 'text-text-disabled')}>
                        {(() => {
                          try {
                            return format(parseISO(mesaj.createdAt), 'HH:mm', { locale: tr });
                          } catch {
                            return '';
                          }
                        })()}
                      </p>
                    </div>
                    {mesaj.rol === 'KULLANICI' && (
                      <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-bg-secondary border border-border">
                        <User className="h-4 w-4 text-text-muted" />
                      </div>
                    )}
                  </div>
                ))}

                {gonderiliyor && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-accent/20">
                      <Bot className="h-4 w-4 text-accent" />
                    </div>
                    <div className="bg-bg-secondary border border-border rounded-2xl rounded-bl-sm px-4 py-3">
                      <div className="flex gap-1 items-center">
                        <div className="h-2 w-2 rounded-full bg-accent animate-bounce [animation-delay:-0.3s]" />
                        <div className="h-2 w-2 rounded-full bg-accent animate-bounce [animation-delay:-0.15s]" />
                        <div className="h-2 w-2 rounded-full bg-accent animate-bounce" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={mesajSonuRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          {aktifOturumId !== null && (
            <div className="border-t border-border bg-bg-primary px-4 py-4 md:px-6">
              <form onSubmit={mesajGonder} className="flex gap-3 max-w-3xl mx-auto">
                <input
                  type="text"
                  value={yeniMesaj}
                  onChange={(e) => setYeniMesaj(e.target.value)}
                  placeholder="Bir soru sorun veya yardım isteyin..."
                  disabled={gonderiliyor}
                  className="flex-1 rounded-xl border border-border bg-bg-secondary/50 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 disabled:opacity-60 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!yeniMesaj.trim() || gonderiliyor}
                  className="flex items-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {gonderiliyor ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
