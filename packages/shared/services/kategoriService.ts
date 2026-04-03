import { AxiosInstance } from 'axios';
import { ApiResponse } from '../types/api.types';
import { KategoriOlusturRequest, KategoriResponse } from '../types/kategori.types';

export function createKategoriService(client: AxiosInstance) {
  return {
    async listele(): Promise<ApiResponse<KategoriResponse[]>> {
      const response = await client.get<ApiResponse<KategoriResponse[]>>('/kategoriler');
      return response.data;
    },

    async olustur(data: KategoriOlusturRequest): Promise<ApiResponse<KategoriResponse>> {
      const response = await client.post<ApiResponse<KategoriResponse>>('/kategoriler', data);
      return response.data;
    },

    async guncelle(id: number, data: KategoriOlusturRequest): Promise<ApiResponse<KategoriResponse>> {
      const response = await client.put<ApiResponse<KategoriResponse>>(`/kategoriler/${id}`, data);
      return response.data;
    },

    async sil(id: number): Promise<void> {
      await client.delete(`/kategoriler/${id}`);
    },
  };
}

export type KategoriService = ReturnType<typeof createKategoriService>;
