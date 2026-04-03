import { createAuthStore } from '@giderlerim/shared/stores/authStore';
import { mobileStorage } from './storage';

export const useAuthStore = createAuthStore(mobileStorage);

// Hydrate from SecureStore on app launch
async function hydrateAuth() {
  try {
    const [token, refresh, raw] = await Promise.all([
      mobileStorage.getItem('accessToken'),
      mobileStorage.getItem('refreshToken'),
      mobileStorage.getItem('kullanici'),
    ]);
    if (token && raw) {
      const kullanici = JSON.parse(raw);
      useAuthStore.setState({ accessToken: token, refreshToken: refresh, kullanici });
    }
  } catch {
    // ignore hydration errors
  }
}

hydrateAuth();

export { useUyariStore } from '@giderlerim/shared/stores/uyariStore';
