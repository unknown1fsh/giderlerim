export type UyariTuru = 'BUTCE_ASIMI' | 'BUTCE_YAKLASIYOR' | 'ANORMAL_HARCAMA' | 'GIZLI_KACINAK' | 'TASARRUF_FIRSATI' | 'AYLIK_OZET';

export interface UyariResponse {
  id: number;
  tur: UyariTuru;
  baslik: string;
  mesaj: string;
  okunduMu: boolean;
  ilgiliId: number | null;
  createdAt: string;
}
