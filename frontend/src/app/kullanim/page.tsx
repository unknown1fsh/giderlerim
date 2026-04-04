import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Kullanım koşulları',
  description: 'Giderlerim kullanım koşulları — giderlerim.net',
};

export default function KullanimPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Link href="/" className="text-sm text-brand-400 hover:text-brand-300 mb-8 inline-block">
          ← Ana sayfa
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">Kullanım koşulları</h1>
        <p className="text-sm text-gray-500 mb-10">Son güncelleme: 5 Nisan 2026 · giderlerim.net</p>
        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-gray-300">
          <p>
            giderlerim.net ve Giderlerim mobil uygulamasını kullanarak aşağıdaki koşulları kabul etmiş
            sayılırsınız.
          </p>
          <h2 className="text-lg font-semibold text-white mt-8">Hizmetin niteliği</h2>
          <p>
            Giderlerim, kişisel harcama ve bütçe takibi için dijital bir araçtır. Sunulan analizler ve yapay
            zeka çıktıları bilgilendirme amaçlıdır; yatırım veya hukuki tavsiye niteliği taşımaz.
          </p>
          <h2 className="text-lg font-semibold text-white mt-8">Hesap ve güvenlik</h2>
          <p>
            Hesap bilgilerinizin gizliliğinden siz sorumlusunuz. Şüpheli kullanım durumunda derhal{' '}
            <a href="mailto:destek@giderlerim.net" className="text-brand-400 hover:underline">
              destek@giderlerim.net
            </a>{' '}
            üzerinden bildirimde bulunun.
          </p>
          <h2 className="text-lg font-semibold text-white mt-8">Kabul edilebilir kullanım</h2>
          <p>
            Hizmeti yasadışı amaçlarla, başkalarının haklarını ihlal edecek şekilde veya altyapıya zarar
            verecek biçimde kullanmamayı kabul edersiniz.
          </p>
          <h2 className="text-lg font-semibold text-white mt-8">Değişiklikler</h2>
          <p>
            Koşulları güncelleyebiliriz. Önemli değişikliklerde uygulama veya e-posta ile bilgilendirme
            yapılabilir. Güncel metin her zaman bu sayfada yayımlanır.
          </p>
        </div>
      </div>
    </div>
  );
}
