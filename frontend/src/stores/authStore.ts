import { createAuthStore } from '@giderlerim/shared/stores/authStore';
import { webStorage } from '@/services/apiClient';

export const useAuthStore = createAuthStore(webStorage);

// Hydrate initial state from sessionStorage on web
if (typeof window !== 'undefined') {
  const token = sessionStorage.getItem('accessToken');
  const refresh = sessionStorage.getItem('refreshToken');
  const raw = sessionStorage.getItem('kullanici');
  if (token && raw) {
    try {
      const kullanici = JSON.parse(raw);
      useAuthStore.setState({ accessToken: token, refreshToken: refresh, kullanici });
    } catch {
      // ignore parse errors
    }
  }
}
