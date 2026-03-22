export interface KategoriHarcamaResponse {
  kategoriId: number;
  kategoriAd: string;
  kategoriIkon: string;
  kategoriRenk: string;
  toplam: number;
  yuzde: number;
}

export interface GunlukHarcamaResponse {
  tarih: string;
  toplam: number;
}

export interface DashboardResponse {
  ay: number;
  yil: number;
  toplamHarcama: number;
  nakitHarcama: number;
  krediKartiHarcama: number;
  oncekiAyHarcama: number;
  degisimYuzdesi: number;
  kategoriDagilimi: KategoriHarcamaResponse[];
  butceDurumlari: import('./butce.types').ButceOzetResponse[];
  toplamGiderSayisi: number;
  anormalGiderSayisi: number;
  okunmamisUyariSayisi: number;
}
