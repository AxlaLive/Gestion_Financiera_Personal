import type {
  Transaccion,
  BalanceResponse,
  Categoria,
  GastoCategoriaDTO,
  GastoPorCategoriaDTO,
  GastoHormigaResumen,
  GastoHormigaHistoricoMes,
} from './api-types';
import {
  mockGastoHormigaResumen,
  mockGastosHormigaLista,
  mockGastoHormigaHistorico,
  mockActualizarLimite,
} from './ant-expenses-mocks';
import {
  API_BASE_URL,
  clearAuthSession,
  getAuthHeaders,
  shouldHandleUnauthorized,
} from './api-config';

const USE_ANT_EXPENSES_MOCK = import.meta.env.VITE_MOCK_ANT_EXPENSES === 'true';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;

  const res = await fetch(url, {
    ...options,
    headers: getAuthHeaders(options?.headers),
  });

  if (res.status === 401) {
    if (shouldHandleUnauthorized(path)) {
      clearAuthSession({ redirect: true });
    }
    throw new Error('Sesión expirada o no autorizada');
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `Error ${res.status}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

export function fetchBalance(usuarioId: number): Promise<BalanceResponse> {
  return request<BalanceResponse>(`/balance/usuario/${usuarioId}`);
}

export function fetchTransacciones(usuarioId: number): Promise<Transaccion[]> {
  return request<Transaccion[]>(`/transacciones/usuario/${usuarioId}`);
}

export function fetchCategorias(usuarioId: number): Promise<Categoria[]> {
  return request<Categoria[]>(`/categorias/usuario/${usuarioId}`);
}

export function crearTransaccion(transaccion: Transaccion): Promise<Transaccion> {
  return request<Transaccion>('/transacciones', {
    method: 'POST',
    body: JSON.stringify(transaccion),
  });
}

export function fetchResumenGastosMesActual(usuarioId: number): Promise<GastoCategoriaDTO[]> {
  return request<GastoCategoriaDTO[]>(`/transacciones/usuario/${usuarioId}/resumen-gastos`);
}

export function fetchGastosPorCategoriaMesActual(usuarioId: number): Promise<GastoPorCategoriaDTO[]> {
  return request<GastoPorCategoriaDTO[]>(`/estadisticas/gastos-por-categoria?usuarioId=${usuarioId}`);
}

export function fetchGastoHormigaResumen(usuarioId: number): Promise<GastoHormigaResumen> {
  if (USE_ANT_EXPENSES_MOCK) return mockGastoHormigaResumen();
  return request<GastoHormigaResumen>(`/usuarios/${usuarioId}/gastos-hormiga/resumen`);
}

export function fetchGastosHormigaLista(usuarioId: number): Promise<Transaccion[]> {
  if (USE_ANT_EXPENSES_MOCK) return mockGastosHormigaLista();
  return request<Transaccion[]>(`/usuarios/${usuarioId}/gastos-hormiga`);
}

export function fetchGastoHormigaHistorico(
  usuarioId: number,
  meses: number = 6,
): Promise<GastoHormigaHistoricoMes[]> {
  if (USE_ANT_EXPENSES_MOCK) return mockGastoHormigaHistorico(meses);
  return request<GastoHormigaHistoricoMes[]>(
    `/usuarios/${usuarioId}/gastos-hormiga/historico?meses=${meses}`,
  );
}

export function actualizarLimiteGastoHormiga(
  usuarioId: number,
  limite: number,
): Promise<GastoHormigaResumen> {
  if (USE_ANT_EXPENSES_MOCK) return mockActualizarLimite(limite);
  return request<GastoHormigaResumen>(`/usuarios/${usuarioId}/gastos-hormiga/limite`, {
    method: 'PUT',
    body: JSON.stringify({ limite }),
  });
}
