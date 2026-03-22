import apiClient from './apiClient';
import { ApiResponse } from '@/types/api.types';
import { KategoriOlusturRequest, KategoriResponse } from '@/types/kategori.types';

export const kategoriService = {
  async listele(): Promise<ApiResponse<KategoriResponse[]>> {
    const response = await apiClient.get<ApiResponse<KategoriResponse[]>>('/kategoriler');
    return response.data;
  },

  async olustur(data: KategoriOlusturRequest): Promise<ApiResponse<KategoriResponse>> {
    const response = await apiClient.post<ApiResponse<KategoriResponse>>('/kategoriler', data);
    return response.data;
  },

  async guncelle(id: number, data: KategoriOlusturRequest): Promise<ApiResponse<KategoriResponse>> {
    const response = await apiClient.put<ApiResponse<KategoriResponse>>(`/kategoriler/${id}`, data);
    return response.data;
  },

  async sil(id: number): Promise<void> {
    await apiClient.delete(`/kategoriler/${id}`);
  },
};
