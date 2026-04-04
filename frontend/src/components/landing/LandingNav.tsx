import Image from 'next/image';
import Link from 'next/link';

const navLinkClass =
  'text-sm font-medium text-gray-400 hover:text-white transition-colors hidden md:inline';

export function LandingNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#050810]/75 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="shrink-0 flex items-center gap-2">
              <Image src="/images/logo/logo-dark.svg" alt="Giderlerim" width={130} height={30} priority />
            </Link>
            <span className="hidden sm:inline text-[11px] text-gray-600 font-medium tracking-wide truncate">
              www.giderlerim.net
            </span>
          </div>
          <div className="flex items-center gap-1 md:gap-5">
            <a href="#nasil-calisir" className={navLinkClass}>
              Nasıl çalışır?
            </a>
            <a href="#ozellikler" className={navLinkClass}>
              Özellikler
            </a>
            <a href="#fiyatlandirma" className={navLinkClass}>
              Fiyatlar
            </a>
            <Link
              href="/signin"
              className="hidden sm:inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Giriş
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-all hover:shadow-lg hover:shadow-brand-500/25 active:scale-[0.98]"
            >
              Ücretsiz başla
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
