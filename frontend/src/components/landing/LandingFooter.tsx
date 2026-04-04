import Image from 'next/image';
import Link from 'next/link';

type LandingFooterProps = {
  year: number;
};

export function LandingFooter({ year }: LandingFooterProps) {
  return (
    <footer className="border-t border-white/[0.06] py-10 bg-[#050810]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Image src="/images/logo/logo-dark.svg" alt="Giderlerim" width={110} height={26} />
            <span className="text-sm text-gray-500">giderlerim.net</span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-gray-500">
            <Link href="/gizlilik" className="hover:text-gray-300 transition-colors">
              Gizlilik politikası
            </Link>
            <Link href="/kullanim" className="hover:text-gray-300 transition-colors">
              Kullanım koşulları
            </Link>
            <a href="mailto:destek@giderlerim.net" className="hover:text-gray-300 transition-colors">
              İletişim
            </a>
            <a href="#fiyatlandirma" className="hover:text-gray-300 transition-colors">
              Fiyatlar
            </a>
          </nav>
          <p className="text-xs text-gray-600 text-center lg:text-right">
            © {year} Giderlerim · giderlerim.net
          </p>
        </div>
      </div>
    </footer>
  );
}
