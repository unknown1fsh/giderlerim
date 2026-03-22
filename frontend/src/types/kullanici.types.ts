export type PlanTuru = 'FREE' | 'PREMIUM' | 'ULTRA';
export type ParaBirimi = 'TRY' | 'USD' | 'EUR';

export interface KullaniciResponse {
  id: number;
  ad: string;
  soyad: string;
  email: string;
  plan: PlanTuru;
  paraBirimi: ParaBirimi;
  avatarUrl: string | null;
}

export interface ProfilGuncelleRequest {
  ad?: string;
  soyad?: string;
  paraBirimi?: ParaBirimi;
}
