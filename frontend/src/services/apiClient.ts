import { createApiClient, StorageAdapter, NavigationAdapter } from '@giderlerim/shared/services/createApiClient';
import { createServices } from '@giderlerim/shared/services/index';

const webStorage: StorageAdapter = {
  getItem: (key) => (typeof window !== 'undefined' ? sessionStorage.getItem(key) : null),
  setItem: (key, value) => { if (typeof window !== 'undefined') sessionStorage.setItem(key, value); },
  removeItem: (key) => { if (typeof window !== 'undefined') sessionStorage.removeItem(key); },
  clear: () => { if (typeof window !== 'undefined') sessionStorage.clear(); },
};

const webNavigation: NavigationAdapter = {
  navigateToLogin: () => { if (typeof window !== 'undefined') window.location.href = '/signin'; },
};

const apiClient = createApiClient({
  baseURL: (process.env.NEXT_PUBLIC_API_URL || '') + '/api/v1',
  storage: webStorage,
  navigation: webNavigation,
});

export const services = createServices(apiClient);

export const giderService = services.gider;
export const authService = services.auth;
export const dashboardService = services.dashboard;
export const butceService = services.butce;
export const kategoriService = services.kategori;
export const uyariService = services.uyari;
export const aiAnalizService = services.aiAnaliz;
export const aiSohbetService = services.aiSohbet;
export const belgeService = services.belge;
export const csvService = services.csv;
export const destekService = services.destek;
export const adminService = services.admin;

export { webStorage };
export default apiClient;
