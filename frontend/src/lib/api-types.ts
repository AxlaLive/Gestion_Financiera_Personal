// Tipos que coinciden con las entidades Java del backend

export interface Usuario {
  id: number;
  correo: string;
  password?: string;
  nombre: string;
  moneda: string;
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
}

export interface BalanceResponse {
  monto: number;
  color: string;   // "Verde Esmeralda" | "Rojo Alerta" | "Gris" | "Gris/Negro"
  mensaje: string;
}
