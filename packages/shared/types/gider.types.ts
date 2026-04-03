export type OdemeYontemi = 'NAKIT' | 'KREDI_KARTI' | 'BANKA_KARTI' | 'HAVALE' | 'DIGER';
export type GirisTuru = 'MANUEL' | 'CSV' | 'OCR' | 'SES';

export interface GiderResponse {
  id: number;
  kategori: { id: number; ad: string; ikon: string; renk: string; sistemMi: boolean };
  tutar: number;
  paraBirimi: string;
  aciklama: string | null;
  notlar: string | null;
  tarih: string;
  odemeYontemi: OdemeYontemi;
  girisTuru: GirisTuru;
  aiKategorilendi: boolean;
  anormalMi: boolean;
  createdAt: string;
}

export interface GiderOlusturRequest {
  kategoriId: number;
  tutar: number;
  paraBirimi?: string;
  aciklama?: string;
  notlar?: string;
  tarih: string;
  odemeYontemi?: OdemeYontemi;
}

export interface GiderFiltre {
  kategoriId?: number;
  baslangicTarihi?: string;
  bitisTarihi?: string;
  odemeYontemi?: OdemeYontemi;
  page?: number;
  size?: number;
}
