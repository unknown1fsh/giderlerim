import { createButceHooks } from '@giderlerim/shared/hooks/useButceler';
import { butceService } from '@/services/apiClient';

const hooks = createButceHooks(butceService);

export const useButceler = hooks.useButceler;
export const useButceOzetler = hooks.useButceOzetler;
export const useButceEkle = hooks.useButceEkle;
export const useButceSil = hooks.useButceSil;
export const useButceGuncelle = hooks.useButceGuncelle;
