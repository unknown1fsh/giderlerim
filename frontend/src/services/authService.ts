import apiClient from './apiClient';
import { ApiResponse } from '@/types/api.types';
import { GirisRequest, KayitRequest, TokenResponse } from '@/types/auth.types';

export const authService = {
  async kayitOl(data: KayitRequest): Promise<ApiResponse<TokenResponse>> {
    const response = await apiClient.post<ApiResponse<TokenResponse>>('/auth/kayit', data);
    return response.data;
  },

  async girisYap(data: GirisRequest): Promise<ApiResponse<TokenResponse>> {
    const response = await apiClient.post<ApiResponse<TokenResponse>>('/auth/giris', data);
    return response.data;
  },

  async tokenYenile(refreshToken: string): Promise<ApiResponse<TokenResponse>> {
    const response = await apiClient.post<ApiResponse<TokenResponse>>(
      '/auth/token-yenile',
      null,
      { headers: { 'X-Refresh-Token': refreshToken } }
    );
    return response.data;
  },
};
