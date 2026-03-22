'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { clsx } from 'clsx';
import { Sidebar } from '@/components/feature/layout/Sidebar';
import { TopBar } from '@/components/feature/layout/TopBar';

const Spinner = () => (
  <div className="min-h-screen bg-bg-primary flex items-center justify-center">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-accent" />
  </div>
);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { accessToken, kullanici } = useAuthStore();
  const { sidebarAcik } = useUIStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!accessToken) {
      router.push('/giris');
      return;
    }
    if (!kullanici?.adminMi) {
      router.push('/dashboard');
    }
  }, [mounted, accessToken, kullanici, router]);

  if (!mounted || !accessToken || !kullanici?.adminMi) {
    return <Spinner />;
  }

  return (
    <div className="flex min-h-screen bg-bg-primary">
      <Sidebar />
      <div className={clsx('flex flex-1 flex-col transition-all duration-300', 'lg:ml-64')}>
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
