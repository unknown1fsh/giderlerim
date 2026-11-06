import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

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
  let yenilemeIstegi: Promise<{ accessToken: string; refreshToken: string }> | null = null;

  const client = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
    timeout,
  });

  client.interceptors.request.use(async (reqConfig: InternalAxiosRequestConfig) => {
    const token = await storage.getItem('accessToken');
    if (token && !reqConfig.headers.Authorization) {
      reqConfig.headers.Authorization = `Bearer ${token}`;
    }
    return reqConfig;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const oncekiIstek = error.config as (InternalAxiosRequestConfig & { _giderlerimRetry?: boolean }) | undefined;
      // Giriş/kayıt gibi auth uçlarındaki 401, oturum süresi dolması değil kimlik hatasıdır; yenileme yapılmaz.
      const authIstegi = oncekiIstek?.url?.includes('/auth/') ?? false;
      if (error.response?.status === 401 && oncekiIstek && !oncekiIstek._giderlerimRetry && !authIstegi) {
        oncekiIstek._giderlerimRetry = true;
        const refreshToken = await storage.getItem('refreshToken');
        if (refreshToken) {
          try {
            yenilemeIstegi ??= axios.post(
              `${baseURL}/auth/token-yenile`,
              null,
              { headers: { 'X-Refresh-Token': refreshToken } }
            ).then(async (response) => {
              const { accessToken, refreshToken: yeniRefreshToken } = response.data.data;
              if (!accessToken || !yeniRefreshToken) throw new Error('Token yenileme yanıtı eksik.');
              await Promise.all([
                storage.setItem('accessToken', accessToken),
                storage.setItem('refreshToken', yeniRefreshToken),
              ]);
              return { accessToken, refreshToken: yeniRefreshToken };
            }).finally(() => {
              yenilemeIstegi = null;
            });

            const { accessToken } = await yenilemeIstegi;
            oncekiIstek.headers.Authorization = `Bearer ${accessToken}`;
            return client(oncekiIstek);
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
