import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UyariService } from '../services/uyariService';

export function createUyariHooks(uyariService: UyariService) {
  function useUyarilar() {
    return useQuery({
      queryKey: ['uyarilar'],
      queryFn: () => uyariService.listele(),
      select: (data) => data.data.icerik,
    });
  }

  function useUyariSayac() {
    return useQuery({
      queryKey: ['uyari-sayac'],
      queryFn: () => uyariService.sayac(),
      select: (data) => data.data,
      refetchInterval: 1000 * 60,
    });
  }

  function useUyariOkundu() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: number) => uyariService.okunduIsaretle(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['uyarilar'] });
        queryClient.invalidateQueries({ queryKey: ['uyari-sayac'] });
      },
    });
  }

  function useUyariTumunuOkundu() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: () => uyariService.tumunuOkunduIsaretle(),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['uyarilar'] });
        queryClient.invalidateQueries({ queryKey: ['uyari-sayac'] });
      },
    });
  }

  function useUyariSil() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: number) => uyariService.sil(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['uyarilar'] });
        queryClient.invalidateQueries({ queryKey: ['uyari-sayac'] });
      },
    });
  }

  return { useUyarilar, useUyariSayac, useUyariOkundu, useUyariTumunuOkundu, useUyariSil };
}
