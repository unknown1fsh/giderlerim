import apiClient from './apiClient';
import { ApiResponse } from '@/types/api.types';

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

export const belgeService = {
  async dosyaYukle(dosya: File): Promise<ApiResponse<BelgeYuklemeResponse>> {
    const formData = new FormData();
    formData.append('dosya', dosya);
    const response = await apiClient.post<ApiResponse<BelgeYuklemeResponse>>('/belge/yukle', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async durumSorgula(id: number): Promise<ApiResponse<BelgeYuklemeResponse>> {
    const response = await apiClient.get<ApiResponse<BelgeYuklemeResponse>>(`/belge/${id}/durum`);
    return response.data;
  },

  async gecmis(): Promise<ApiResponse<BelgeYuklemeResponse[]>> {
    const response = await apiClient.get<ApiResponse<BelgeYuklemeResponse[]>>('/belge/gecmis');
    return response.data;
  },
};
