import { useSyncExternalStore } from "react";
import type { Transaction } from "./types";
import { INITIAL_TRANSACTIONS } from "./mockData";

/**
 * Tiny mock store for transactions (100% frontend, no backend)
 * Replace these functions with real API calls when integrating Spring Boot backend.
 */

let transactions: Transaction[] = [...INITIAL_TRANSACTIONS];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return transactions;
}

/**
 * Hook que retorna el array de transacciones actual
 * Se suscribe a cambios del store automáticamente
 */
export function useTransactions(): Transaction[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/**
 * Obtiene una transacción por su ID
 */
export function getTransactionById(id: string): Transaction | undefined {
  return transactions.find((t) => t.id === id);
}

/**
 * Actualiza una transacción existente (MOCK - en memoria)
 * Reemplazar con PUT /api/transactions/:id cuando se integre backend real
 */
export function updateTransaction(
  id: string,
  patch: Partial<Omit<Transaction, "id">>
) {
  transactions = transactions.map((t) => (t.id === id ? { ...t, ...patch } : t));
  emit();
}

/**
 * Elimina una transacción (MOCK - en memoria)
 * Reemplazar con DELETE /api/transactions/:id cuando se integre backend real
 */
export function deleteTransaction(id: string) {
  transactions = transactions.filter((t) => t.id !== id);
  emit();
}

/**
 * Crea una nueva transacción (MOCK - en memoria)
 * Reemplazar con POST /api/transactions cuando se integre backend real
 */
export function createTransaction(transaction: Omit<Transaction, "id">): Transaction {
  const newTransaction: Transaction = {
    ...transaction,
    id: Date.now().toString(),
  };
  transactions = [...transactions, newTransaction];
  emit();
  return newTransaction;
}

/**
 * Resetea todas las transacciones a los datos iniciales
 * Útil para testing o reset
 */
export function resetTransactions() {
  transactions = [...INITIAL_TRANSACTIONS];
  emit();
}
