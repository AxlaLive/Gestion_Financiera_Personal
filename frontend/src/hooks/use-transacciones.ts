import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTransacciones, crearTransaccion } from '@/lib/api-client';
import type { Transaccion } from '@/lib/api-types';

export function useTransacciones(usuarioId: number) {
  return useQuery({
    queryKey: ['transacciones', usuarioId],
    queryFn: () => fetchTransacciones(usuarioId),
    enabled: usuarioId > 0,
  });
}

export function useCrearTransaccion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transaccion: Transaccion) => crearTransaccion(transaccion),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transacciones', variables.usuario.id] });
      queryClient.invalidateQueries({ queryKey: ['balance', variables.usuario.id] });
    },
  });
}
