import { createGiderHooks } from '@giderlerim/shared/hooks/useGiderler';
import { createDashboardHooks } from '@giderlerim/shared/hooks/useDashboard';
import { createKategoriHooks } from '@giderlerim/shared/hooks/useKategoriler';
import { createButceHooks } from '@giderlerim/shared/hooks/useButceler';
import { createUyariHooks } from '@giderlerim/shared/hooks/useUyarilar';
import { services } from './apiClient';

const giderHooks = createGiderHooks(services.gider);
export const useGiderler = giderHooks.useGiderler;
export const useGiderEkle = giderHooks.useGiderEkle;
export const useGiderSil = giderHooks.useGiderSil;
export const useGiderGuncelle = giderHooks.useGiderGuncelle;

const dashboardHooks = createDashboardHooks(services.dashboard);
export const useDashboard = dashboardHooks.useDashboard;
export const useGunlukHarcamalar = dashboardHooks.useGunlukHarcamalar;

const kategoriHooks = createKategoriHooks(services.kategori);
export const useKategoriler = kategoriHooks.useKategoriler;

const butceHooks = createButceHooks(services.butce);
export const useButceler = butceHooks.useButceler;
export const useButceOzetler = butceHooks.useButceOzetler;
export const useButceEkle = butceHooks.useButceEkle;
export const useButceSil = butceHooks.useButceSil;
export const useButceGuncelle = butceHooks.useButceGuncelle;

const uyariHooks = createUyariHooks(services.uyari);
export const useUyarilar = uyariHooks.useUyarilar;
export const useUyariSayac = uyariHooks.useUyariSayac;
export const useUyariOkundu = uyariHooks.useUyariOkundu;
export const useUyariTumunuOkundu = uyariHooks.useUyariTumunuOkundu;
export const useUyariSil = uyariHooks.useUyariSil;

export { useModal } from '@giderlerim/shared/hooks/useModal';
