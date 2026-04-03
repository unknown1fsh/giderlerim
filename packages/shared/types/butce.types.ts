export interface ButceResponse {
  id: number;
  kategori: { id: number; ad: string; ikon: string; renk: string; sistemMi: boolean };
  ay: number;
  yil: number;
  limitTutar: number;
  uyariYuzdesi: number;
  aktif: boolean;
}

export interface ButceOzetResponse {
  butceId: number;
  kategori: { id: number; ad: string; ikon: string; renk: string; sistemMi: boolean };
  limitTutar: number;
  harcananTutar: number;
  kalanTutar: number;
  kullanimYuzdesi: number;
  limitAsildi: boolean;
  uyariEsigi: boolean;
}

export interface ButceOlusturRequest {
  kategoriId: number;
  ay: number;
  yil: number;
  limitTutar: number;
  uyariYuzdesi?: number;
}
