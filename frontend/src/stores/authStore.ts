import { create } from 'zustand';
import { KullaniciResponse } from '@/types/kullanici.types';

interface AuthState {
  kullanici: KullaniciResponse | null;
  accessToken: string | null;
  refreshToken: string | null;
  girisYap: (accessToken: string, refreshToken: string, kullanici: KullaniciResponse) => void;
  cikisYap: () => void;
  kullaniciGuncelle: (kullanici: KullaniciResponse) => void;
  tokenGuncelle: (accessToken: string) => void;
}

const getKullanici = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem('kullanici');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  kullanici: getKullanici(),
  accessToken: typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null,
  refreshToken: typeof window !== 'undefined' ? sessionStorage.getItem('refreshToken') : null,

  girisYap: (accessToken, refreshToken, kullanici) => {
    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('refreshToken', refreshToken);
    sessionStorage.setItem('kullanici', JSON.stringify(kullanici));
    set({ accessToken, refreshToken, kullanici });
  },

  cikisYap: () => {
    sessionStorage.clear();
    set({ accessToken: null, refreshToken: null, kullanici: null });
  },

  kullaniciGuncelle: (kullanici) => {
    sessionStorage.setItem('kullanici', JSON.stringify(kullanici));
    set({ kullanici });
  },

  tokenGuncelle: (accessToken) => {
    sessionStorage.setItem('accessToken', accessToken);
    set({ accessToken });
  },
}));
