import { AxiosInstance } from 'axios';
import { ApiResponse } from '../types/api.types';
import { GirisRequest, KayitRequest, TokenResponse } from '../types/auth.types';
import { KullaniciResponse } from '../types/kullanici.types';

export function createAuthService(client: AxiosInstance) {
  return {
    async kayitOl(data: KayitRequest): Promise<ApiResponse<TokenResponse>> {
      const response = await client.post<ApiResponse<TokenResponse>>('/auth/kayit', data);
      return response.data;
    },

    async girisYap(data: GirisRequest): Promise<ApiResponse<TokenResponse>> {
      const response = await client.post<ApiResponse<TokenResponse>>('/auth/giris', data);
      return response.data;
    },

    async tokenYenile(refreshToken: string): Promise<ApiResponse<TokenResponse>> {
      const response = await client.post<ApiResponse<TokenResponse>>(
        '/auth/token-yenile',
        null,
        { headers: { 'X-Refresh-Token': refreshToken } }
      );
      return response.data;
    },

    async beniBul(): Promise<ApiResponse<KullaniciResponse>> {
      const response = await client.get<ApiResponse<KullaniciResponse>>('/kullanici/profil');
      return response.data;
    },
  };
}

export type AuthService = ReturnType<typeof createAuthService>;
