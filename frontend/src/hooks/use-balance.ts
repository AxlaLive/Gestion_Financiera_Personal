import { useQuery } from '@tanstack/react-query';
import { fetchBalance } from '@/lib/api-client';

export function useBalance(usuarioId: number) {
  return useQuery({
    queryKey: ['balance', usuarioId],
    queryFn: () => fetchBalance(usuarioId),
    enabled: usuarioId > 0,
  });
}
