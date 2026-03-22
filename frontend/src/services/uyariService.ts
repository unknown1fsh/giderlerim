import apiClient from './apiClient';
import { ApiResponse, SayfaliResponse } from '@/types/api.types';
import { UyariResponse } from '@/types/uyari.types';

export const uyariService = {
  async listele(): Promise<ApiResponse<SayfaliResponse<UyariResponse>>> {
    const response = await apiClient.get<ApiResponse<SayfaliResponse<UyariResponse>>>('/uyarilar');
    return response.data;
  },

  async sayac(): Promise<ApiResponse<number>> {
    const response = await apiClient.get<ApiResponse<number>>('/uyarilar/sayac');
    return response.data;
  },

  async okunduIsaretle(id: number): Promise<void> {
    await apiClient.put(`/uyarilar/${id}/okundu`);
  },

  async tumunuOkunduIsaretle(): Promise<void> {
    await apiClient.put('/uyarilar/tumu-okundu');
  },

  async sil(id: number): Promise<void> {
    await apiClient.delete(`/uyarilar/${id}`);
  },
};
