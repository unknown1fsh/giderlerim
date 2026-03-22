import { create } from 'zustand';

interface UIState {
  sidebarAcik: boolean;
  tema: 'light' | 'dark';
  sidebarToggle: () => void;
  sidebarKapat: () => void;
  temaDegistir: () => void;
}

const getStoredTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return (localStorage.getItem('tema') as 'light' | 'dark') || 'light';
};

export const useUIStore = create<UIState>((set) => ({
  sidebarAcik: true,
  tema: getStoredTheme(),
  sidebarToggle: () => set((s) => ({ sidebarAcik: !s.sidebarAcik })),
  sidebarKapat: () => set({ sidebarAcik: false }),
  temaDegistir: () =>
    set((s) => {
      const yeni = s.tema === 'light' ? 'dark' : 'light';
      localStorage.setItem('tema', yeni);
      document.documentElement.classList.toggle('dark', yeni === 'dark');
      return { tema: yeni };
    }),
}));
