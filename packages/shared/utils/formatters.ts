import { ParaBirimi } from '../types/kullanici.types';

const PARA_BIRIMLERI: Record<string, { locale: string; currency: string }> = {
  TRY: { locale: 'tr-TR', currency: 'TRY' },
  USD: { locale: 'en-US', currency: 'USD' },
  EUR: { locale: 'de-DE', currency: 'EUR' },
};

export function formatPara(tutar: number, paraBirimi: string = 'TRY'): string {
  const config = PARA_BIRIMLERI[paraBirimi] || PARA_BIRIMLERI.TRY;
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(tutar);
}

export const AY_ADLARI = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
] as const;

export const ODEME_YONTEMI_ETIKETLERI: Record<string, string> = {
  NAKIT: 'Nakit',
  KREDI_KARTI: 'Kredi Kartı',
  BANKA_KARTI: 'Banka Kartı',
  HAVALE: 'Havale',
  DIGER: 'Diğer',
};

export const GIRIS_TURU_ETIKETLERI: Record<string, string> = {
  MANUEL: 'Manuel',
  CSV: 'CSV',
  OCR: 'OCR',
  SES: 'Ses',
  BELGE: 'Belge/Fiş',
};
