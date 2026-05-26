import { useQuery } from '@tanstack/react-query';
import { fetchGastoHormigaHistorico } from '@/lib/api-client';

export function useAntExpensesHistory(usuarioId: number, meses: number = 6) {
  return useQuery({
    queryKey: ['ant-expenses-history', usuarioId, meses],
    queryFn: () => fetchGastoHormigaHistorico(usuarioId, meses),
    enabled: usuarioId > 0,
  });
}
