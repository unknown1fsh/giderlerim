export interface KategoriResponse {
  id: number;
  ad: string;
  ikon: string;
  renk: string;
  sistemMi: boolean;
}

export interface KategoriOlusturRequest {
  ad: string;
  ikon?: string;
  renk?: string;
}
