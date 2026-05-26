import { useMutation, useQueryClient } from '@tanstack/react-query';
import { actualizarLimiteGastoHormiga } from '@/lib/api-client';

export function useAntExpenseLimit(usuarioId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (limite: number) => actualizarLimiteGastoHormiga(usuarioId, limite),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ant-expenses-summary', usuarioId] });
      queryClient.invalidateQueries({ queryKey: ['ant-expenses-list', usuarioId] });
      queryClient.invalidateQueries({ queryKey: ['ant-expenses-history', usuarioId] });
    },
  });
}
