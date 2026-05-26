// Tipos que coinciden con las entidades Java del backend

export interface Usuario {
  id: number;
  correo: string;
  password?: string;
  nombre: string;
  moneda: string;
  gastoHormigaLimite?: number | null;
}

export interface Categoria {
  id: number;
  nombre: string;
  tipo: 'INGRESO' | 'GASTO';
  usuario?: { id: number };
}

export interface Transaccion {
  id?: number;
  monto: number;
  descripcion: string;
  fecha: string; // "yyyy-MM-dd" (LocalDate en Java)
  tipo: 'INGRESO' | 'GASTO';
  usuario: { id: number };
  categoria?: { id: number; nombre?: string };
  categoriaId?: number;
  categoriaNombre?: string;
  esGastoHormiga?: boolean;
}

export interface GastoCategoriaDTO {
  categoriaNombre: string;
  montoTotal: number;
}

export interface BalanceResponse {
  monto: number;
  color: string;   // "Verde Esmeralda" | "Rojo Alerta" | "Gris" | "Gris/Negro"
  mensaje: string;
}

// HU-21: Gastos hormiga
export interface GastoHormigaResumen {
  limite: number | null;
  acumuladoMes: number;
  cantidadTransacciones: number;
  totalGastosMes: number;
  porcentajeDelTotal: number;
  recomendacion: string;
}

export interface GastoHormigaHistoricoMes {
  mes: string; // "YYYY-MM"
  total: number;
  cantidad: number;
}
