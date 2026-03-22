import apiClient from './apiClient';
import { ApiResponse, SayfaliResponse } from '@/types/api.types';
import { GiderFiltre, GiderOlusturRequest, GiderResponse } from '@/types/gider.types';

export const giderService = {
  async listele(filtre: GiderFiltre = {}): Promise<ApiResponse<SayfaliResponse<GiderResponse>>> {
    const response = await apiClient.get<ApiResponse<SayfaliResponse<GiderResponse>>>('/giderler', { params: filtre });
    return response.data;
  },

  async getById(id: number): Promise<ApiResponse<GiderResponse>> {
    const response = await apiClient.get<ApiResponse<GiderResponse>>(`/giderler/${id}`);
    return response.data;
  },

  async olustur(data: GiderOlusturRequest): Promise<ApiResponse<GiderResponse>> {
    const response = await apiClient.post<ApiResponse<GiderResponse>>('/giderler', data);
    return response.data;
  },

  async guncelle(id: number, data: Partial<GiderOlusturRequest>): Promise<ApiResponse<GiderResponse>> {
    const response = await apiClient.put<ApiResponse<GiderResponse>>(`/giderler/${id}`, data);
    return response.data;
  },

  async sil(id: number): Promise<void> {
    await apiClient.delete(`/giderler/${id}`);
  },
};
