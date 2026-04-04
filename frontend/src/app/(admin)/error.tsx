'use client';

import Link from 'next/link';
import { useEffect } from 'react';

/** Yönetim alanı sayfalarında oluşan render hataları için sınır. */
export default function AdminSegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
        Bu bölüm yüklenemedi
      </h1>
      <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mb-6">
        Panelde beklenmeyen bir hata oluştu. Yeniden deneyebilir veya giriş sayfasına dönebilirsiniz.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          Yeniden dene
        </button>
        <Link
          href="/signin"
          className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Giriş sayfası
        </Link>
      </div>
    </div>
  );
}
