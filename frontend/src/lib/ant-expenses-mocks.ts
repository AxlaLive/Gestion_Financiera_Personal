// MOCK temporal para HU-21 (Gastos hormiga) mientras el backend implementa
// los endpoints. Desactivar con: VITE_MOCK_ANT_EXPENSES=false en .env.local
import type {
  GastoHormigaResumen,
  GastoHormigaHistoricoMes,
  Transaccion,
} from './api-types';

const STORAGE_KEY_LIMITE = 'mock_gasto_hormiga_limite';
const TOTAL_GASTOS_MES_MOCK = 850000;

// Transacciones simuladas del mes actual (todas tipo GASTO con montos bajos)
const TRANSACCIONES_MOCK: Transaccion[] = [
  { id: 1, monto: 5000, descripcion: 'Café de la tarde', fecha: '2026-05-22', tipo: 'GASTO', usuario: { id: 1 }, categoria: { id: 11, nombre: 'Cafes' } },
  { id: 2, monto: 3500, descripcion: 'Snack en la tienda', fecha: '2026-05-22', tipo: 'GASTO', usuario: { id: 1 }, categoria: { id: 1, nombre: 'Comida' } },
  { id: 3, monto: 2800, descripcion: 'Bus al trabajo', fecha: '2026-05-22', tipo: 'GASTO', usuario: { id: 1 }, categoria: { id: 2, nombre: 'Transporte' } },
  { id: 4, monto: 4200, descripcion: 'Helado de chocolate', fecha: '2026-05-21', tipo: 'GASTO', usuario: { id: 1 }, categoria: { id: 1, nombre: 'Comida' } },
  { id: 5, monto: 3000, descripcion: 'Bebida del almuerzo', fecha: '2026-05-21', tipo: 'GASTO', usuario: { id: 1 }, categoria: { id: 1, nombre: 'Comida' } },
  { id: 6, monto: 2800, descripcion: 'Bus de regreso', fecha: '2026-05-21', tipo: 'GASTO', usuario: { id: 1 }, categoria: { id: 2, nombre: 'Transporte' } },
  { id: 7, monto: 6000, descripcion: 'Empanadas en la esquina', fecha: '2026-05-20', tipo: 'GASTO', usuario: { id: 1 }, categoria: { id: 1, nombre: 'Comida' } },
  { id: 8, monto: 4500, descripcion: 'Café con el equipo', fecha: '2026-05-20', tipo: 'GASTO', usuario: { id: 1 }, categoria: { id: 11, nombre: 'Cafes' } },
  { id: 9, monto: 2500, descripcion: 'Galletas de la tarde', fecha: '2026-05-19', tipo: 'GASTO', usuario: { id: 1 }, categoria: { id: 1, nombre: 'Comida' } },
  { id: 10, monto: 2800, descripcion: 'Bus al trabajo', fecha: '2026-05-19', tipo: 'GASTO', usuario: { id: 1 }, categoria: { id: 2, nombre: 'Transporte' } },
  { id: 11, monto: 7000, descripcion: 'Cerveza con amigos', fecha: '2026-05-17', tipo: 'GASTO', usuario: { id: 1 }, categoria: { id: 6, nombre: 'Ocio' } },
  { id: 12, monto: 8000, descripcion: 'Taxi de noche', fecha: '2026-05-16', tipo: 'GASTO', usuario: { id: 1 }, categoria: { id: 2, nombre: 'Transporte' } },
  { id: 13, monto: 2800, descripcion: 'Bus al trabajo', fecha: '2026-05-15', tipo: 'GASTO', usuario: { id: 1 }, categoria: { id: 2, nombre: 'Transporte' } },
  { id: 14, monto: 3800, descripcion: 'Snack de media tarde', fecha: '2026-05-14', tipo: 'GASTO', usuario: { id: 1 }, categoria: { id: 1, nombre: 'Comida' } },
  { id: 15, monto: 2500, descripcion: 'Botella de agua', fecha: '2026-05-13', tipo: 'GASTO', usuario: { id: 1 }, categoria: { id: 1, nombre: 'Comida' } },
];

const HISTORICO_MOCK: GastoHormigaHistoricoMes[] = [
  { mes: '2025-12', total: 72000, cantidad: 18 },
  { mes: '2026-01', total: 85000, cantidad: 22 },
  { mes: '2026-02', total: 54000, cantidad: 14 },
  { mes: '2026-03', total: 63000, cantidad: 16 },
  { mes: '2026-04', total: 90000, cantidad: 23 },
  { mes: '2026-05', total: 0, cantidad: 0 }, // se recalcula según el límite
];

function leerLimite(): number | null {
  const raw = localStorage.getItem(STORAGE_KEY_LIMITE);
  if (!raw) return null;
  const parsed = parseFloat(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function generarRecomendacion(porcentaje: number, acumulado: number): string {
  if (porcentaje < 5) {
    return 'Vas muy bien. Tus gastos hormiga están controlados y representan una pequeña parte de tu gasto total.';
  }
  if (porcentaje < 15) {
    return 'Tus gastos hormiga están en un rango saludable. Sigue prestando atención a las pequeñas compras del día a día.';
  }
  if (porcentaje < 25) {
    const formatted = acumulado.toLocaleString('es-CO');
    return `Considera revisar estos gastos pequeños. Suman $${formatted} este mes y podrías destinarlos a ahorro.`;
  }
  return 'Alerta: tus gastos hormiga representan una parte significativa de tu gasto total. Es momento de revisar tus hábitos.';
}

function calcularResumen(limite: number | null): GastoHormigaResumen {
  if (limite == null) {
    return {
      limite: null,
      acumuladoMes: 0,
      cantidadTransacciones: 0,
      totalGastosMes: TOTAL_GASTOS_MES_MOCK,
      porcentajeDelTotal: 0,
      recomendacion: '',
    };
  }
  const hormigas = TRANSACCIONES_MOCK.filter((t) => t.monto < limite);
  const acumulado = hormigas.reduce((acc, t) => acc + t.monto, 0);
  const porcentaje = TOTAL_GASTOS_MES_MOCK > 0
    ? (acumulado / TOTAL_GASTOS_MES_MOCK) * 100
    : 0;
  return {
    limite,
    acumuladoMes: acumulado,
    cantidadTransacciones: hormigas.length,
    totalGastosMes: TOTAL_GASTOS_MES_MOCK,
    porcentajeDelTotal: porcentaje,
    recomendacion: generarRecomendacion(porcentaje, acumulado),
  };
}

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function mockGastoHormigaResumen(): Promise<GastoHormigaResumen> {
  return delay(calcularResumen(leerLimite()));
}

export function mockGastosHormigaLista(): Promise<Transaccion[]> {
  const limite = leerLimite();
  if (limite == null) return delay([]);
  const lista = TRANSACCIONES_MOCK
    .filter((t) => t.monto < limite)
    .map((t) => ({ ...t, esGastoHormiga: true }))
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
  return delay(lista);
}

export function mockGastoHormigaHistorico(meses: number): Promise<GastoHormigaHistoricoMes[]> {
  const resumen = calcularResumen(leerLimite());
  const historico = HISTORICO_MOCK.map((m) =>
    m.mes === '2026-05'
      ? { mes: m.mes, total: resumen.acumuladoMes, cantidad: resumen.cantidadTransacciones }
      : m,
  );
  return delay(historico.slice(-meses));
}

export function mockActualizarLimite(limite: number): Promise<GastoHormigaResumen> {
  localStorage.setItem(STORAGE_KEY_LIMITE, String(limite));
  return delay(calcularResumen(limite));
}
