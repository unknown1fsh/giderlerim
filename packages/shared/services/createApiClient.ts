import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

export interface StorageAdapter {
  getItem(key: string): string | null | Promise<string | null>;
  setItem(key: string, value: string): void | Promise<void>;
  removeItem(key: string): void | Promise<void>;
  clear(): void | Promise<void>;
}

export interface NavigationAdapter {
  navigateToLogin(): void;
}

export interface ApiClientConfig {
  baseURL: string;
  storage: StorageAdapter;
  navigation: NavigationAdapter;
  timeout?: number;
}

export function createApiClient(config: ApiClientConfig): AxiosInstance {
  const { baseURL, storage, navigation, timeout = 30000 } = config;

  const client = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
    timeout,
  });

  client.interceptors.request.use(async (reqConfig: InternalAxiosRequestConfig) => {
    const token = await storage.getItem('accessToken');
    if (token) {
      reqConfig.headers.Authorization = `Bearer ${token}`;
    }
    return reqConfig;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (error.response?.status === 401) {
        const refreshToken = await storage.getItem('refreshToken');
        if (refreshToken) {
          try {
            const response = await axios.post(
              `${baseURL}/auth/token-yenile`,
              null,
              { headers: { 'X-Refresh-Token': refreshToken } }
            );
            const { accessToken } = response.data.data;
            await storage.setItem('accessToken', accessToken);
            if (error.config) {
              error.config.headers.Authorization = `Bearer ${accessToken}`;
              return client(error.config);
            }
          } catch {
            await storage.clear();
            navigation.navigateToLogin();
          }
        } else {
          await storage.clear();
          navigation.navigateToLogin();
        }
      }
      return Promise.reject(error);
    }
  );

  return client;
}
