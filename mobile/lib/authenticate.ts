import type { ApiResponse } from '@giderlerim/shared/types/api.types';
import type { GirisRequest, KayitRequest, TokenResponse } from '@giderlerim/shared/types/auth.types';
import type { KullaniciResponse } from '@giderlerim/shared/types/kullanici.types';

type ProfilGetir = (accessToken: string) => Promise<KullaniciResponse>;
type GirisAuth = { girisYap: (istek: GirisRequest) => Promise<ApiResponse<TokenResponse>> };
type KayitAuth = { kayitOl: (istek: KayitRequest) => Promise<ApiResponse<TokenResponse>> };

function tokenlariDogrula(yanit: ApiResponse<TokenResponse>): TokenResponse {
  if (!yanit.data?.accessToken || !yanit.data.refreshToken) {
    throw new Error('Kimlik doğrulama yanıtı geçersiz.');
  }
  return yanit.data;
}

export async function girisVeProfilGetir(
  auth: GirisAuth,
  profilGetir: ProfilGetir,
  istek: GirisRequest,
) {
  const tokenlar = tokenlariDogrula(await auth.girisYap(istek));
  const kullanici = await profilGetir(tokenlar.accessToken);
  return { tokenlar, kullanici };
}

export async function kayitVeProfilGetir(
  auth: KayitAuth,
  profilGetir: ProfilGetir,
  istek: KayitRequest,
) {
  const tokenlar = tokenlariDogrula(await auth.kayitOl(istek));
  const kullanici = await profilGetir(tokenlar.accessToken);
  return { tokenlar, kullanici };
}

