import { useQuery } from '@tanstack/react-query';
import { DashboardService } from '../services/dashboardService';

export function createDashboardHooks(dashboardService: DashboardService) {
  function useDashboard(ay: number, yil: number) {
    return useQuery({
      queryKey: ['dashboard', ay, yil],
      queryFn: () => dashboardService.getDashboard(ay, yil),
      select: (data) => data.data,
      staleTime: 1000 * 60 * 5,
    });
  }

  function useGunlukHarcamalar(baslangic: string, bitis: string) {
    return useQuery({
      queryKey: ['gunluk-harcamalar', baslangic, bitis],
      queryFn: () => dashboardService.getGunlukHarcamalar(baslangic, bitis),
      select: (data) => data.data,
    });
  }

  return { useDashboard, useGunlukHarcamalar };
}
