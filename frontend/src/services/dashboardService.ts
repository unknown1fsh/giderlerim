import apiClient from './apiClient';
import { ApiResponse } from '@/types/api.types';
import { DashboardResponse, GunlukHarcamaResponse, KategoriHarcamaResponse } from '@/types/dashboard.types';

export const dashboardService = {
  async getDashboard(ay: number, yil: number): Promise<ApiResponse<DashboardResponse>> {
    const response = await apiClient.get<ApiResponse<DashboardResponse>>('/dashboard', { params: { ay, yil } });
    return response.data;
  },

  async getGunlukHarcamalar(baslangic: string, bitis: string): Promise<ApiResponse<GunlukHarcamaResponse[]>> {
    const response = await apiClient.get<ApiResponse<GunlukHarcamaResponse[]>>('/dashboard/gunluk', { params: { baslangic, bitis } });
    return response.data;
  },

  async getKategoriDagilimi(ay: number, yil: number): Promise<ApiResponse<KategoriHarcamaResponse[]>> {
    const response = await apiClient.get<ApiResponse<KategoriHarcamaResponse[]>>('/dashboard/kategoriler', { params: { ay, yil } });
    return response.data;
  },
};
