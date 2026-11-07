"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import { EmailDogrulamaBandi } from "@/components/shared/EmailDogrulama";
import { useAuthStore } from "@/stores/authStore";
import { authService } from "@/services/authService";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { accessToken, kullaniciGuncelle } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (mounted && !accessToken) router.push("/signin");
  }, [mounted, accessToken, router]);

  useEffect(() => {
    if (!mounted || !accessToken) return;

    let aktif = true;
    const profiliEsitle = async () => {
      try {
        const yanit = await authService.beniBul();
        if (aktif && yanit.data) kullaniciGuncelle(yanit.data);
      } catch {
        // Geçici ağ hatalarında mevcut oturumu koru; 401 yönlendirmesini API istemcisi yönetir.
      }
    };
    const gorunurlukteEsitle = () => {
      if (document.visibilityState === "visible") void profiliEsitle();
    };

    void profiliEsitle();
    const aralik = window.setInterval(() => void profiliEsitle(), 30_000);
    window.addEventListener("focus", profiliEsitle);
    document.addEventListener("visibilitychange", gorunurlukteEsitle);

    return () => {
      aktif = false;
      window.clearInterval(aralik);
      window.removeEventListener("focus", profiliEsitle);
      document.removeEventListener("visibilitychange", gorunurlukteEsitle);
    };
  }, [mounted, accessToken, kullaniciGuncelle]);

  if (!mounted || !accessToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500" />
      </div>
    );
  }

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex">
      {/* Sidebar and Backdrop */}
      <AppSidebar />
      <Backdrop />
      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all  duration-300 ease-in-out ${mainContentMargin}`}
      >
        {/* Header */}
        <AppHeader />
        {/* Page Content */}
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          <EmailDogrulamaBandi />
          {children}
        </div>
      </div>
    </div>
  );
}
