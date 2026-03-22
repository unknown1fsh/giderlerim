'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useUyariStore } from '@/stores/uyariStore';
import { Sidebar } from '@/components/feature/layout/Sidebar';
import { TopBar } from '@/components/feature/layout/TopBar';
import { useUyariSayac } from '@/hooks/useUyarilar';

function UyariSayacSyncer() {
  const { data: sayac } = useUyariSayac();
  const { setSayisi } = useUyariStore();

  useEffect(() => {
    if (typeof sayac === 'number') {
      setSayisi(sayac);
    }
  }, [sayac, setSayisi]);

  return null;
}

const Spinner = () => (
  <div className="min-h-screen bg-bg-primary flex items-center justify-center">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-accent" />
  </div>
);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const { sidebarAcik } = useUIStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !accessToken) {
      router.push('/giris');
    }
  }, [mounted, accessToken, router]);

  if (!mounted || !accessToken) {
    return <Spinner />;
  }

  return (
    <>
      <UyariSayacSyncer />
      <div className="flex min-h-screen bg-bg-primary">
        <Sidebar />

        {/* Main content */}
        <div
          className={clsx(
            'flex flex-1 flex-col transition-all duration-300',
            'lg:ml-64'
          )}
        >
          <TopBar />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
