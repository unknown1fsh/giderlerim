import { AxiosInstance } from 'axios';
import { ApiResponse } from '../types/api.types';
import { ButceOlusturRequest, ButceOzetResponse, ButceResponse } from '../types/butce.types';

export function createButceService(client: AxiosInstance) {
  return {
    async listele(ay: number, yil: number): Promise<ApiResponse<ButceResponse[]>> {
      const response = await client.get<ApiResponse<ButceResponse[]>>('/butceler', { params: { ay, yil } });
      return response.data;
    },

    async ozet(ay: number, yil: number): Promise<ApiResponse<ButceOzetResponse[]>> {
      const response = await client.get<ApiResponse<ButceOzetResponse[]>>('/butceler/ozet', { params: { ay, yil } });
      return response.data;
    },

    async olustur(data: ButceOlusturRequest): Promise<ApiResponse<ButceResponse>> {
      const response = await client.post<ApiResponse<ButceResponse>>('/butceler', data);
      return response.data;
    },

    async guncelle(id: number, data: { limitTutar?: number; uyariYuzdesi?: number }): Promise<ApiResponse<ButceResponse>> {
      const response = await client.put<ApiResponse<ButceResponse>>(`/butceler/${id}`, data);
      return response.data;
    },

    async sil(id: number): Promise<void> {
      await client.delete(`/butceler/${id}`);
    },
  };
}

export type ButceService = ReturnType<typeof createButceService>;
