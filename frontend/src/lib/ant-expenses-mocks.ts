// MOCK temporal para HU-21 (Gastos hormiga) mientras el backend implementa
// los endpoints. Activar con: VITE_MOCK_ANT_EXPENSES=true en .env.local
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

// Gastos del mes que no son hormiga (monto >= tope configurado)
const GASTOS_GRANDES_MOCK: Transaccion[] = [
  { id: 100, monto: 320000, descripcion: 'Bicicleta', fecha: '2026-05-10', tipo: 'GASTO', usuario: { id: 1 }, categoria: { id: 6, nombre: 'Ocio' } },
  { id: 101, monto: 180000, descripcion: 'Mercado del mes', fecha: '2026-05-05', tipo: 'GASTO', usuario: { id: 1 }, categoria: { id: 1, nombre: 'Comida' } },
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

function etiquetaTransaccion(t: Transaccion): string {
  return t.descripcion?.trim() || t.categoria?.nombre || 'un gasto grande';
}

function formatearPesos(valor: number): string {
  return valor.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
}

function generarRecomendacion(limite: number, cantidad: number, acumulado: number, porcentaje: number): string {
  if (acumulado === 0) {
    return 'No se encontraron gastos hormiga este mes. Buen trabajo manteniendo el control.';
  }

  const gastosGrandes = GASTOS_GRANDES_MOCK.filter((t) => t.monto >= limite)
    .sort((a, b) => b.monto - a.monto);

  for (const gasto of gastosGrandes) {
    if (acumulado < gasto.monto) continue;

    const etiqueta = etiquetaTransaccion(gasto);
    const veces = Math.floor(acumulado / gasto.monto);
    if (veces >= 2) {
      return `Este mes acumulaste ${formatearPesos(acumulado)} en ${cantidad} gastos hormiga. Con ese dinero podrías haber cubierto ${veces} veces «${etiqueta}» (${formatearPesos(gasto.monto)}).`;
    }
    return `Este mes acumulaste ${formatearPesos(acumulado)} en ${cantidad} gastos hormiga. Eso equivale a lo que gastaste en «${etiqueta}» (${formatearPesos(gasto.monto)}).`;
  }

  if (gastosGrandes.length > 0) {
    const mayor = gastosGrandes[0];
    const faltante = mayor.monto - acumulado;
    return `Llevas ${formatearPesos(acumulado)} en ${cantidad} gastos hormiga. Te faltan ${formatearPesos(faltante)} para igualar tu mayor gasto del mes: «${etiquetaTransaccion(mayor)}» (${formatearPesos(mayor.monto)}).`;
  }

  if (porcentaje >= 30) {
    return `Tus gastos hormiga representan un ${Math.round(porcentaje)}% del gasto total del mes. Revisa las pequeñas compras frecuentes.`;
  }

  return 'Tus gastos hormiga están bajo control. Sigue atento a los pequeños desembolsos para mantener ese ahorro.';
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
    recomendacion: generarRecomendacion(limite, hormigas.length, acumulado, porcentaje),
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
