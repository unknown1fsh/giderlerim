'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ShopierOAuthCallbackIcerik() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <h1 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">Shopier bağlantısı tamamlanmadı</h1>
        <p className="mb-2 text-sm text-red-600 dark:text-red-400">
          {error}
          {errorDescription ? ` — ${errorDescription}` : null}
        </p>
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          Uygulama ayarlarınızı kontrol edin veya tekrar deneyin.
        </p>
        <Link
          href="/dashboard"
          className="inline-block rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600"
        >
          Panele dön
        </Link>
      </div>
    );
  }

  if (code) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <h1 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">Shopier yetkilendirmesi alındı</h1>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          OAuth akışı başarıyla tamamlandı. Token değişimi ve mağaza bağlantısı backend tarafında etkinleştirildiğinde
          bu sayfa otomatik olarak yönlendirilecek veya kısa bir onay mesajı gösterecek.
        </p>
        {state ? (
          <p className="mb-6 font-mono text-xs text-gray-500 dark:text-gray-500">
            state: {state.slice(0, 80)}
            {state.length > 80 ? '…' : ''}
          </p>
        ) : (
          <div className="mb-6" />
        )}
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-block rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600"
          >
            Panele dön
          </Link>
          <Link
            href="/"
            className="inline-block rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-800"
          >
            Ana sayfa
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-16 text-center">
      <h1 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">Shopier geri dönüş</h1>
      <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
        Bu sayfa Shopier OAuth yönlendirmesi içindir. Adres çubuğunda <code className="rounded bg-gray-100 px-1 dark:bg-gray-800">code</code>{' '}
        parametresi yoksa bağlantı eksik veya süresi dolmuş olabilir.
      </p>
      <Link
        href="/dashboard"
        className="inline-block rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600"
      >
        Panele dön
      </Link>
    </div>
  );
}

export default function ShopierOAuthCallbackPage() {
  return (
    <div className="min-h-[60vh] bg-gray-50 dark:bg-gray-900">
      <Suspense
        fallback={
          <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-500 dark:text-gray-400">
            Yükleniyor…
          </div>
        }
      >
        <ShopierOAuthCallbackIcerik />
      </Suspense>
    </div>
  );
}
