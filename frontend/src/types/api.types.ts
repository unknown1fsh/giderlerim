export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
}

export interface SayfaliResponse<T> {
  icerik: T[];
  sayfa: number;
  boyut: number;
  toplamEleman: number;
  toplamSayfa: number;
  sonSayfa: boolean;
}

export interface HataResponse {
  success: false;
  message: string;
  hataKodu: string;
  alanHatalari?: { alan: string; mesaj: string }[];
  zaman: string;
}
