import { useState, useMemo } from "react";
import { Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { Transaction, CategoryId } from "@/features/transactions/types";
import { TransactionRow } from "@/components/TransactionRow";
import { TransactionDetailDialog } from "@/components/TransactionDetailDialog";
import { EditTransactionDialog } from "@/components/EditTransactionDialog";
import { DeleteTransactionDialog } from "@/components/DeleteTransactionDialog";
import { useTransactions, updateTransaction, deleteTransaction } from "@/features/transactions/store";
import { formatDateShort } from "@/features/transactions/format";

type DialogView = "none" | "detail" | "edit" | "delete";

export default function Transactions() {
  const navigate = useNavigate();
  const transactions = useTransactions();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [view, setView] = useState<DialogView>("none");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return transactions;

    return transactions.filter(
      (t) =>
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );
  }, [transactions, query]);

  const grouped = useMemo(() => {
    const groups: { date: string; dateLabel: string; items: Transaction[] }[] = [];
    const sorted = [...filtered].sort((a, b) => {
      const d = b.date.localeCompare(a.date);
      return d !== 0 ? d : b.time.localeCompare(a.time);
    });

    for (const t of sorted) {
      const last = groups[groups.length - 1];
      if (last && last.date === t.date) {
        last.items.push(t);
      } else {
        groups.push({ date: t.date, dateLabel: formatDateShort(t.date), items: [t] });
      }
    }
    return groups;
  }, [filtered]);

  function openDetail(t: Transaction) {
    setSelected(t);
    setView("detail");
  }

  function handleEditClick(t: Transaction) {
    setSelected(t);
    setView("edit");
  }

  function handleSubmitEdit(patch: {
    amount: number;
    date: string;
    time: string;
    category: CategoryId;
    description: string;
  }) {
    if (!selected) return;
    updateTransaction(selected.id, patch);
    toast.success("Transacción actualizada", {
      description: "Los cambios se han guardado.",
    });
    setView("none");
    setSelected(null);
  }

  function handleConfirmDelete() {
    if (!selected) return;
    deleteTransaction(selected.id);
    toast.success("Transacción eliminada", {
      description: "El registro fue removido del historial.",
    });
    setView("none");
    setSelected(null);
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-6 text-white">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="hover:bg-white/20 text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Historial de Movimientos</h1>
              <p className="text-sm opacity-90">
                Ordenado de más reciente a más antigua
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-4">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por categoría o descripción..."
            className="h-10 rounded-full bg-card pl-9 text-sm shadow-sm border-input"
          />
        </div>

        {/* Transactions Groups */}
        <section className="space-y-4">
          {grouped.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No se encontraron transacciones.
              </p>
            </Card>
          ) : (
            grouped.map((group) => (
              <div key={group.date}>
                <div className="mb-2 px-3 py-1.5 text-xs font-medium text-muted-foreground bg-muted/60 rounded-lg">
                  {group.dateLabel}
                </div>
                <div className="space-y-2">
                  {group.items.map((transaction) => (
                    <TransactionRow
                      key={transaction.id}
                      transaction={transaction}
                      onClick={openDetail}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </section>
      </main>

      {/* Diálogos */}
      <TransactionDetailDialog
        transaction={selected}
        open={view === "detail"}
        onOpenChange={(o) => {
          if (!o) {
            setView("none");
            setSelected(null);
          }
        }}
        onEdit={handleEditClick}
      />

      <EditTransactionDialog
        transaction={selected}
        open={view === "edit"}
        onOpenChange={(o) => {
          if (!o) {
            setView("none");
            setSelected(null);
          }
        }}
        onSubmit={handleSubmitEdit}
        onRequestDelete={() => setView("delete")}
      />

      <DeleteTransactionDialog
        transaction={selected}
        open={view === "delete"}
        onOpenChange={(o) => {
          if (!o) setView("edit");
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
