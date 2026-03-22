'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, Bell, ChevronDown, User, Settings, LogOut, Sun, Moon } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useUyariStore } from '@/stores/uyariStore';

interface TopBarProps {
  baslik?: string;
}

export function TopBar({ baslik }: TopBarProps) {
  const { kullanici, cikisYap } = useAuthStore();
  const { sidebarToggle, tema, temaDegistir } = useUIStore();
  const { okunmamisSayisi } = useUyariStore();
  const router = useRouter();
  const [menuAcik, setMenuAcik] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuAcik(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCikis = () => {
    cikisYap();
    router.push('/giris');
  };

  const baslangicHarfler = kullanici
    ? `${kullanici.ad.charAt(0)}${kullanici.soyad.charAt(0)}`.toUpperCase()
    : '??';

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-bg-primary px-4 sm:px-6">
      {/* Left: Sidebar toggle + Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={sidebarToggle}
          className="rounded-lg p-2 text-text-muted hover:bg-bg-secondary hover:text-text-primary transition-colors"
          aria-label="Menüyü aç/kapat"
        >
          <Menu className="h-5 w-5" />
        </button>
        {baslik && (
          <h2 className="text-base font-semibold text-text-primary hidden sm:block">
            {baslik}
          </h2>
        )}
      </div>

      {/* Right: Notifications + User */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={temaDegistir}
          className="flex items-center rounded-full border border-border bg-bg-secondary p-1 transition-all"
          aria-label="Tema değiştir"
        >
          <span className={clsx(
            'flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200',
            tema === 'light' ? 'bg-white shadow-sm text-amber-500' : 'text-text-muted'
          )}>
            <Sun className="h-3.5 w-3.5" />
          </span>
          <span className={clsx(
            'flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200',
            tema === 'dark' ? 'bg-bg-tertiary shadow-sm text-accent' : 'text-text-muted'
          )}>
            <Moon className="h-3.5 w-3.5" />
          </span>
        </button>

        {/* Notification Bell */}
        <Link
          href="/uyarilar"
          className="relative rounded-lg p-2 text-text-muted hover:bg-bg-secondary hover:text-text-primary transition-colors"
          aria-label="Uyarılar"
        >
          <Bell className="h-5 w-5" />
          {okunmamisSayisi > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
              {okunmamisSayisi > 9 ? '9+' : okunmamisSayisi}
            </span>
          )}
        </Link>

        {/* User Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuAcik(!menuAcik)}
            className={clsx(
              'flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-bg-secondary',
              menuAcik && 'bg-bg-secondary'
            )}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-sm font-bold text-accent">
              {baslangicHarfler}
            </div>
            {kullanici && (
              <span className="hidden text-sm font-medium text-text-primary sm:block">
                {kullanici.ad}
              </span>
            )}
            <ChevronDown
              className={clsx('h-4 w-4 text-text-muted transition-transform', menuAcik && 'rotate-180')}
            />
          </button>

          {/* Dropdown */}
          {menuAcik && (
            <div className="absolute right-0 top-full mt-1 w-52 rounded-xl border border-border bg-bg-primary py-1 shadow-lg shadow-black/5">
              {kullanici && (
                <div className="border-b border-border px-4 py-3">
                  <p className="text-sm font-semibold text-text-primary">
                    {kullanici.ad} {kullanici.soyad}
                  </p>
                  <p className="mt-0.5 text-xs text-text-muted">{kullanici.email}</p>
                </div>
              )}
              <Link
                href="/ayarlar"
                onClick={() => setMenuAcik(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-bg-secondary hover:text-text-primary transition-colors"
              >
                <User className="h-4 w-4" />
                Profil
              </Link>
              <Link
                href="/ayarlar"
                onClick={() => setMenuAcik(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-bg-secondary hover:text-text-primary transition-colors"
              >
                <Settings className="h-4 w-4" />
                Ayarlar
              </Link>
              <div className="border-t border-border mt-1 pt-1">
                <button
                  onClick={handleCikis}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-danger/5 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Çıkış Yap
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
