import apiClient from './apiClient';
import { ApiResponse } from '@/types/api.types';

export interface CsvYuklemeResponse {
  id: number;
  dosyaAdi: string;
  durum: 'ISLENIYOR' | 'TAMAMLANDI' | 'HATA';
  toplamSatir: number;
  islenenSatir: number;
  hataMesaji: string | null;
  createdAt: string;
}

export const csvService = {
  async dosyaYukle(dosya: File): Promise<ApiResponse<CsvYuklemeResponse>> {
    const formData = new FormData();
    formData.append('dosya', dosya);
    const response = await apiClient.post<ApiResponse<CsvYuklemeResponse>>('/csv/yukle', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async durumSorgula(id: number): Promise<ApiResponse<CsvYuklemeResponse>> {
    const response = await apiClient.get<ApiResponse<CsvYuklemeResponse>>(`/csv/${id}/durum`);
    return response.data;
  },

  async gecmis(): Promise<ApiResponse<CsvYuklemeResponse[]>> {
    const response = await apiClient.get<ApiResponse<CsvYuklemeResponse[]>>('/csv/gecmis');
    return response.data;
  },
};
