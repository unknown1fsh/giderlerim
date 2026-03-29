"use client";
import Link from "next/link";
import React, { useState, useEffect, useCallback } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { uyariService } from "@/services/uyariService";
import { useUyariStore } from "@/stores/uyariStore";
import { UyariResponse, UyariTuru } from "@/types/uyari.types";

const uyariIkonu = (tur: UyariTuru) => {
  const renkler: Record<UyariTuru, string> = {
    BUTCE_ASIMI: "bg-red-500",
    BUTCE_YAKLASIYOR: "bg-orange-400",
    ANORMAL_HARCAMA: "bg-yellow-500",
    GIZLI_KACINAK: "bg-purple-500",
    TASARRUF_FIRSATI: "bg-green-500",
    AYLIK_OZET: "bg-blue-500",
  };
  return renkler[tur] ?? "bg-gray-400";
};

const uyariEmoji: Record<UyariTuru, string> = {
  BUTCE_ASIMI: "🚨",
  BUTCE_YAKLASIYOR: "⚠️",
  ANORMAL_HARCAMA: "📊",
  GIZLI_KACINAK: "🔍",
  TASARRUF_FIRSATI: "💡",
  AYLIK_OZET: "📋",
};

const zamanFarki = (tarih: string): string => {
  const fark = Date.now() - new Date(tarih).getTime();
  const dk = Math.floor(fark / 60000);
  if (dk < 1) return "Az önce";
  if (dk < 60) return `${dk} dk önce`;
  const sa = Math.floor(dk / 60);
  if (sa < 24) return `${sa} sa önce`;
  const gun = Math.floor(sa / 24);
  return `${gun} gün önce`;
};

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [uyarilar, setUyarilar] = useState<UyariResponse[]>([]);
  const [yukleniyor, setYukleniyor] = useState(false);
  const { okunmamisSayisi, setSayisi, azalt } = useUyariStore();

  const uyarilariYukle = useCallback(async () => {
    try {
      setYukleniyor(true);
      const [listeCevap, sayacCevap] = await Promise.all([
        uyariService.listele(),
        uyariService.sayac(),
      ]);
      if (listeCevap.success) {
        setUyarilar(listeCevap.data?.icerik ?? []);
      }
      if (sayacCevap.success) {
        setSayisi(sayacCevap.data ?? 0);
      }
    } catch {
      // sessiz hata
    } finally {
      setYukleniyor(false);
    }
  }, [setSayisi]);

  useEffect(() => {
    uyarilariYukle();
  }, [uyarilariYukle]);

  const handleAc = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) uyarilariYukle();
  };

  const handleKapat = () => setIsOpen(false);

  const handleOkundu = async (id: number) => {
    try {
      await uyariService.okunduIsaretle(id);
      setUyarilar((prev) =>
        prev.map((u) => (u.id === id ? { ...u, okunduMu: true } : u))
      );
      azalt();
    } catch {
      // sessiz hata
    }
  };

  const handleTumunuOkundu = async () => {
    try {
      await uyariService.tumunuOkunduIsaretle();
      setUyarilar((prev) => prev.map((u) => ({ ...u, okunduMu: true })));
      setSayisi(0);
    } catch {
      // sessiz hata
    }
  };

  return (
    <div className="relative">
      <button
        className="relative dropdown-toggle flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={handleAc}
      >
        {okunmamisSayisi > 0 && (
          <span className="absolute -right-0.5 -top-0.5 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
            {okunmamisSayisi > 9 ? "9+" : okunmamisSayisi}
          </span>
        )}
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={handleKapat}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Bildirimler
            {okunmamisSayisi > 0 && (
              <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                {okunmamisSayisi} yeni
              </span>
            )}
          </h5>
          <div className="flex items-center gap-2">
            {okunmamisSayisi > 0 && (
              <button
                onClick={handleTumunuOkundu}
                className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Tümünü okundu işaretle
              </button>
            )}
            <button
              onClick={handleKapat}
              className="text-gray-500 transition dropdown-toggle dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <svg
                className="fill-current"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </div>

        <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
          {yukleniyor ? (
            <li className="flex items-center justify-center py-8 text-sm text-gray-400">
              Yükleniyor...
            </li>
          ) : uyarilar.length === 0 ? (
            <li className="flex flex-col items-center justify-center py-10 text-center">
              <span className="text-3xl mb-2">🔔</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Henüz bildirim yok
              </p>
            </li>
          ) : (
            uyarilar.map((uyari) => (
              <li key={uyari.id}>
                <DropdownItem
                  onItemClick={() => {
                    if (!uyari.okunduMu) handleOkundu(uyari.id);
                    handleKapat();
                  }}
                  className={`flex gap-3 rounded-lg border-b border-gray-100 px-4 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5 ${
                    !uyari.okunduMu ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg ${uyariIkonu(uyari.tur)}`}
                  >
                    {uyariEmoji[uyari.tur]}
                  </span>
                  <span className="block min-w-0 flex-1">
                    <span className="mb-1 flex items-start justify-between gap-1">
                      <span
                        className={`block text-sm font-medium leading-tight ${
                          !uyari.okunduMu
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {uyari.baslik}
                      </span>
                      {!uyari.okunduMu && (
                        <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                      )}
                    </span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      {uyari.mesaj}
                    </span>
                    <span className="mt-1 block text-xs text-gray-400 dark:text-gray-500">
                      {zamanFarki(uyari.createdAt)}
                    </span>
                  </span>
                </DropdownItem>
              </li>
            ))
          )}
        </ul>

        <Link
          href="/uyarilar"
          className="block px-4 py-2 mt-3 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          Tüm Bildirimleri Gör
        </Link>
      </Dropdown>
    </div>
  );
}
