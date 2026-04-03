import * as LocalAuthentication from 'expo-local-authentication';

export async function biyometrikDestekleniyor(): Promise<boolean> {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  if (!compatible) return false;
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return enrolled;
}

export async function biyometrikDogrula(): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Giderlerim\'e giriş yap',
    cancelLabel: 'İptal',
    disableDeviceFallback: false,
    fallbackLabel: 'Şifre ile giriş',
  });
  return result.success;
}

export async function biyometrikTurleri(): Promise<LocalAuthentication.AuthenticationType[]> {
  return LocalAuthentication.supportedAuthenticationTypesAsync();
}
