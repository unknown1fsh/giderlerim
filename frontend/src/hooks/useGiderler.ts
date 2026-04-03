import { createGiderHooks } from '@giderlerim/shared/hooks/useGiderler';
import { giderService } from '@/services/apiClient';

const hooks = createGiderHooks(giderService);

export const useGiderler = hooks.useGiderler;
export const useGiderEkle = hooks.useGiderEkle;
export const useGiderSil = hooks.useGiderSil;
export const useGiderGuncelle = hooks.useGiderGuncelle;
