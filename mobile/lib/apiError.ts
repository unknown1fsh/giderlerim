import { isAxiosError } from 'axios';
import type { HataResponse } from '@giderlerim/shared/types/api.types';
import { API_BASE_URL } from './apiBaseUrl';

function isHataBody(x: unknown): x is HataResponse {
  return (
    typeof x === 'object' &&
    x !== null &&
    'success' in x &&
    (x as HataResponse).success === false &&
    typeof (x as HataResponse).message === 'string'
  );
}

/** Axios + backend HataResponse gövdesinden kullanıcıya gösterilecek metin */
export function apiHataMesaji(err: unknown, varsayilan: string): string {
  if (!isAxiosError(err)) {
    return varsayilan;
  }
  const data = err.response?.data;
  if (isHataBody(data)) {
    if (data.alanHatalari?.length) {
      return data.alanHatalari.map((a) => a.mesaj).join(' ');
    }
    return data.message || varsayilan;
  }
  if (data && typeof data === 'object' && 'message' in data && typeof (data as { message: string }).message === 'string') {
    return (data as { message: string }).message;
  }
  if (err.code === 'ECONNABORTED') {
    return 'İstek zaman aşımına uğradı. Bağlantınızı ve API adresini kontrol edin.';
  }
  if (!err.response) {
    const axiosMsg = err.message?.trim();
    const ek =
      axiosMsg && !/^network error$/i.test(axiosMsg) && axiosMsg.length < 120
        ? ` Teknik: ${axiosMsg}.`
        : '';
    let cihazNotu = '';
    if (API_BASE_URL.includes('10.0.2.2')) {
      cihazNotu =
        '10.0.2.2 yalnızca Android emülatörde geçerlidir; gerçek telefonda asla çalışmaz. ';
    } else if (API_BASE_URL.includes('127.0.0.1')) {
      cihazNotu =
        '127.0.0.1 yalnızca bu telefon/simülatörün kendisini işaret eder; gerçek telefonda sunucunuza gitmez. ';
    }
    return (
      `${cihazNotu}Sunucuya ulaşılamıyor. Kullanılan taban: ${API_BASE_URL}.${ek} ` +
      'mobile klasöründe .env oluşturun (.env.example kopyalayın), satır: EXPO_PUBLIC_API_URL=https://SITENIZ/api/v1 Sonra: npx expo start -c ve Expo Go ile yeniden bağlanın. ' +
      'Yerel backend + gerçek telefon: http://BILGISAYAR_LAN_IP:8081/api/v1 ve SPRING_PROFILES_ACTIVE=dev.'
    );
  }
  return varsayilan;
}
