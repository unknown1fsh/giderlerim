import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ButceOlusturRequest } from '../types/butce.types';
import { ButceService } from '../services/butceService';

export function createButceHooks(butceService: ButceService) {
  function useButceler(ay: number, yil: number) {
    return useQuery({
      queryKey: ['butceler', ay, yil],
      queryFn: () => butceService.listele(ay, yil),
      select: (data) => data.data,
    });
  }

  function useButceOzetler(ay: number, yil: number) {
    return useQuery({
      queryKey: ['butce-ozetler', ay, yil],
      queryFn: () => butceService.ozet(ay, yil),
      select: (data) => data.data,
    });
  }

  function useButceEkle() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (data: ButceOlusturRequest) => butceService.olustur(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['butceler'] });
        queryClient.invalidateQueries({ queryKey: ['butce-ozetler'] });
      },
    });
  }

  function useButceSil() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: number) => butceService.sil(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['butceler'] });
        queryClient.invalidateQueries({ queryKey: ['butce-ozetler'] });
      },
    });
  }

  function useButceGuncelle() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, data }: { id: number; data: { limitTutar?: number; uyariYuzdesi?: number } }) =>
        butceService.guncelle(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['butceler'] });
        queryClient.invalidateQueries({ queryKey: ['butce-ozetler'] });
      },
    });
  }

  return { useButceler, useButceOzetler, useButceEkle, useButceSil, useButceGuncelle };
}
