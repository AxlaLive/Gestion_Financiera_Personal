export type TransactionType = "income" | "expense";

export type CategoryId =
  | "salario"
  | "freelance"
  | "compras"
  | "comida"
  | "transporte"
  | "cafes"
  | "salud"
  | "ocio"
  | "viajes"
  | "educacion"
  | "ropa"
  | "tecnologia"
  | "otros";

export interface Category {
  id: CategoryId;
  label: string;
  /** lucide-react icon name */
  icon: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  /** ISO time string (HH:mm) */
  time: string;
  category: CategoryId;
  description: string;
}
