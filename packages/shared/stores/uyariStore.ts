import { create } from 'zustand';

interface UyariState {
  okunmamisSayisi: number;
  setSayisi: (sayisi: number) => void;
  azalt: () => void;
  sifirla: () => void;
}

export const useUyariStore = create<UyariState>((set) => ({
  okunmamisSayisi: 0,
  setSayisi: (sayisi) => set({ okunmamisSayisi: sayisi }),
  azalt: () => set((state) => ({ okunmamisSayisi: Math.max(0, state.okunmamisSayisi - 1) })),
  sifirla: () => set({ okunmamisSayisi: 0 }),
}));

export type { UyariState };
