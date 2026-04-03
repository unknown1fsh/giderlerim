import { AxiosInstance } from 'axios';
import { createGiderService } from './giderService';
import { createAuthService } from './authService';
import { createDashboardService } from './dashboardService';
import { createButceService } from './butceService';
import { createKategoriService } from './kategoriService';
import { createUyariService } from './uyariService';
import { createAiAnalizService, createAiSohbetService } from './aiService';
import { createBelgeService } from './belgeService';
import { createCsvService } from './csvService';
import { createDestekService } from './destekService';
import { createAdminService } from './adminService';

export interface Services {
  gider: ReturnType<typeof createGiderService>;
  auth: ReturnType<typeof createAuthService>;
  dashboard: ReturnType<typeof createDashboardService>;
  butce: ReturnType<typeof createButceService>;
  kategori: ReturnType<typeof createKategoriService>;
  uyari: ReturnType<typeof createUyariService>;
  aiAnaliz: ReturnType<typeof createAiAnalizService>;
  aiSohbet: ReturnType<typeof createAiSohbetService>;
  belge: ReturnType<typeof createBelgeService>;
  csv: ReturnType<typeof createCsvService>;
  destek: ReturnType<typeof createDestekService>;
  admin: ReturnType<typeof createAdminService>;
}

export function createServices(client: AxiosInstance): Services {
  return {
    gider: createGiderService(client),
    auth: createAuthService(client),
    dashboard: createDashboardService(client),
    butce: createButceService(client),
    kategori: createKategoriService(client),
    uyari: createUyariService(client),
    aiAnaliz: createAiAnalizService(client),
    aiSohbet: createAiSohbetService(client),
    belge: createBelgeService(client),
    csv: createCsvService(client),
    destek: createDestekService(client),
    admin: createAdminService(client),
  };
}

export { createApiClient } from './createApiClient';
export type { StorageAdapter, NavigationAdapter, ApiClientConfig } from './createApiClient';
export { createGiderService } from './giderService';
export { createAuthService } from './authService';
export { createDashboardService } from './dashboardService';
export { createButceService } from './butceService';
export { createKategoriService } from './kategoriService';
export { createUyariService } from './uyariService';
export { createAiAnalizService, createAiSohbetService } from './aiService';
export { createBelgeService } from './belgeService';
export { createCsvService } from './csvService';
export { createDestekService } from './destekService';
export { createAdminService } from './adminService';
