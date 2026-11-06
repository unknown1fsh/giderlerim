'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminMenuGoster } from '@/layout/adminMenu';
import { useAuthStore } from '@/stores/authStore';

export default function YonetimLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const kullanici = useAuthStore((state) => state.kullanici);
  const admin = adminMenuGoster(kullanici?.adminMi);

  useEffect(() => {
    if (kullanici && !admin) router.replace('/dashboard');
  }, [admin, kullanici, router]);

  if (!admin) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500" />
      </div>
    );
  }

  return children;
}

