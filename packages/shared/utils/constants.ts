/**
 * Plan limitleri — backend ile uyumlu özet (tek kaynak backend; burada istemci/dokümantasyon için).
 * - GiderServiceImpl: FREE aylık 50 gider; PREMIUM/ULTRA sınır yok.
 * - CsvYuklemeServiceImpl: FREE ayda 1 yükleme; ücretli sınır yok.
 * - BelgeYuklemeServiceImpl: FREE kapalı; PREMIUM/ULTRA açık.
 * - AiSohbet / AiAnaliz: FREE kapalı; Pro analizleri PREMIUM+; anomali/tasarruf ULTRA.
 */
export const PLAN_LIMITLERI = {
  FREE: {
    aylikGiderLimiti: 50,
    aylikCsvYuklemeLimiti: 1,
    aiSohbetAktif: false,
    aiAnalizProAktif: false,
    aiAnalizUltraAktif: false,
    belgeYuklemeAktif: false,
  },
  PREMIUM: {
    aylikGiderLimiti: Number.POSITIVE_INFINITY,
    aylikCsvYuklemeLimiti: Number.POSITIVE_INFINITY,
    aiSohbetAktif: true,
    aiAnalizProAktif: true,
    aiAnalizUltraAktif: false,
    belgeYuklemeAktif: true,
  },
  ULTRA: {
    aylikGiderLimiti: Number.POSITIVE_INFINITY,
    aylikCsvYuklemeLimiti: Number.POSITIVE_INFINITY,
    aiSohbetAktif: true,
    aiAnalizProAktif: true,
    aiAnalizUltraAktif: true,
    belgeYuklemeAktif: true,
  },
} as const;

export const TEMA_RENKLERI = {
  brand: {
    50: '#f0f3ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#465FFF',
    600: '#3b4fd6',
    700: '#3145b0',
    800: '#283a8a',
    900: '#1e2d6d',
    950: '#141e4a',
  },
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
} as const;
