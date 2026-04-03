import { createKategoriHooks } from '@giderlerim/shared/hooks/useKategoriler';
import { kategoriService } from '@/services/apiClient';

const hooks = createKategoriHooks(kategoriService);

export const useKategoriler = hooks.useKategoriler;
