import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Gizlilik politikası',
  description: 'Giderlerim gizlilik politikası — www.giderlerim.net',
};

export default function GizlilikPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Link href="/" className="text-sm text-brand-400 hover:text-brand-300 mb-8 inline-block">
          ← Ana sayfa
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">Gizlilik politikası</h1>
        <p className="text-sm text-gray-500 mb-10">Son güncelleme: 5 Nisan 2026 · www.giderlerim.net</p>
        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-gray-300">
          <p>
            Giderlerim olarak kişisel verilerinize saygı duyuyoruz. Bu metin, hizmetimizi kullanırken hangi
            verilerin işlenebileceğini ve haklarınızı özetler.
          </p>
          <h2 className="text-lg font-semibold text-white mt-8">Toplanan veriler</h2>
          <p>
            Hesap oluştururken verdiğiniz kimlik ve iletişim bilgileri; uygulama içinde girdiğiniz harcama,
            bütçe ve kategori verileri; destek taleplerinizde paylaştığınız içerik; teknik loglar (ör. hata
            ayıklama, güvenlik).
          </p>
          <h2 className="text-lg font-semibold text-white mt-8">Kullanım amacı</h2>
          <p>
            Hizmeti sunmak, güvenliği sağlamak, yasal yükümlülükleri yerine getirmek ve — açık rızanız veya
            ayarlarınız uyarınca — ürün iyileştirmeleri.
          </p>
          <h2 className="text-lg font-semibold text-white mt-8">Saklama ve güvenlik</h2>
          <p>
            Verileriniz şifreli iletişim (HTTPS) üzerinden aktarılır; sunucu taraflında erişim kontrolleri
            uygulanır. Saklama süreleri yasal zorunluluklar ve iş gereksinimleriyle uyumludur.
          </p>
          <h2 className="text-lg font-semibold text-white mt-8">Haklarınız</h2>
          <p>
            KVKK kapsamında erişim, düzeltme, silme, itiraz ve şikayet haklarınızı kullanmak için{' '}
            <a href="mailto:destek@giderlerim.net" className="text-brand-400 hover:underline">
              destek@giderlerim.net
            </a>{' '}
            adresinden bize ulaşabilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
}
