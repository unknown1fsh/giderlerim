import { PlanTuru, ParaBirimi } from './kullanici.types';

export interface AdminKullaniciDto {
  id: number;
  ad: string;
  soyad: string;
  email: string;
  plan: PlanTuru;
  paraBirimi: ParaBirimi;
  adminMi: boolean;
  aktif: boolean;
  emailDogrulandi: boolean;
  sonGirisTarihi: string | null;
  createdAt: string;
  giderSayisi: number;
}

export interface AdminKullaniciGuncelleRequest {
  plan?: PlanTuru;
  adminMi?: boolean;
  aktif?: boolean;
}

export interface AdminIstatistikDto {
  toplamKullanici: number;
  aktifKullanici: number;
  silinenKullanici: number;
  adminKullanici: number;
  freeKullanici: number;
  premiumKullanici: number;
  ultraKullanici: number;
  toplamGiderSayisi: number;
  toplamGiderTutari: number;
  toplamButceSayisi: number;
  toplamAiOturumSayisi: number;
  toplamAiMesajSayisi: number;
  toplamCsvYuklemeSayisi: number;
  toplamBelgeYuklemeSayisi: number;
  toplamUyariSayisi: number;
  okunmamisUyariSayisi: number;
}

export interface SistemParametresiDto {
  id: number;
  anahtar: string;
  deger: string;
  varsayilanDeger: string;
  aciklama: string | null;
  tip: 'STRING' | 'NUMBER' | 'BOOLEAN';
  kategori: 'GENEL' | 'GUVENLIK' | 'AI' | 'SISTEM' | 'PLAN';
  duzenlenebilir: boolean;
  updatedAt: string;
}

export interface SistemParametresiGuncelleRequest {
  deger: string;
}

export interface SistemParametresiOlusturRequest {
  anahtar: string;
  deger: string;
  varsayilanDeger: string;
  aciklama?: string;
  tip?: 'STRING' | 'NUMBER' | 'BOOLEAN';
  kategori?: 'GENEL' | 'GUVENLIK' | 'AI' | 'SISTEM' | 'PLAN';
}

export interface AdminKullaniciSayfaResponse {
  content: AdminKullaniciDto[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
