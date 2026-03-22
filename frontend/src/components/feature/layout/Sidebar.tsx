'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  Bot,
  BarChart3,
  Bell,
  FileUp,
  Settings,
  Zap,
  Crown,
  Star,
  X,
  LogOut,
  Shield,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

const navItems = [
  { href: '/dashboard', ikon: LayoutDashboard, etiket: 'Dashboard' },
  { href: '/giderler', ikon: Receipt, etiket: 'Giderler' },
  { href: '/butceler', ikon: Wallet, etiket: 'Bütçeler' },
  { href: '/ai-koc', ikon: Bot, etiket: 'AI Koç' },
  { href: '/analizler', ikon: BarChart3, etiket: 'Analizler' },
  { href: '/uyarilar', ikon: Bell, etiket: 'Uyarılar' },
  { href: '/belge-yukle', ikon: FileUp, etiket: 'Belge Yükle' },
  { href: '/ayarlar', ikon: Settings, etiket: 'Ayarlar' },
];

const planRenkleri = {
  FREE: { bg: 'bg-white/10', text: 'text-sidebar-text', etiket: 'Ücretsiz' },
  PREMIUM: { bg: 'bg-warning/20', text: 'text-warning', etiket: 'Premium' },
  ULTRA: { bg: 'bg-accent/20', text: 'text-accent', etiket: 'Ultra' },
};

const planIkonlari = {
  FREE: Star,
  PREMIUM: Zap,
  ULTRA: Crown,
};

export function Sidebar() {
  const pathname = usePathname();
  const { kullanici, cikisYap } = useAuthStore();
  const { sidebarAcik, sidebarKapat } = useUIStore();

  const plan = kullanici?.plan ?? 'FREE';
  const planRenk = planRenkleri[plan];
  const PlanIkon = planIkonlari[plan];

  return (
    <>
      {/* Mobile overlay */}
      {sidebarAcik && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={sidebarKapat}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed left-0 top-0 z-30 flex h-full w-64 flex-col transition-transform duration-300 lg:translate-x-0',
          'bg-sidebar-bg',
          sidebarAcik ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">giderlerim</span>
          </div>
          <button
            onClick={sidebarKapat}
            className="rounded-lg p-1 text-sidebar-text-muted hover:bg-sidebar-hover hover:text-white transition-colors lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const Ikon = item.ikon;
              const aktif = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => {
                      if (window.innerWidth < 1024) sidebarKapat();
                    }}
                    className={clsx(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      aktif
                        ? 'bg-accent/15 text-white'
                        : 'text-sidebar-text hover:bg-sidebar-hover hover:text-white'
                    )}
                  >
                    <Ikon
                      className={clsx(
                        'h-4 w-4 flex-shrink-0',
                        aktif ? 'text-accent' : 'text-sidebar-text'
                      )}
                    />
                    {item.etiket}
                    {(item.href === '/ai-koc' || item.href === '/belge-yukle') && plan === 'FREE' && (
                      <span className="ml-auto rounded-full bg-warning/20 px-1.5 py-0.5 text-xs text-warning">
                        Pro
                      </span>
                    )}
                    {aktif && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Admin Bölümü */}
          {kullanici?.adminMi && (
            <div className="mt-4 border-t border-white/10 pt-4">
              <p className="mb-1.5 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-text-muted">
                Yönetim
              </p>
              <Link
                href="/admin"
                onClick={() => {
                  if (window.innerWidth < 1024) sidebarKapat();
                }}
                className={clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  pathname.startsWith('/admin')
                    ? 'bg-accent/15 text-white'
                    : 'text-sidebar-text hover:bg-sidebar-hover hover:text-white'
                )}
              >
                <Shield
                  className={clsx(
                    'h-4 w-4 flex-shrink-0',
                    pathname.startsWith('/admin') ? 'text-accent' : 'text-sidebar-text'
                  )}
                />
                Admin Paneli
                {pathname.startsWith('/admin') && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />
                )}
              </Link>
            </div>
          )}
        </nav>

        {/* Upgrade Banner for FREE users */}
        {plan === 'FREE' && (
          <div className="mx-3 mb-3 rounded-xl border border-accent/25 bg-accent/10 p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Crown className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold text-white">Premium&apos;a Geç</span>
            </div>
            <p className="text-xs text-sidebar-text mb-3 leading-relaxed">
              AI Koç ve analizler ile harcamalarınızı optimize edin.
            </p>
            <Link
              href="/ayarlar"
              className="block w-full rounded-lg bg-accent px-3 py-2 text-center text-xs font-semibold text-white hover:bg-accent-hover transition-colors"
            >
              Planı Yükselt
            </Link>
          </div>
        )}

        {/* User Info */}
        {kullanici && (
          <div className="border-t border-white/10 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-accent/25 text-sm font-bold text-accent">
                {kullanici.ad.charAt(0).toUpperCase()}
                {kullanici.soyad.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {kullanici.ad} {kullanici.soyad}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <PlanIkon className={clsx('h-3 w-3', planRenk.text)} />
                  <span className={clsx('text-xs font-medium', planRenk.text)}>
                    {planRenk.etiket}
                  </span>
                </div>
              </div>
              <button
                onClick={cikisYap}
                className="rounded-lg p-1.5 text-sidebar-text-muted hover:bg-sidebar-hover hover:text-white transition-colors"
                title="Çıkış Yap"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
