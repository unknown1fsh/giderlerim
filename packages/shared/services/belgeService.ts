import { AxiosInstance } from 'axios';
import { ApiResponse } from '../types/api.types';

export interface BelgeYuklemeResponse {
  id: number;
  dosyaAdi: string;
  dosyaTuru: string;
  durum: 'ISLENIYOR' | 'TAMAMLANDI' | 'HATA';
  toplamSatir: number;
  islenenSatir: number;
  hataMesaji: string | null;
  createdAt: string;
}

export function createBelgeService(client: AxiosInstance) {
  return {
    async dosyaYukle(formData: FormData): Promise<ApiResponse<BelgeYuklemeResponse>> {
      const response = await client.post<ApiResponse<BelgeYuklemeResponse>>('/belge/yukle', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },

    async durumSorgula(id: number): Promise<ApiResponse<BelgeYuklemeResponse>> {
      const response = await client.get<ApiResponse<BelgeYuklemeResponse>>(`/belge/${id}/durum`);
      return response.data;
    },

    async gecmis(): Promise<ApiResponse<BelgeYuklemeResponse[]>> {
      const response = await client.get<ApiResponse<BelgeYuklemeResponse[]>>('/belge/gecmis');
      return response.data;
    },
  };
}

export type BelgeService = ReturnType<typeof createBelgeService>;
