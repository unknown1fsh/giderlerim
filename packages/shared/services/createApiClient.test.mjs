import assert from 'node:assert/strict';
import test from 'node:test';
import axios, { AxiosError } from 'axios';

import { createApiClient } from './createApiClient.ts';

function bellekDeposu(baslangic) {
  const degerler = new Map(Object.entries(baslangic));
  return {
    getItem: (anahtar) => degerler.get(anahtar) ?? null,
    setItem: (anahtar, deger) => degerler.set(anahtar, deger),
    removeItem: (anahtar) => degerler.delete(anahtar),
    clear: () => degerler.clear(),
  };
}

test('eşzamanlı 401 yanıtlarını tek refresh çağrısında birleştirir ve iki tokenı da döndürür', async () => {
  let refreshSayisi = 0;
  const storage = bellekDeposu({ accessToken: 'eski-access', refreshToken: 'eski-refresh' });
  const client = createApiClient({
    baseURL: 'https://api.test',
    storage,
    navigation: { navigateToLogin() {} },
  });
  client.defaults.adapter = async (config) => {
    if (config.headers.Authorization === 'Bearer yeni-access') {
      return { data: { ok: true }, status: 200, statusText: 'OK', headers: {}, config };
    }
    throw new AxiosError('expired', AxiosError.ERR_BAD_REQUEST, config, null, {
      data: { message: 'expired' }, status: 401, statusText: 'Unauthorized', headers: {}, config,
    });
  };

  const gercekPost = axios.post;
  axios.post = async () => {
    refreshSayisi += 1;
    await new Promise((resolve) => setTimeout(resolve, 40));
    return { data: { data: { accessToken: 'yeni-access', refreshToken: 'yeni-refresh' } } };
  };

  try {
    const [ilk, ikinci] = await Promise.all([client.get('/kaynak'), client.get('/kaynak')]);
    assert.equal(ilk.status, 200);
    assert.equal(ikinci.status, 200);
    assert.equal(refreshSayisi, 1);
    assert.equal(await storage.getItem('accessToken'), 'yeni-access');
    assert.equal(await storage.getItem('refreshToken'), 'yeni-refresh');
  } finally {
    axios.post = gercekPost;
  }
});

test('açıkça verilen Authorization başlığını depodaki eski tokenla ezmez', async () => {
  const storage = bellekDeposu({ accessToken: 'eski-access' });
  const client = createApiClient({
    baseURL: 'https://api.test', storage, navigation: { navigateToLogin() {} },
  });
  client.defaults.adapter = async (config) => {
    assert.equal(config.headers.Authorization, 'Bearer yeni-login-tokeni');
    return { data: { ok: true }, status: 200, statusText: 'OK', headers: {}, config };
  };

  await client.get('/profil', { headers: { Authorization: 'Bearer yeni-login-tokeni' } });
});


test('auth uçlarındaki 401 için token yenilemez ve login yönlendirmesi yapmaz', async () => {
  let yonlendirme = 0;
  let refreshSayisi = 0;
  const storage = bellekDeposu({ refreshToken: 'eski-refresh' });
  const client = createApiClient({
    baseURL: 'https://api.test', storage, navigation: { navigateToLogin() { yonlendirme += 1; } },
  });
  client.defaults.adapter = async (config) => {
    throw new AxiosError('bad credentials', AxiosError.ERR_BAD_REQUEST, config, null, {
      data: { message: 'E-posta veya şifre hatalı.' }, status: 401, statusText: 'Unauthorized', headers: {}, config,
    });
  };
  const gercekPost = axios.post;
  axios.post = async () => { refreshSayisi += 1; return { data: { data: {} } }; };

  try {
    await assert.rejects(client.post('/auth/giris', { email: 'a@b.c', sifre: 'x' }), (hata) => hata.response.status === 401);
    assert.equal(refreshSayisi, 0);
    assert.equal(yonlendirme, 0);
    assert.equal(await storage.getItem('refreshToken'), 'eski-refresh');
  } finally {
    axios.post = gercekPost;
  }
});
