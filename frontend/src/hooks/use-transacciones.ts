import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTransacciones, crearTransaccion, fetchResumenGastosMesActual } from '@/lib/api-client';
import type { Transaccion, GastoCategoriaDTO } from '@/lib/api-types';

export function useTransacciones(usuarioId?: number) {
  return useQuery({
    queryKey: ['transacciones', usuarioId],
    queryFn: () => fetchTransacciones(usuarioId!),
    enabled: (usuarioId ?? 0) > 0,
  });
}

export function useCrearTransaccion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transaccion: Transaccion) => crearTransaccion(transaccion),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transacciones', variables.usuario.id] });
      queryClient.invalidateQueries({ queryKey: ['balance', variables.usuario.id] });
      queryClient.invalidateQueries({ queryKey: ['resumenGastosMesActual', variables.usuario.id] });
    },
  });
}

export function useResumenGastosMesActual(usuarioId?: number) {
  return useQuery({
    queryKey: ['resumenGastosMesActual', usuarioId],
    queryFn: () => fetchResumenGastosMesActual(usuarioId!),
    enabled: (usuarioId ?? 0) > 0,
  });
}
