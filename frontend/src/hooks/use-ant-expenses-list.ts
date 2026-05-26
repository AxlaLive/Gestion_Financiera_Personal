import { useQuery } from '@tanstack/react-query';
import { fetchGastosHormigaLista } from '@/lib/api-client';

export function useAntExpensesList(usuarioId: number) {
  return useQuery({
    queryKey: ['ant-expenses-list', usuarioId],
    queryFn: () => fetchGastosHormigaLista(usuarioId),
    enabled: usuarioId > 0,
  });
}
