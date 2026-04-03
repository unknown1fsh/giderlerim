import { AxiosInstance } from 'axios';
import { ApiResponse, SayfaliResponse } from '../types/api.types';
import { UyariResponse } from '../types/uyari.types';

export function createUyariService(client: AxiosInstance) {
  return {
    async listele(): Promise<ApiResponse<SayfaliResponse<UyariResponse>>> {
      const response = await client.get<ApiResponse<SayfaliResponse<UyariResponse>>>('/uyarilar');
      return response.data;
    },

    async sayac(): Promise<ApiResponse<number>> {
      const response = await client.get<ApiResponse<number>>('/uyarilar/sayac');
      return response.data;
    },

    async okunduIsaretle(id: number): Promise<void> {
      await client.put(`/uyarilar/${id}/okundu`);
    },

    async tumunuOkunduIsaretle(): Promise<void> {
      await client.put('/uyarilar/tumu-okundu');
    },

    async sil(id: number): Promise<void> {
      await client.delete(`/uyarilar/${id}`);
    },
  };
}

export type UyariService = ReturnType<typeof createUyariService>;
