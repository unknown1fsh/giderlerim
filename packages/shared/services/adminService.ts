import { AxiosInstance } from 'axios';
import {
  AdminIstatistikDto,
  AdminKullaniciDto,
  AdminKullaniciGuncelleRequest,
  AdminKullaniciSayfaResponse,
  SistemParametresiDto,
  SistemParametresiGuncelleRequest,
  SistemParametresiOlusturRequest,
} from '../types/admin.types';

interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
}

export function createAdminService(client: AxiosInstance) {
  return {
    async istatistikleriGetir(): Promise<AdminIstatistikDto> {
      const res = await client.get<ApiResponse<AdminIstatistikDto>>('/admin/istatistikler');
      return res.data.data;
    },

    async kullanicilariGetir(params: {
      arama?: string;
      plan?: string;
      aktif?: boolean;
      sayfa?: number;
      boyut?: number;
      siralama?: string;
      yon?: string;
    }): Promise<AdminKullaniciSayfaResponse> {
      const res = await client.get<ApiResponse<AdminKullaniciSayfaResponse>>('/admin/kullanicilar', {
        params: {
          arama: params.arama || undefined,
          plan: params.plan || undefined,
          aktif: params.aktif !== undefined ? params.aktif : undefined,
          sayfa: params.sayfa ?? 0,
          boyut: params.boyut ?? 20,
          siralama: params.siralama ?? 'createdAt',
          yon: params.yon ?? 'desc',
        },
      });
      return res.data.data;
    },

    async kullaniciGetir(id: number): Promise<AdminKullaniciDto> {
      const res = await client.get<ApiResponse<AdminKullaniciDto>>(`/admin/kullanicilar/${id}`);
      return res.data.data;
    },

    async kullaniciGuncelle(id: number, request: AdminKullaniciGuncelleRequest): Promise<AdminKullaniciDto> {
      const res = await client.put<ApiResponse<AdminKullaniciDto>>(`/admin/kullanicilar/${id}`, request);
      return res.data.data;
    },

    async kullaniciSil(id: number): Promise<void> {
      await client.delete(`/admin/kullanicilar/${id}`);
    },

    async parametreleriGetir(): Promise<SistemParametresiDto[]> {
      const res = await client.get<ApiResponse<SistemParametresiDto[]>>('/admin/sistem-parametreleri');
      return res.data.data;
    },

    async parametreOlustur(request: SistemParametresiOlusturRequest): Promise<SistemParametresiDto> {
      const res = await client.post<ApiResponse<SistemParametresiDto>>('/admin/sistem-parametreleri', request);
      return res.data.data;
    },

    async parametreGuncelle(id: number, request: SistemParametresiGuncelleRequest): Promise<SistemParametresiDto> {
      const res = await client.put<ApiResponse<SistemParametresiDto>>(`/admin/sistem-parametreleri/${id}`, request);
      return res.data.data;
    },

    async parametreVarsayilanaGetir(id: number): Promise<SistemParametresiDto> {
      const res = await client.put<ApiResponse<SistemParametresiDto>>(`/admin/sistem-parametreleri/${id}/varsayilan`, {});
      return res.data.data;
    },

    async parametreSil(id: number): Promise<void> {
      await client.delete(`/admin/sistem-parametreleri/${id}`);
    },
  };
}

export type AdminService = ReturnType<typeof createAdminService>;
