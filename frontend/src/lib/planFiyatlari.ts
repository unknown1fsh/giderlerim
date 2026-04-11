/**
 * Fiyat gösterimi — landing ve panel /plan ile senkron (Shopier ürün fiyatlarıyla eşleşmeli).
 */
export const FIYAT_PRO_AYLIK = 99;
export const FIYAT_PRO_AYLIK_YILLIK_PAKETTE = 79;
export const FIYAT_PRO_YILLIK_TOPLAM = FIYAT_PRO_AYLIK_YILLIK_PAKETTE * 12;

export const FIYAT_ULTRA_AYLIK = 199;
export const FIYAT_ULTRA_AYLIK_YILLIK_PAKETTE = 159;
export const FIYAT_ULTRA_YILLIK_TOPLAM = FIYAT_ULTRA_AYLIK_YILLIK_PAKETTE * 12;

export function proGosterimAylikFiyat(yillik: boolean): number {
  return yillik ? FIYAT_PRO_AYLIK_YILLIK_PAKETTE : FIYAT_PRO_AYLIK;
}

export function ultraGosterimAylikFiyat(yillik: boolean): number {
  return yillik ? FIYAT_ULTRA_AYLIK_YILLIK_PAKETTE : FIYAT_ULTRA_AYLIK;
}

export function proYillikTasarrufTl(): number {
  return (FIYAT_PRO_AYLIK - FIYAT_PRO_AYLIK_YILLIK_PAKETTE) * 12;
}

export function ultraYillikTasarrufTl(): number {
  return (FIYAT_ULTRA_AYLIK - FIYAT_ULTRA_AYLIK_YILLIK_PAKETTE) * 12;
}
