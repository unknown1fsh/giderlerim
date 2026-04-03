import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { GiderFiltre, GiderOlusturRequest } from '../types/gider.types';
import { GiderService } from '../services/giderService';

export function createGiderHooks(giderService: GiderService) {
  function useGiderler(filtre: GiderFiltre = {}) {
    return useQuery({
      queryKey: ['giderler', filtre],
      queryFn: () => giderService.listele(filtre),
      select: (data) => data.data,
    });
  }

  function useGiderEkle() {
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

  function useGiderSil() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: number) => giderService.sil(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['giderler'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      },
    });
  }

  function useGiderGuncelle() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, data }: { id: number; data: Partial<GiderOlusturRequest> }) =>
        giderService.guncelle(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['giderler'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      },
    });
  }

  return { useGiderler, useGiderEkle, useGiderSil, useGiderGuncelle };
}
