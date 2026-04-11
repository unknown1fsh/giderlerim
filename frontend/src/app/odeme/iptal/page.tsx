import Link from 'next/link';

export default function OdemeIptalPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">Ödeme tamamlanmadı</h1>
      <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
        İşlemi iptal ettiniz veya ödeme başarısız oldu. İstediğiniz zaman fiyatlandırma sayfasından yeniden
        deneyebilirsiniz.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {/* Giriş gerektirmez: genel ziyaretçi için landing anchor. Uygulamada oturum açıksa /plan tercih edilir. */}
        <Link
          href="/#fiyatlandirma"
          className="rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
        >
          Fiyatlandırma
        </Link>
        <Link
          href="/dashboard"
          className="rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-800"
        >
          Panele dön
        </Link>
      </div>
    </div>
  );
}
