import apiClient from './apiClient';
import { ApiResponse, SayfaliResponse } from '@/types/api.types';
import {
  DestekTalebiResponse,
  DestekTalebiOlusturRequest,
  DestekTalebiYanitlaRequest,
} from '@/types/destek.types';

export const destekService = {
  // Kullanıcı işlemleri
  async olustur(request: DestekTalebiOlusturRequest): Promise<DestekTalebiResponse> {
    const res = await apiClient.post<ApiResponse<DestekTalebiResponse>>('/destek-talepleri', request);
    return res.data.data;
  },

  async listele(sayfa = 0, boyut = 20): Promise<SayfaliResponse<DestekTalebiResponse>> {
    const res = await apiClient.get<ApiResponse<SayfaliResponse<DestekTalebiResponse>>>('/destek-talepleri', {
      params: { sayfa, boyut },
    });
    return res.data.data;
  },

  async getir(id: number): Promise<DestekTalebiResponse> {
    const res = await apiClient.get<ApiResponse<DestekTalebiResponse>>(`/destek-talepleri/${id}`);
    return res.data.data;
  },

  async sil(id: number): Promise<void> {
    await apiClient.delete(`/destek-talepleri/${id}`);
  },

  // Admin işlemleri
  async adminListele(params: {
    durum?: string;
    oncelik?: string;
    kategori?: string;
    sayfa?: number;
    boyut?: number;
  }): Promise<SayfaliResponse<DestekTalebiResponse>> {
    const res = await apiClient.get<ApiResponse<SayfaliResponse<DestekTalebiResponse>>>('/admin/destek-talepleri', {
      params: {
        durum: params.durum || undefined,
        oncelik: params.oncelik || undefined,
        kategori: params.kategori || undefined,
        sayfa: params.sayfa ?? 0,
        boyut: params.boyut ?? 20,
      },
    });
    return res.data.data;
  },

  async adminGetir(id: number): Promise<DestekTalebiResponse> {
    const res = await apiClient.get<ApiResponse<DestekTalebiResponse>>(`/admin/destek-talepleri/${id}`);
    return res.data.data;
  },

  async adminYanitla(id: number, request: DestekTalebiYanitlaRequest): Promise<DestekTalebiResponse> {
    const res = await apiClient.put<ApiResponse<DestekTalebiResponse>>(`/admin/destek-talepleri/${id}/yanitla`, request);
    return res.data.data;
  },

  async adminDurumGuncelle(id: number, durum: string): Promise<DestekTalebiResponse> {
    const res = await apiClient.put<ApiResponse<DestekTalebiResponse>>(`/admin/destek-talepleri/${id}/durum`, null, {
      params: { durum },
    });
    return res.data.data;
  },
};
