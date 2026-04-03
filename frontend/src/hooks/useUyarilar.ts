import { createUyariHooks } from '@giderlerim/shared/hooks/useUyarilar';
import { uyariService } from '@/services/apiClient';

const hooks = createUyariHooks(uyariService);

export const useUyarilar = hooks.useUyarilar;
export const useUyariSayac = hooks.useUyariSayac;
export const useUyariOkundu = hooks.useUyariOkundu;
export const useUyariTumunuOkundu = hooks.useUyariTumunuOkundu;
export const useUyariSil = hooks.useUyariSil;
