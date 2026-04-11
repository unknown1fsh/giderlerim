const FEATURES = [
  {
    emoji: '📊',
    title: 'Özet ve gider listesi',
    desc: 'Web ve mobilde toplamlar, ödeme yöntemi kırılımı ve filtreli gider geçmişi.',
    border: 'border-white/10 hover:border-brand-500/40',
    grad: 'from-brand-500/15 to-transparent',
  },
  {
    emoji: '📁',
    title: 'CSV içe aktarma',
    desc: 'Banka hesap özetinizi CSV olarak yükleyin; ücretsiz planda ayda 1, Pro ve Ultra’da sınırsız.',
    border: 'border-white/10 hover:border-emerald-500/40',
    grad: 'from-emerald-500/12 to-transparent',
  },
  {
    emoji: '📸',
    title: 'Belge ve fiş (Pro+)',
    desc: 'PDF veya görüntü yükleyerek AI ile tutar ve kategori çıkarımı — Pro ve Ultra’da.',
    border: 'border-white/10 hover:border-sky-500/40',
    grad: 'from-sky-500/12 to-transparent',
  },
  {
    emoji: '💬',
    title: 'AI harcama koçu',
    desc: 'Sohbet arayüzüyle harcama alışkanlıklarınız hakkında soru sorun; Pro ve Ultra’da aktif.',
    border: 'border-white/10 hover:border-violet-500/40',
    grad: 'from-violet-500/15 to-transparent',
  },
  {
    emoji: '📈',
    title: 'AI analizleri',
    desc: 'Aylık harcama analizi ve bütçe önerisi Pro’da; anomali ve tasarruf fırsatı analizleri Ultra’da.',
    border: 'border-white/10 hover:border-amber-500/40',
    grad: 'from-amber-500/12 to-transparent',
  },
  {
    emoji: '🔔',
    title: 'Akıllı uyarılar',
    desc: 'Bütçe aşımı, yaklaşan limit ve olağandışı harcama bildirimleri ile kontrolü elinizde tutun.',
    border: 'border-white/10 hover:border-orange-500/40',
    grad: 'from-orange-500/12 to-transparent',
  },
] as const;

export function LandingFeatures() {
  return (
    <section id="ozellikler" className="relative py-24 scroll-mt-20 bg-[#070c18] [content-visibility:auto]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-400 mb-3">Neden Giderlerim?</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Vaat değil: <span className="text-brand-400">bugün kullanılabilen</span> özellikler
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">
            Aşağıdakiler uygulamada mevcut. Yakında eklenecekleri ayrıca işaretledik.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className={`group rounded-2xl border bg-gradient-to-br ${f.grad} ${f.border} p-6 transition-all duration-300 hover:-translate-y-1 motion-reduce:hover:translate-y-0 motion-reduce:transition-none`}
            >
              <div className="mb-3 text-3xl">{f.emoji}</div>
              <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-dashed border-brand-500/30 bg-brand-500/[0.06] p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="text-xl">🚀</span> Yol haritası — yakında
            </h3>
            <span className="self-start sm:self-auto text-[11px] font-bold uppercase tracking-wide text-brand-200 bg-brand-500/25 px-3 py-1 rounded-full">
              Geliştiriliyor
            </span>
          </div>
          <ul className="grid sm:grid-cols-2 gap-4 text-sm text-gray-400">
            <li>
              <strong className="text-gray-300">Banka SMS parse:</strong> Türkiye&apos;deki yaygın banka SMS
              formatlarından otomatik işlem.
            </li>
            <li>
              <strong className="text-gray-300">Abonelik takibi:</strong> Tekrarlayan ödemeleri ve &quot;sızıntı&quot;
              harcamaları daha net gösterme.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
