import type { ApiResponse } from '@giderlerim/shared/types/api.types';
import type { KullaniciResponse } from '@giderlerim/shared/types/kullanici.types';

export function isKullaniciProfilCevabi(body: unknown): body is ApiResponse<KullaniciResponse> {
  if (!body || typeof body !== 'object') return false;
  const o = body as Record<string, unknown>;
  if (o.data == null || typeof o.data !== 'object') return false;
  const d = o.data as Record<string, unknown>;
  return typeof d.id === 'number' && typeof d.email === 'string';
}
