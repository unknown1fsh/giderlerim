import { createDashboardHooks } from '@giderlerim/shared/hooks/useDashboard';
import { dashboardService } from '@/services/apiClient';

const hooks = createDashboardHooks(dashboardService);

export const useDashboard = hooks.useDashboard;
export const useGunlukHarcamalar = hooks.useGunlukHarcamalar;
