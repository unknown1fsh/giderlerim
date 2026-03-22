'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from 'framer-motion';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts';
import {
  Wallet,
  Bot,
  BarChart3,
  Target,
  Upload,
  Bell,
  Zap,
  Crown,
  Star,
  Check,
  ChevronDown,
  Plus,
  Minus,
  ArrowRight,
  TrendingDown,
  Shield,
  Sparkles,
  Users,
  TrendingUp,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

/* ─── FADE-UP VARIANT ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ─── ANIMATED COUNTER ─── */
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { damping: 40, stiffness: 200 });
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (inView) motionVal.set(target);
  }, [inView, target, motionVal]);

  useEffect(() => {
    return spring.on('change', (v) => {
      setDisplay(
        v >= 1000
          ? (v / 1000).toFixed(v >= 10000 ? 0 : 1) + 'K'
          : Math.round(v).toString()
      );
    });
  }, [spring]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

/* ─── TYPING CHAT DEMO ─── */
const chatMessages = [
  { rol: 'kullanici', icerik: 'Bu ay ne kadar harcadım?' },
  { rol: 'asistan', icerik: 'Bu ay toplam ₺4.280 harcama yaptınız. Geçen aya göre %12 azalma var — harika bir gelişme! 🎉' },
  { rol: 'kullanici', icerik: 'Tasarruf önerilerin var mı?' },
  { rol: 'asistan', icerik: 'Yeme-içme kategorisinde ₺680 tasarruf fırsatı tespit ettim. Haftalık market alışverişinizi planlayarak başlayabilirsiniz.' },
];

function ChatDemo() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setVisibleCount(i);
      if (i >= chatMessages.length) clearInterval(interval);
    }, 900);
    return () => clearInterval(interval);
  }, [inView]);

  return (
    <div ref={ref} className="space-y-3 p-4">
      {chatMessages.slice(0, visibleCount).map((msg, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: msg.rol === 'kullanici' ? 20 : -20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className={`flex ${msg.rol === 'kullanici' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              msg.rol === 'kullanici'
                ? 'bg-accent text-white rounded-br-sm'
                : 'bg-[#1A1A2E] border border-[#2A2A4A] text-[#E8E8F0] rounded-bl-sm'
            }`}
          >
            {msg.icerik}
          </div>
        </motion.div>
      ))}
      {visibleCount > 0 && visibleCount < chatMessages.length && (
        <div className="flex justify-start">
          <div className="bg-[#1A1A2E] border border-[#2A2A4A] rounded-2xl rounded-bl-sm px-4 py-3">
            <div className="flex gap-1 items-center">
              <span className="h-2 w-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-2 w-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-2 w-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── MOCK CHART DATA ─── */
const areaData = [
  { gun: '1', tutar: 120 }, { gun: '5', tutar: 340 }, { gun: '8', tutar: 180 },
  { gun: '12', tutar: 520 }, { gun: '15', tutar: 290 }, { gun: '18', tutar: 680 },
  { gun: '21', tutar: 410 }, { gun: '24', tutar: 760 }, { gun: '27', tutar: 320 },
  { gun: '30', tutar: 490 },
];

const pieData = [
  { ad: 'Market', tutar: 1200, renk: '#6C63FF' },
  { ad: 'Ulaşım', tutar: 680, renk: '#8B84FF' },
  { ad: 'Yeme-İçme', tutar: 940, renk: '#a78bfa' },
  { ad: 'Faturalar', tutar: 520, renk: '#c4b5fd' },
  { ad: 'Diğer', tutar: 380, renk: '#ddd6fe' },
];

/* ─── FEATURES ─── */
const ozellikler = [
  {
    ikon: Bot,
    baslik: 'AI Finans Koçu',
    aciklama: 'Harcamalarınızı analiz eden, tasarruf önerileri sunan ve finansal hedeflerinize ulaşmanıza yardımcı olan yapay zeka asistanı.',
    renk: 'from-violet-500/20 to-purple-500/10',
    ikonRenk: 'text-violet-400',
  },
  {
    ikon: BarChart3,
    baslik: 'Görsel Analizler',
    aciklama: 'Kategori pasta grafikleri, günlük harcama trendleri ve aylık karşılaştırmalar ile paranızı anlayın.',
    renk: 'from-blue-500/20 to-cyan-500/10',
    ikonRenk: 'text-blue-400',
  },
  {
    ikon: Target,
    baslik: 'Akıllı Bütçe',
    aciklama: 'Kategori bazlı bütçeler oluşturun, eşik uyarıları alın ve harcama limitlerini takip edin.',
    renk: 'from-emerald-500/20 to-teal-500/10',
    ikonRenk: 'text-emerald-400',
  },
  {
    ikon: Shield,
    baslik: 'Anomali Tespiti',
    aciklama: 'Olağandışı ve şüpheli harcama kalıplarını yapay zeka ile otomatik olarak tespit edin.',
    renk: 'from-red-500/20 to-orange-500/10',
    ikonRenk: 'text-red-400',
  },
  {
    ikon: Upload,
    baslik: 'CSV İçe Aktarma',
    aciklama: 'Banka ekstrelerinizi veya kredi kartı hareketlerinizi CSV ile toplu olarak içe aktarın.',
    renk: 'from-amber-500/20 to-yellow-500/10',
    ikonRenk: 'text-amber-400',
  },
  {
    ikon: Bell,
    baslik: 'Anlık Bildirimler',
    aciklama: 'Bütçe aşımları, olağandışı harcamalar ve tasarruf fırsatları için gerçek zamanlı uyarılar.',
    renk: 'from-pink-500/20 to-rose-500/10',
    ikonRenk: 'text-pink-400',
  },
];

/* ─── PRICING ─── */
const planlar = [
  {
    ad: 'Ücretsiz',
    fiyat: '0',
    aciklama: 'Başlamak için ideal',
    ikon: Star,
    renk: 'border-[#2A2A4A]',
    butonClass: 'border border-[#3A3A5A] text-[#E8E8F0] hover:bg-[#2A2A4A]',
    ozellikler: [
      'Aylık 50 gider kaydı',
      'Temel kategori yönetimi',
      'Bütçe takibi',
      'Aylık 1 CSV yükleme',
      'Temel grafikler',
    ],
    populer: false,
  },
  {
    ad: 'Premium',
    fiyat: '99',
    aciklama: 'Ciddi tasarruf edenler için',
    ikon: Zap,
    renk: 'border-accent',
    butonClass: 'bg-accent text-white hover:bg-accent-hover',
    ozellikler: [
      'Sınırsız gider kaydı',
      'AI Finans Koçu (sohbet)',
      'Bütçe önerileri',
      'Tasarruf analizi',
      'Sınırsız CSV yükleme',
      'Gelişmiş raporlar',
    ],
    populer: true,
  },
  {
    ad: 'Ultra',
    fiyat: '199',
    aciklama: 'Tam kontrol ve öncelik',
    ikon: Crown,
    renk: 'border-[#2A2A4A]',
    butonClass: 'border border-[#3A3A5A] text-[#E8E8F0] hover:bg-[#2A2A4A]',
    ozellikler: [
      'Premium\'ın tamamı',
      'Anomali tespiti',
      'Öncelikli destek',
      'API erişimi',
      'Özel raporlar',
      'Çoklu hesap desteği',
    ],
    populer: false,
  },
];

/* ─── FAQ ─── */
const sorular = [
  { soru: 'Giderlerim tamamen ücretsiz mi kullanılabilir?', cevap: 'Evet! Ücretsiz plan ile aylık 50 gider kaydı, temel bütçe takibi ve grafiklere erişebilirsiniz. Daha fazlası için Premium veya Ultra planlarına geçebilirsiniz.' },
  { soru: 'Verilerim güvende mi?', cevap: 'Verileriniz 256-bit SSL şifreleme ile korunmakta ve güvenli sunucularda saklanmaktadır. Hiçbir finansal hesabınıza doğrudan erişim gerektirmez.' },
  { soru: 'Hangi bankalar destekleniyor?', cevap: 'CSV içe aktarma özelliği ile tüm Türk bankalarının (Ziraat, Garanti, İş Bankası, Akbank, YKB vb.) ekstrelerini desteklemekteyiz.' },
  { soru: 'AI Koç nasıl çalışıyor?', cevap: 'Anthropic\'in Claude modeli üzerine kurulu AI Koç, harcama verilerinizi analiz ederek kişiselleştirilmiş tavsiyeler sunar. Doğal dille soru sorabilirsiniz.' },
  { soru: 'Planı değiştirebilir miyim?', cevap: 'İstediğiniz zaman plan değişikliği yapabilirsiniz. Premium\'dan Ücretsiz\'e geçerseniz verileriniz korunmaya devam eder.' },
  { soru: 'Mobil uygulama var mı?', cevap: 'Şu anda web uygulaması olarak hizmet vermekteyiz. Tüm cihazlarda tam responsive çalışmakta olup mobil uygulama yakında gelecek.' },
];

/* ══════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════ */
export default function LandingPage() {
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (accessToken) router.replace('/dashboard');
  }, [accessToken, router]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!mounted || accessToken) return null;

  return (
    <div className="min-h-screen bg-[#0F0F1A] text-[#E8E8F0] overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-[#0F0F1A]/90 backdrop-blur-xl border-b border-[#2A2A4A]/60 shadow-xl' : ''
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold gradient-text">giderlerim</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              {[['#ozellikler', 'Özellikler'], ['#analizler', 'Analizler'], ['#fiyatlandirma', 'Fiyatlandırma'], ['#sss', 'SSS']].map(([href, label]) => (
                <a key={href} href={href} className="text-sm text-[#9999BB] hover:text-[#E8E8F0] transition-colors">
                  {label}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Link href="/giris" className="text-sm text-[#9999BB] hover:text-[#E8E8F0] transition-colors px-3 py-2 hidden sm:block">
                Giriş Yap
              </Link>
              <Link
                href="/kayit"
                className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-[#5A52E8] transition-all hover:scale-105 active:scale-95"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Ücretsiz Başla
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 hero-gradient overflow-hidden">
        {/* Floating orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="animate-float absolute top-1/4 left-[10%] h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
          <div className="animate-float-delayed absolute top-1/3 right-[8%] h-80 w-80 rounded-full bg-violet-500/8 blur-3xl" />
          <div className="animate-float-slow absolute bottom-1/4 left-1/3 h-48 w-48 rounded-full bg-purple-400/6 blur-3xl" />
          {/* Tiny sparkle dots */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-accent/40"
              style={{
                top: `${10 + (i * 7) % 80}%`,
                left: `${5 + (i * 13) % 90}%`,
                animation: `float ${4 + (i % 4)}s ease-in-out infinite`,
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <motion.div variants={stagger} initial="hidden" animate="visible" className="text-center lg:text-left">
              <motion.div variants={fadeUp} custom={0}>
                <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm text-accent mb-6">
                  <Sparkles className="h-3.5 w-3.5" />
                  Yapay Zeka Destekli Finans Yönetimi
                </span>
              </motion.div>

              <motion.h1 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                Paranızı{' '}
                <span className="gradient-text">Akıllıca</span>
                <br />
                Yönetin
              </motion.h1>

              <motion.p variants={fadeUp} custom={2} className="text-lg text-[#9999BB] mb-8 max-w-lg mx-auto lg:mx-0">
                Harcamalarınızı takip edin, bütçeler oluşturun ve AI koçunuzla tasarruf fırsatlarını keşfedin. Finansal özgürlüğünüze bugün başlayın.
              </motion.p>

              <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link
                  href="/kayit"
                  className="animate-pulse-glow inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-base font-semibold text-white hover:bg-[#5A52E8] transition-all hover:scale-105 active:scale-95"
                >
                  <Sparkles className="h-4 w-4" />
                  Ücretsiz Başla
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#nasil-calisir"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#2A2A4A] bg-[#1A1A2E]/60 px-6 py-3.5 text-base font-medium text-[#E8E8F0] hover:border-accent/40 hover:bg-[#1A1A2E] transition-all"
                >
                  Nasıl Çalışır?
                </a>
              </motion.div>

              <motion.div variants={fadeUp} custom={4} className="mt-10 flex flex-wrap items-center gap-6 justify-center lg:justify-start">
                {[
                  { icon: Users, text: '10.000+ Kullanıcı' },
                  { icon: TrendingDown, text: '₺50M+ Takip' },
                  { icon: Star, text: '4.9★ Puan' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-sm text-[#9999BB]">
                    <Icon className="h-4 w-4 text-accent" />
                    {text}
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right — Dashboard Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative hidden lg:block"
            >
              <div className="glow-border rounded-2xl overflow-hidden glass-card p-5 shadow-2xl">
                {/* Mockup header */}
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#2A2A4A]">
                  <div className="h-3 w-3 rounded-full bg-red-500/60" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                  <div className="h-3 w-3 rounded-full bg-green-500/60" />
                  <span className="ml-2 text-xs text-[#555577]">Dashboard · Mart 2026</span>
                </div>
                {/* Summary cards */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: 'Toplam Harcama', val: '₺4.280', color: 'text-violet-400', bg: 'bg-violet-500/10' },
                    { label: 'Nakit', val: '₺1.640', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                    { label: 'Kredi Kartı', val: '₺2.640', color: 'text-blue-400', bg: 'bg-blue-500/10' },
                    { label: 'İşlem Sayısı', val: '47', color: 'text-amber-400', bg: 'bg-amber-500/10' },
                  ].map(({ label, val, color, bg }) => (
                    <div key={label} className={`rounded-xl border border-[#2A2A4A] p-3 ${bg}`}>
                      <p className="text-xs text-[#9999BB] mb-1">{label}</p>
                      <p className={`text-lg font-bold ${color}`}>{val}</p>
                    </div>
                  ))}
                </div>
                {/* Mini chart */}
                <div className="rounded-xl border border-[#2A2A4A] bg-[#0F0F1A]/60 p-3">
                  <p className="text-xs text-[#9999BB] mb-3">Günlük Harcama Trendi</p>
                  <ResponsiveContainer width="100%" height={90}>
                    <AreaChart data={areaData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                      <defs>
                        <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="tutar" stroke="#6C63FF" strokeWidth={2} fill="url(#heroGrad)" isAnimationActive dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {/* Floating badge */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 -right-4 glass-card rounded-xl px-3 py-2 shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-medium text-[#E8E8F0]">%12 tasarruf!</span>
                </div>
              </motion.div>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute -bottom-4 -left-4 glass-card rounded-xl px-3 py-2 shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-accent" />
                  <span className="text-xs font-medium text-[#E8E8F0]">AI Koç aktif</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[#555577]"
        >
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section className="py-16 border-y border-[#2A2A4A]/50 bg-[#1A1A2E]/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { target: 10000, suffix: '+', label: 'Aktif Kullanıcı', icon: Users },
              { target: 50000, suffix: '+', label: 'Takip Edilen Harcama', icon: TrendingUp },
              { target: 2400, suffix: '+', label: '₺ Ortalama Tasarruf', icon: TrendingDown },
              { target: 4.9, suffix: '★', label: 'Kullanıcı Puanı', icon: Star },
            ].map(({ target, suffix, label, icon: Icon }, i) => (
              <motion.div key={label} variants={fadeUp} custom={i} className="text-center">
                <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-accent/10 mb-3">
                  <Icon className="h-5 w-5 text-accent" />
                </div>
                <div className="text-3xl font-extrabold gradient-text">
                  <AnimatedCounter target={target} suffix={suffix} />
                </div>
                <p className="mt-1 text-sm text-[#9999BB]">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="ozellikler" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm text-accent mb-4">
                <Zap className="h-3.5 w-3.5" />
                Her İhtiyacınız İçin
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl font-extrabold mb-4">
              Güçlü Özellikler,{' '}
              <span className="gradient-text">Sade Kullanım</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-[#9999BB] max-w-xl mx-auto">
              Kişisel finans yönetiminin tüm ihtiyaçlarını tek bir platformda topluyoruz.
            </motion.p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {ozellikler.map(({ ikon: Icon, baslik, aciklama, renk, ikonRenk }, i) => (
              <motion.div
                key={baslik}
                variants={fadeUp}
                custom={i}
                whileHover={{ scale: 1.03, y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`relative rounded-2xl border border-[#2A2A4A] bg-gradient-to-br ${renk} p-6 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all cursor-default group`}
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#0F0F1A]/60 group-hover:scale-110 transition-transform">
                  <Icon className={`h-6 w-6 ${ikonRenk}`} />
                </div>
                <h3 className="text-base font-bold text-[#E8E8F0] mb-2">{baslik}</h3>
                <p className="text-sm text-[#9999BB] leading-relaxed">{aciklama}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── AI SHOWCASE ── */}
      <section className="py-24 bg-[#1A1A2E]/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm text-accent mb-6">
                <Bot className="h-3.5 w-3.5" />
                Premium Özellik
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-6">
                AI Finans Koçunuz{' '}
                <span className="gradient-text">Her An Hazır</span>
              </h2>
              <p className="text-[#9999BB] mb-6 leading-relaxed">
                Claude AI ile güçlendirilmiş finans koçunuz, harcama alışkanlıklarınızı analiz eder ve size özel tasarruf stratejileri oluşturur. Doğal dilde sorularınızı sormanız yeterli.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Harcama örüntülerinizi otomatik analiz eder',
                  'Kişiselleştirilmiş bütçe önerileri sunar',
                  'Tasarruf fırsatlarını tespit eder',
                  'Finansal hedeflerinize yol haritası çizer',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-[#9999BB]">
                    <div className="h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3 text-emerald-400" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/kayit"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white hover:bg-[#5A52E8] transition-all hover:scale-105"
              >
                AI Koçu Dene
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>

            {/* Chat Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="glow-border rounded-2xl overflow-hidden glass-card shadow-2xl"
            >
              {/* Chat header */}
              <div className="flex items-center gap-3 border-b border-[#2A2A4A] px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/20">
                  <Bot className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#E8E8F0]">AI Finans Koçu</p>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <p className="text-xs text-[#9999BB]">Çevrimiçi</p>
                  </div>
                </div>
              </div>
              {/* Messages */}
              <div className="min-h-[260px]">
                <ChatDemo />
              </div>
              {/* Input */}
              <div className="border-t border-[#2A2A4A] px-4 py-3">
                <div className="flex items-center gap-2 rounded-xl border border-[#2A2A4A] bg-[#0F0F1A]/60 px-4 py-2.5">
                  <span className="text-sm text-[#555577]">Sorunuzu yazın...</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── ANALYTICS PREVIEW ── */}
      <section id="analizler" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm text-accent mb-4">
                <BarChart3 className="h-3.5 w-3.5" />
                Görsel Analizler
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl font-extrabold mb-4">
              Harcamalarınızı{' '}
              <span className="gradient-text">Görselleştirin</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-[#9999BB] max-w-xl mx-auto">
              Kategori dağılımı, günlük trendler ve aylık karşılaştırmalar ile paranıza tam hakimiyet kazanın.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7 }}
            className="grid lg:grid-cols-2 gap-6"
          >
            {/* Area Chart */}
            <div className="rounded-2xl border border-[#2A2A4A] bg-[#1A1A2E]/60 p-6">
              <h3 className="text-base font-semibold text-[#E8E8F0] mb-4">Günlük Harcama Trendi</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={areaData}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="gun" tick={{ fill: '#555577', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#555577', fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip
                    contentStyle={{ background: '#1A1A2E', border: '1px solid #2A2A4A', borderRadius: 8 }}
                    labelStyle={{ color: '#9999BB' }}
                    itemStyle={{ color: '#6C63FF' }}
                    formatter={(v: number) => [`₺${v}`, 'Harcama']}
                  />
                  <Area type="monotone" dataKey="tutar" stroke="#6C63FF" strokeWidth={2.5} fill="url(#areaGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="rounded-2xl border border-[#2A2A4A] bg-[#1A1A2E]/60 p-6">
              <h3 className="text-base font-semibold text-[#E8E8F0] mb-4">Kategori Dağılımı</h3>
              <div className="flex items-center gap-6">
                <PieChart width={180} height={180}>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="tutar" strokeWidth={0} paddingAngle={3}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.renk} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1A1A2E', border: '1px solid #2A2A4A', borderRadius: 8 }}
                    itemStyle={{ color: '#E8E8F0' }}
                    formatter={(v: number) => [`₺${v}`, '']}
                  />
                </PieChart>
                <div className="space-y-2 flex-1">
                  {pieData.map(({ ad, tutar, renk }) => (
                    <div key={ad} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: renk }} />
                        <span className="text-xs text-[#9999BB]">{ad}</span>
                      </div>
                      <span className="text-xs font-semibold text-[#E8E8F0]">₺{tutar}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="nasil-calisir" className="py-24 bg-[#1A1A2E]/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-extrabold mb-4">
              3 Adımda{' '}
              <span className="gradient-text">Başlayın</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-[#9999BB] max-w-md mx-auto">
              Saniyeler içinde hesap oluşturun, finansal yolculuğunuza başlayın.
            </motion.p>
          </motion.div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-10 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-0.5">
              <svg className="w-full h-2" viewBox="0 0 100 4" preserveAspectRatio="none">
                <line x1="0" y1="2" x2="100" y2="2" stroke="#2A2A4A" strokeWidth="2" strokeDasharray="6 4" className="animate-slide-dash" />
              </svg>
            </div>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              className="grid lg:grid-cols-3 gap-8"
            >
              {[
                { num: '01', icon: Sparkles, title: 'Hesap Oluştur', desc: 'E-posta ile saniyeler içinde ücretsiz hesabınızı açın. Kredi kartı gerekmez.' },
                { num: '02', icon: Upload, title: 'Harcamalarınızı Ekleyin', desc: 'Manuel giriş yapın veya banka ekstrelerinizi CSV ile toplu aktarın.' },
                { num: '03', icon: Bot, title: 'AI ile Analiz Edin', desc: 'AI koçunuz harcamalarınızı analiz eder, bütçe önerileri sunar ve tasarruf fırsatları bulur.' },
              ].map(({ num, icon: Icon, title, desc }, i) => (
                <motion.div key={num} variants={fadeUp} custom={i} className="text-center relative">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-accent/10 border border-accent/20 mb-4 mx-auto relative">
                    <Icon className="h-7 w-7 text-accent" />
                    <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-accent text-xs font-bold text-white flex items-center justify-center">
                      {num.slice(1)}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#E8E8F0] mb-2">{title}</h3>
                  <p className="text-sm text-[#9999BB] leading-relaxed max-w-xs mx-auto">{desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="fiyatlandirma" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-extrabold mb-4">
              Şeffaf{' '}
              <span className="gradient-text">Fiyatlandırma</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-[#9999BB] max-w-md mx-auto">
              Ücretsiz başlayın, ihtiyacınıza göre yükseltin. İstediğiniz zaman iptal edebilirsiniz.
            </motion.p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid md:grid-cols-3 gap-6 items-center"
          >
            {planlar.map(({ ad, fiyat, aciklama, ikon: Icon, renk, butonClass, ozellikler: oz, populer }, i) => (
              <motion.div
                key={ad}
                variants={fadeUp}
                custom={i}
                whileHover={{ scale: populer ? 1.02 : 1.03, y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`relative rounded-2xl border ${renk} bg-[#1A1A2E]/60 p-7 ${populer ? 'shadow-2xl shadow-accent/20' : ''}`}
              >
                {populer && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-accent px-4 py-1 text-xs font-bold text-white shadow-lg shadow-accent/30">
                      En Popüler
                    </span>
                  </div>
                )}
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl mb-4 ${populer ? 'bg-accent/20' : 'bg-[#2A2A4A]'}`}>
                  <Icon className={`h-5 w-5 ${populer ? 'text-accent' : 'text-[#9999BB]'}`} />
                </div>
                <h3 className="text-lg font-bold text-[#E8E8F0] mb-1">{ad}</h3>
                <p className="text-xs text-[#9999BB] mb-4">{aciklama}</p>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-[#E8E8F0]">₺{fiyat}</span>
                  <span className="text-sm text-[#9999BB]">/ay</span>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {oz.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-[#9999BB]">
                      <Check className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/kayit"
                  className={`block w-full rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition-all hover:scale-105 ${butonClass}`}
                >
                  Başla
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="sss" className="py-24 bg-[#1A1A2E]/30">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-extrabold mb-4">
              Sık Sorulan{' '}
              <span className="gradient-text">Sorular</span>
            </motion.h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="space-y-3"
          >
            {sorular.map(({ soru, cevap }, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className="rounded-xl border border-[#2A2A4A] bg-[#1A1A2E]/60 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-[#1A1A2E] transition-colors"
                >
                  <span className="text-sm font-medium text-[#E8E8F0] pr-4">{soru}</span>
                  <motion.div animate={{ rotate: openFaq === i ? 45 : 0 }} transition={{ duration: 0.2 }}>
                    {openFaq === i ? (
                      <Minus className="h-4 w-4 text-accent flex-shrink-0" />
                    ) : (
                      <Plus className="h-4 w-4 text-[#9999BB] flex-shrink-0" />
                    )}
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div className="px-5 pb-4 text-sm text-[#9999BB] leading-relaxed border-t border-[#2A2A4A]/50 pt-3">
                        {cevap}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-24 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/15 via-transparent to-violet-500/10" />
          <div className="animate-float absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
          <div className="animate-float-delayed absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-violet-400/8 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-accent/20 border border-accent/30 mb-6 mx-auto animate-pulse-glow">
              <Wallet className="h-8 w-8 text-accent" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
              Finansal özgürlüğünüze{' '}
              <span className="gradient-text">bugün başlayın</span>
            </h2>
            <p className="text-[#9999BB] mb-8 max-w-lg mx-auto">
              10.000+ kullanıcıya katılın. Kredi kartı gerekmez, istediğiniz zaman iptal edin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/kayit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-8 py-4 text-base font-semibold text-white hover:bg-[#5A52E8] transition-all hover:scale-105 animate-pulse-glow"
              >
                <Sparkles className="h-5 w-5" />
                Ücretsiz Hesap Oluştur
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/giris"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#2A2A4A] px-8 py-4 text-base font-medium text-[#E8E8F0] hover:border-accent/40 hover:bg-[#1A1A2E] transition-all"
              >
                Giriş Yap
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[#2A2A4A]/60 bg-[#0F0F1A] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent">
                  <Wallet className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold gradient-text">giderlerim</span>
              </div>
              <p className="text-sm text-[#555577]">AI Destekli Kişisel Finans Koçunuz</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#555577] mb-3">Ürün</p>
              <ul className="space-y-2">
                {[['#ozellikler', 'Özellikler'], ['#fiyatlandirma', 'Fiyatlandırma'], ['#analizler', 'Analizler'], ['#sss', 'SSS']].map(([href, label]) => (
                  <li key={href}><a href={href} className="text-sm text-[#9999BB] hover:text-[#E8E8F0] transition-colors">{label}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#555577] mb-3">Hesap</p>
              <ul className="space-y-2">
                {[['/giris', 'Giriş Yap'], ['/kayit', 'Kayıt Ol']].map(([href, label]) => (
                  <li key={href}><Link href={href} className="text-sm text-[#9999BB] hover:text-[#E8E8F0] transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#555577] mb-3">Yasal</p>
              <ul className="space-y-2">
                {[['Kullanım Şartları'], ['Gizlilik Politikası'], ['KVKK']].map((label) => (
                  <li key={label[0]}><span className="text-sm text-[#9999BB] cursor-default">{label[0]}</span></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-[#2A2A4A]/40 pt-6 text-center">
            <p className="text-xs text-[#555577]">
              &copy; {new Date().getFullYear()} giderlerim.net — Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
