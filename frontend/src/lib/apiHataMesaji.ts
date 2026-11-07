import { isAxiosError } from 'axios';

/** Backend HataResponse/ApiResponse gövdesindeki mesajı, yoksa varsayılanı döndürür. */
export function apiHataMesaji(hata: unknown, varsayilan: string): string {
  if (isAxiosError(hata)) {
    const veri = hata.response?.data as { message?: unknown; alanHatalari?: { mesaj?: string }[] } | undefined;
    if (veri?.alanHatalari?.length) {
      return veri.alanHatalari.map((a) => a.mesaj).filter(Boolean).join(' ');
    }
    if (typeof veri?.message === 'string' && veri.message.trim()) {
      return veri.message;
    }
  }
  return varsayilan;
}
