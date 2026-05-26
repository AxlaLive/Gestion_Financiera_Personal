import { useQuery } from '@tanstack/react-query';
import { fetchGastoHormigaResumen } from '@/lib/api-client';

export function useAntExpensesSummary(usuarioId: number) {
  return useQuery({
    queryKey: ['ant-expenses-summary', usuarioId],
    queryFn: () => fetchGastoHormigaResumen(usuarioId),
    enabled: usuarioId > 0,
  });
}
