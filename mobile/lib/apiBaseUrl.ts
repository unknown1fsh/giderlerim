import { Platform } from 'react-native';

/** EXPO_PUBLIC_API_URL yoksa: Android emülatör → host makine; iOS Simulator → localhost */
function varsayilanApiTabani(): string {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8081/api/v1';
  }
  return 'http://127.0.0.1:8081/api/v1';
}

/** Sondaki / kaldırılır; axios path birleşiminde çift slash hatası olmasın */
export function cozumlenmisApiTabani(): string {
  const raw = process.env.EXPO_PUBLIC_API_URL?.trim() || varsayilanApiTabani();
  return raw.replace(/\/+$/, '');
}

export const API_BASE_URL = cozumlenmisApiTabani();

if (__DEV__) {
  // Metro konsolunda hangi tabanın kullanıldığını doğrulamak için
  console.log('[api] EXPO_PUBLIC_API_URL →', API_BASE_URL);
}
