import assert from 'node:assert/strict';
import test from 'node:test';

import { girisVeProfilGetir, kayitVeProfilGetir } from './authenticate.ts';

const tokenlar = { accessToken: 'a', refreshToken: 'r', tokenTipi: 'Bearer', gecerlilikSaniye: 900 };
const kullanici = {
  id: 7, ad: 'Ada', soyad: 'Lovelace', email: 'ada@example.com',
  plan: 'FREE', paraBirimi: 'TRY', avatarUrl: null, adminMi: false,
};

test('mobil giriş backend tokenı ve gerçek profili döndürür', async () => {
  const auth = {
    girisYap: async (istek) => {
      assert.deepEqual(istek, { email: 'ada@example.com', sifre: 'secret123' });
      return { success: true, message: null, data: tokenlar };
    },
  };
  const profilGetir = async (accessToken) => {
    assert.equal(accessToken, 'a');
    return kullanici;
  };

  const sonuc = await girisVeProfilGetir(auth, profilGetir, {
    email: 'ada@example.com', sifre: 'secret123',
  });

  assert.deepEqual(sonuc, { tokenlar, kullanici });
  assert.equal(sonuc.kullanici.adminMi, false);
});

test('mobil kayıt demo plan veya admin üretmeden backend profilini kullanır', async () => {
  const auth = {
    kayitOl: async () => ({ success: true, message: null, data: tokenlar }),
  };
  const sonuc = await kayitVeProfilGetir(auth, async () => kullanici, {
    ad: 'Ada', soyad: 'Lovelace', email: 'ada@example.com', sifre: 'secret123',
  });

  assert.equal(sonuc.kullanici.plan, 'FREE');
  assert.equal(sonuc.kullanici.adminMi, false);
});

