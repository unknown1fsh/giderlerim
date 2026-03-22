import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { giderService } from '@/services/giderService';
import { GiderFiltre, GiderOlusturRequest } from '@/types/gider.types';

export function useGiderler(filtre: GiderFiltre = {}) {
  return useQuery({
    queryKey: ['giderler', filtre],
    queryFn: () => giderService.listele(filtre),
    select: (data) => data.data,
  });
}

export function useGiderEkle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GiderOlusturRequest) => giderService.olustur(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giderler'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['uyarilar'] });
    },
  });
}

export function useGiderSil() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => giderService.sil(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giderler'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
