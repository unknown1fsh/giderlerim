export type AnalizTuru = 'HARCAMA_ANALIZI' | 'BUTCE_ONERISI' | 'ANOMALI_TESPITI' | 'AYLIK_OZET' | 'KATEGORI_ICGORU' | 'TASARRUF_FIRSATI';
export type MesajRolu = 'KULLANICI' | 'ASISTAN';

export interface AiAnalizResponse {
  tur: AnalizTuru;
  ozet: string;
  bulgular: string[];
  oneriler: string[];
  oncelikliEylem: string;
  olusturmaTarihi: string;
  onbellekten: boolean;
}

export interface SohbetOturumResponse {
  id: number;
  baslik: string | null;
  aktif: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SohbetMesajiResponse {
  id: number;
  rol: MesajRolu;
  icerik: string;
  createdAt: string;
}
