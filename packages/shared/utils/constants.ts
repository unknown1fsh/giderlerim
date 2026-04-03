export const PLAN_LIMITLERI = {
  FREE: {
    aylikGiderLimiti: 50,
    aiSohbetAktif: false,
    aiAnalizAktif: false,
    csvYuklemeAktif: false,
    belgeYuklemeAktif: false,
  },
  PREMIUM: {
    aylikGiderLimiti: 500,
    aiSohbetAktif: true,
    aiAnalizAktif: true,
    csvYuklemeAktif: true,
    belgeYuklemeAktif: true,
  },
  ULTRA: {
    aylikGiderLimiti: Infinity,
    aiSohbetAktif: true,
    aiAnalizAktif: true,
    csvYuklemeAktif: true,
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
