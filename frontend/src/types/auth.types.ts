export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenTipi: string;
  gecerlilikSaniye: number;
}

export interface KayitRequest {
  ad: string;
  soyad: string;
  email: string;
  sifre: string;
}

export interface GirisRequest {
  email: string;
  sifre: string;
}
