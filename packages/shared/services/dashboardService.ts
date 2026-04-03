import { AxiosInstance } from 'axios';
import { ApiResponse } from '../types/api.types';
import { DashboardResponse, GunlukHarcamaResponse, KategoriHarcamaResponse } from '../types/dashboard.types';

export function createDashboardService(client: AxiosInstance) {
  return {
    async getDashboard(ay: number, yil: number): Promise<ApiResponse<DashboardResponse>> {
      const response = await client.get<ApiResponse<DashboardResponse>>('/dashboard', { params: { ay, yil } });
      return response.data;
    },

    async getGunlukHarcamalar(baslangic: string, bitis: string): Promise<ApiResponse<GunlukHarcamaResponse[]>> {
      const response = await client.get<ApiResponse<GunlukHarcamaResponse[]>>('/dashboard/gunluk', { params: { baslangic, bitis } });
      return response.data;
    },

    async getKategoriDagilimi(ay: number, yil: number): Promise<ApiResponse<KategoriHarcamaResponse[]>> {
      const response = await client.get<ApiResponse<KategoriHarcamaResponse[]>>('/dashboard/kategoriler', { params: { ay, yil } });
      return response.data;
    },
  };
}

export type DashboardService = ReturnType<typeof createDashboardService>;
