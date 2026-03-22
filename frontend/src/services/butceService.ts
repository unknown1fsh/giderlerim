import apiClient from './apiClient';
import { ApiResponse } from '@/types/api.types';
import { ButceOlusturRequest, ButceOzetResponse, ButceResponse } from '@/types/butce.types';

export const butceService = {
  async listele(ay: number, yil: number): Promise<ApiResponse<ButceResponse[]>> {
    const response = await apiClient.get<ApiResponse<ButceResponse[]>>('/butceler', { params: { ay, yil } });
    return response.data;
  },

  async ozet(ay: number, yil: number): Promise<ApiResponse<ButceOzetResponse[]>> {
    const response = await apiClient.get<ApiResponse<ButceOzetResponse[]>>('/butceler/ozet', { params: { ay, yil } });
    return response.data;
  },

  async olustur(data: ButceOlusturRequest): Promise<ApiResponse<ButceResponse>> {
    const response = await apiClient.post<ApiResponse<ButceResponse>>('/butceler', data);
    return response.data;
  },

  async guncelle(id: number, data: { limitTutar?: number; uyariYuzdesi?: number }): Promise<ApiResponse<ButceResponse>> {
    const response = await apiClient.put<ApiResponse<ButceResponse>>(`/butceler/${id}`, data);
    return response.data;
  },

  async sil(id: number): Promise<void> {
    await apiClient.delete(`/butceler/${id}`);
  },
};
