import { createApiClient } from '@giderlerim/shared/services/createApiClient';
import { createServices } from '@giderlerim/shared/services/index';
import { mobileStorage } from './storage';
import { router } from 'expo-router';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8081/api/v1';

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

export const services = createServices(apiClient);
export default apiClient;
