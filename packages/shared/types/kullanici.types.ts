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
  adminMi: boolean;
  /** Yapay zeka sağlayıcısına veri aktarımı için açık rıza. */
  aiIzni: boolean;
}

export interface ProfilGuncelleRequest {
  ad?: string;
  soyad?: string;
  paraBirimi?: ParaBirimi;
}
