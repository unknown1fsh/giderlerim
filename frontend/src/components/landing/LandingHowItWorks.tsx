const STEPS = [
  {
    step: '01',
    title: 'Ücretsiz hesap',
    desc: 'E-posta ile kayıt; web veya mobil uygulamadan aynı hesapla devam edin.',
    accent: 'from-brand-500/30 to-transparent',
  },
  {
    step: '02',
    title: 'Harcama kaydı',
    desc: 'Tek tek ekleyin, banka CSV yükleyin (ücretsiz planda ayda 1) veya Pro ile fiş ve belge yükleyin.',
    accent: 'from-violet-500/25 to-transparent',
  },
  {
    step: '03',
    title: 'Bütçe ve uyarılar',
    desc: 'Kategori limitleri ve eşik uyarıları ile ay sonu sürprizlerini azaltın.',
    accent: 'from-cyan-500/20 to-transparent',
  },
  {
    step: '04',
    title: 'AI koç ve analiz',
    desc: 'Pro ve Ultra planlarda sohbet koçu; gelişmiş analiz türleri Ultra ile genişler.',
    accent: 'from-amber-500/20 to-transparent',
  },
] as const;

export function LandingHowItWorks() {
  return (
    <section id="nasil-calisir" className="relative py-24 scroll-mt-20 border-t border-white/[0.06] [content-visibility:auto]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-400 mb-3">Nasıl çalışır?</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Dört adımda kontrol sizde</h2>
          <p className="text-gray-400">
            Karmaşık tablolar yok: kayıt olun, veriyi girin veya içe aktarın, bütçe tanımlayın, uyarılar ve AI ile
            takip edin.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((item) => (
            <div
              key={item.step}
              className="group relative rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-transparent p-6 hover:border-brand-500/30 transition-colors motion-reduce:transition-none"
            >
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.accent} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none motion-reduce:group-hover:opacity-0`}
              />
              <p className="text-4xl font-black text-white/10 mb-3 font-mono">{item.step}</p>
              <h3 className="text-lg font-semibold text-white mb-2 relative">{item.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed relative">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
