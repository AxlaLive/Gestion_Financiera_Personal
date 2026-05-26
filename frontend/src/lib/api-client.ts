import type {
  Transaccion,
  BalanceResponse,
  Categoria,
  GastoCategoriaDTO,
  GastoHormigaResumen,
  GastoHormigaHistoricoMes,
} from './api-types';
import {
  mockGastoHormigaResumen,
  mockGastosHormigaLista,
  mockGastoHormigaHistorico,
  mockActualizarLimite,
} from './ant-expenses-mocks';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';

// HU-21: mock activo hasta que el backend implemente los endpoints.
// Desactivar con VITE_MOCK_ANT_EXPENSES=false en .env.local.
const USE_ANT_EXPENSES_MOCK = import.meta.env.VITE_MOCK_ANT_EXPENSES !== 'false';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  // Aseguramos que el path comience con /
  const url = `${API_BASE_URL.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;

  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `Error ${res.status}`);
  }

  return res.json();
}

// HU-14: Balance del usuario
export function fetchBalance(usuarioId: number): Promise<BalanceResponse> {
  return request<BalanceResponse>(`/balance/usuario/${usuarioId}`);
}

// HU-06/07: Historial de transacciones
export function fetchTransacciones(usuarioId: number): Promise<Transaccion[]> {
  return request<Transaccion[]>(`/transacciones/usuario/${usuarioId}`);
}

// Categorías por usuario
export function fetchCategorias(usuarioId: number): Promise<Categoria[]> {
  return request<Categoria[]>(`/categorias/usuario/${usuarioId}`);
}

// HU-06/07: Crear transacción (ingreso o gasto)
export function crearTransaccion(transaccion: Transaccion): Promise<Transaccion> {
  return request<Transaccion>('/transacciones', {
    method: 'POST',
    body: JSON.stringify(transaccion),
  });
}

export function fetchResumenGastosMesActual(usuarioId: number): Promise<GastoCategoriaDTO[]> {
  return request<GastoCategoriaDTO[]>(`/transacciones/usuario/${usuarioId}/resumen-gastos`);
}

// HU-21: Resumen + recomendación de gastos hormiga
export function fetchGastoHormigaResumen(usuarioId: number): Promise<GastoHormigaResumen> {
  if (USE_ANT_EXPENSES_MOCK) return mockGastoHormigaResumen();
  return request<GastoHormigaResumen>(`/usuarios/${usuarioId}/gastos-hormiga/resumen`);
}

// HU-21: Lista de transacciones clasificadas como gasto hormiga
export function fetchGastosHormigaLista(usuarioId: number): Promise<Transaccion[]> {
  if (USE_ANT_EXPENSES_MOCK) return mockGastosHormigaLista();
  return request<Transaccion[]>(`/usuarios/${usuarioId}/gastos-hormiga`);
}

// HU-21: Histórico mensual de gastos hormiga
export function fetchGastoHormigaHistorico(
  usuarioId: number,
  meses: number = 6,
): Promise<GastoHormigaHistoricoMes[]> {
  if (USE_ANT_EXPENSES_MOCK) return mockGastoHormigaHistorico(meses);
  return request<GastoHormigaHistoricoMes[]>(
    `/usuarios/${usuarioId}/gastos-hormiga/historico?meses=${meses}`,
  );
}

// HU-21: Actualizar el límite de gasto hormiga del usuario
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
