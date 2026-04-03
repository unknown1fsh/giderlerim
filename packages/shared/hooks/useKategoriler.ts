import { useQuery } from '@tanstack/react-query';
import { KategoriService } from '../services/kategoriService';

export function createKategoriHooks(kategoriService: KategoriService) {
  function useKategoriler() {
    return useQuery({
      queryKey: ['kategoriler'],
      queryFn: () => kategoriService.listele(),
      select: (data) => data.data,
      staleTime: 1000 * 60 * 10,
    });
  }

  return { useKategoriler };
}
