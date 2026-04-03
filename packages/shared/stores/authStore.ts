import { create } from 'zustand';
import { KullaniciResponse } from '../types/kullanici.types';
import { StorageAdapter } from '../services/createApiClient';

interface AuthState {
  kullanici: KullaniciResponse | null;
  accessToken: string | null;
  refreshToken: string | null;
  girisYap: (accessToken: string, refreshToken: string, kullanici: KullaniciResponse) => void;
  cikisYap: () => void;
  kullaniciGuncelle: (kullanici: KullaniciResponse) => void;
  tokenGuncelle: (accessToken: string) => void;
}

export function createAuthStore(storage: StorageAdapter) {
  return create<AuthState>((set) => ({
    kullanici: null,
    accessToken: null,
    refreshToken: null,

    girisYap: (accessToken, refreshToken, kullanici) => {
      storage.setItem('accessToken', accessToken);
      storage.setItem('refreshToken', refreshToken);
      storage.setItem('kullanici', JSON.stringify(kullanici));
      set({ accessToken, refreshToken, kullanici });
    },

    cikisYap: () => {
      storage.clear();
      set({ accessToken: null, refreshToken: null, kullanici: null });
    },

    kullaniciGuncelle: (kullanici) => {
      storage.setItem('kullanici', JSON.stringify(kullanici));
      set({ kullanici });
    },

    tokenGuncelle: (accessToken) => {
      storage.setItem('accessToken', accessToken);
      set({ accessToken });
    },
  }));
}

export type AuthStore = ReturnType<typeof createAuthStore>;
export type { AuthState };
