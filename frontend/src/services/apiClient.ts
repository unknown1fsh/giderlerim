import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      const refreshToken = typeof window !== 'undefined' ? sessionStorage.getItem('refreshToken') : null;
      if (refreshToken) {
        try {
          const response = await axios.post(
            process.env.NEXT_PUBLIC_API_URL + '/api/v1/auth/token-yenile',
            null,
            { headers: { 'X-Refresh-Token': refreshToken } }
          );
          const { accessToken } = response.data.data;
          sessionStorage.setItem('accessToken', accessToken);
          if (error.config) {
            error.config.headers.Authorization = `Bearer ${accessToken}`;
            return apiClient(error.config);
          }
        } catch {
          sessionStorage.clear();
          window.location.href = '/signin';
        }
      } else {
        sessionStorage.clear();
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
