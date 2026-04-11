import { createApiClient } from '@giderlerim/shared/services/createApiClient';
import { createServices } from '@giderlerim/shared/services/index';
import { mobileStorage } from './storage';
import { router } from 'expo-router';
import { API_BASE_URL } from './apiBaseUrl';

const mobileNavigation = {
  navigateToLogin: () => {
    router.replace('/(auth)/giris');
  },
};

const apiClient = createApiClient({
  baseURL: API_BASE_URL,
  storage: mobileStorage,
  navigation: mobileNavigation,
});

export { API_BASE_URL };
export const services = createServices(apiClient);
export default apiClient;
