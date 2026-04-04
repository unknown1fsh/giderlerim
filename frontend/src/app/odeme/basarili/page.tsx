import Link from 'next/link';

export default function OdemeBasariliPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
        <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">Ödemeniz alındı</h1>
      <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
        Teşekkürler. Kayıtlı e-posta adresinizle aynı Giderlerim hesabınıza plan tanımı genellikle kısa süre içinde
        yapılır. 24 saat içinde uygulamada planınız güncellenmediyse{' '}
        <a href="mailto:destek@giderlerim.com" className="font-medium text-brand-500 hover:underline">
          destek@giderlerim.com
        </a>{' '}
        adresine sipariş numaranızla yazın.
      </p>
      <Link
        href="/dashboard"
        className="rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
      >
        Panele dön
      </Link>
    </div>
  );
}
