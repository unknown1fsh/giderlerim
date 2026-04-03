import { AxiosInstance } from 'axios';
import { ApiResponse } from '../types/api.types';

export interface CsvYuklemeResponse {
  id: number;
  dosyaAdi: string;
  durum: 'ISLENIYOR' | 'TAMAMLANDI' | 'HATA';
  toplamSatir: number;
  islenenSatir: number;
  hataMesaji: string | null;
  createdAt: string;
}

export function createCsvService(client: AxiosInstance) {
  return {
    async dosyaYukle(formData: FormData): Promise<ApiResponse<CsvYuklemeResponse>> {
      const response = await client.post<ApiResponse<CsvYuklemeResponse>>('/csv/yukle', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },

    async durumSorgula(id: number): Promise<ApiResponse<CsvYuklemeResponse>> {
      const response = await client.get<ApiResponse<CsvYuklemeResponse>>(`/csv/${id}/durum`);
      return response.data;
    },

    async gecmis(): Promise<ApiResponse<CsvYuklemeResponse[]>> {
      const response = await client.get<ApiResponse<CsvYuklemeResponse[]>>('/csv/gecmis');
      return response.data;
    },
  };
}

export type CsvService = ReturnType<typeof createCsvService>;
