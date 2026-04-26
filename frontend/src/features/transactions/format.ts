import type { Transaction, TransactionType } from "./types";
import { getCategory } from "./categories";

/**
 * Formatea una fecha ISO (YYYY-MM-DD) a formato legible en español
 * Ejemplo: "2026-04-25" → "25 de abril de 2026"
 */
export function formatDateLong(dateString: string): string {
  const date = new Date(dateString + "T00:00:00");
  const formatter = new Intl.DateTimeFormat("es-MX", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  return formatter.format(date);
}

/**
 * Formatea una fecha ISO (YYYY-MM-DD) a formato corto en español
 * Ejemplo: "2026-04-25" → "25 de abril"
 */
export function formatDateShort(dateString: string): string {
  const date = new Date(dateString + "T00:00:00");
  const formatter = new Intl.DateTimeFormat("es-MX", {
    month: "long",
    day: "numeric",
  });
  return formatter.format(date);
}

/**
 * Formatea una hora ISO (HH:mm) a formato de 12 horas con AM/PM
 * Ejemplo: "19:00" → "7:00 PM"
 */
export function formatTime12h(timeString: string): string {
  const [hours, minutes] = timeString.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

/**
 * Formatea una cantidad monetaria con signo (+ para ingreso, - para gasto)
 * Ejemplo: (1250, "income") → "+$1,250.00"
 * Ejemplo: (850.5, "expense") → "-$850.50"
 */
export function formatSignedAmount(amount: number, type: TransactionType): string {
  const sign = type === "income" ? "+" : "-";
  const formatted = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${sign}${formatted}`;
}

/**
 * Formatea una cantidad monetaria sin signo
 * Ejemplo: 1250 → "$1,250"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Obtiene la categoría completa por su ID
 */
export function getCategoryById(categoryId: string) {
  return getCategory(categoryId);
}

/**
 * Formatea una transacción completa para mostrar
 */
export function formatTransactionSummary(transaction: Transaction): string {
  const category = getCategoryById(transaction.category);
  const categoryLabel = category?.label || transaction.category;
  const amount = formatSignedAmount(transaction.amount, transaction.type);
  return `${categoryLabel}: ${amount}`;
}
