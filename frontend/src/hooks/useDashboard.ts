import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboardService';

export function useDashboard(ay: number, yil: number) {
  return useQuery({
    queryKey: ['dashboard', ay, yil],
    queryFn: () => dashboardService.getDashboard(ay, yil),
    select: (data) => data.data,
    staleTime: 1000 * 60 * 5,
  });
}

export function useGunlukHarcamalar(baslangic: string, bitis: string) {
  return useQuery({
    queryKey: ['gunluk-harcamalar', baslangic, bitis],
    queryFn: () => dashboardService.getGunlukHarcamalar(baslangic, bitis),
    select: (data) => data.data,
  });
}
