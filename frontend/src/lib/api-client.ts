import type { Transaccion, BalanceResponse, Categoria, GastoCategoriaDTO } from './api-types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';

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
