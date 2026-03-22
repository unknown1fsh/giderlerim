import { useQuery } from '@tanstack/react-query';
import { kategoriService } from '@/services/kategoriService';

export function useKategoriler() {
  return useQuery({
    queryKey: ['kategoriler'],
    queryFn: () => kategoriService.listele(),
    select: (data) => data.data,
    staleTime: 1000 * 60 * 10,
  });
}
