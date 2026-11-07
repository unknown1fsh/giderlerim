import Link from 'next/link';
import React from 'react';

/** Şifre sıfırlama ve e-posta doğrulama sayfaları için ortak düzen. */
export default function HesapIslemKarti({
  baslik,
  aciklama,
  children,
}: {
  baslik: string;
  aciklama?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">{baslik}</h1>
          {aciklama && <p className="text-sm text-gray-500 dark:text-gray-400">{aciklama}</p>}
        </div>
        {children}
        <p className="mt-6 text-sm text-gray-700 dark:text-gray-400">
          <Link href="/signin" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
            ← Girişe dön
          </Link>
        </p>
      </div>
    </div>
  );
}

export function BasariMesaji({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
      {children}
    </div>
  );
}

export function HataMesaji({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-error-500">{children}</p>;
}
