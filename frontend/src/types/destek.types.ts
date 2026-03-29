export type DestekDurumu = 'ACIK' | 'YANITLANDI' | 'COZULDU' | 'KAPATILDI';
export type DestekOnceligi = 'DUSUK' | 'NORMAL' | 'YUKSEK' | 'ACIL';
export type DestekKategorisi = 'GENEL' | 'TEKNIK' | 'FATURA' | 'ONERI' | 'HATA';

export interface DestekTalebiResponse {
  id: number;
  konu: string;
  mesaj: string;
  durum: DestekDurumu;
  oncelik: DestekOnceligi;
  kategori: DestekKategorisi;
  adminYaniti: string | null;
  yanitlayanAdminAdi: string | null;
  yanitlanmaTarihi: string | null;
  kullaniciAdi: string;
  kullaniciEmail: string;
  createdAt: string;
  updatedAt: string;
}

export interface DestekTalebiOlusturRequest {
  konu: string;
  mesaj: string;
  kategori?: DestekKategorisi;
  oncelik?: DestekOnceligi;
}

export interface DestekTalebiYanitlaRequest {
  adminYaniti: string;
  durum?: DestekDurumu;
}
