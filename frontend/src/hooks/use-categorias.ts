import { useQuery } from '@tanstack/react-query';
import { fetchCategorias } from '@/lib/api-client';
import type { Categoria } from '@/lib/api-types';

export function useCategorias(usuarioId?: number, tipo?: 'INGRESO' | 'GASTO') {
  return useQuery({
    queryKey: ['categorias', usuarioId, tipo],
    queryFn: async () => {
      const categorias = await fetchCategorias(usuarioId!);
      return tipo ? categorias.filter((c: Categoria) => c.tipo === tipo) : categorias;
    },
    enabled: (usuarioId ?? 0) > 0,
  });
}
