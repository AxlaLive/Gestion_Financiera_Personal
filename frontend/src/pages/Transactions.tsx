import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowDownRight,
  ArrowUpRight,
  Filter,
  Search,
  X,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TransactionDetailDialog } from "@/components/TransactionDetailDialog";
import { EditTransactionDialog } from "@/components/EditTransactionDialog";
import { DeleteTransactionDialog } from "@/components/DeleteTransactionDialog";
import { CategoryIcon } from "@/components/CategoryIcon";
import { useTransactions, updateTransaction, deleteTransaction } from "@/features/transactions/store";
import { CATEGORIES } from "@/features/transactions/categories";
import type { Transaction, CategoryId, TransactionType } from "@/features/transactions/types";
import { formatDateShort, formatTime12h } from "@/features/transactions/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type DialogView = "none" | "detail" | "edit" | "delete";
type DateRange = "all" | "today" | "week" | "month";
type TypeFilter = TransactionType | "all";

const TYPE_TABS: { value: TypeFilter; label: string; icon?: typeof ArrowDownRight }[] = [
  { value: "all", label: "Todos" },
  { value: "income", label: "Ingresos", icon: ArrowDownRight },
  { value: "expense", label: "Gastos", icon: ArrowUpRight },
];

const RANGE_TABS: { value: DateRange; label: string }[] = [
  { value: "all", label: "Todo" },
  { value: "today", label: "Hoy" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
}

function parseISODate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function filterByDateRange(transactions: Transaction[], range: DateRange) {
  if (range === "all") return transactions;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const maxDays = range === "today" ? 0 : range === "week" ? 7 : 30;

  return transactions.filter((transaction) => {
    const date = parseISODate(transaction.date).getTime();
    const diffDays = Math.floor((today - date) / (1000 * 60 * 60 * 24));
    if (range === "today") return diffDays === 0;
    return diffDays >= 0 && diffDays < maxDays;
  });
}

function groupByDate(transactions: Transaction[]) {
  const groups: { dateKey: string; dateLabel: string; items: Transaction[] }[] = [];
  const sorted = [...transactions].sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    return dateCompare !== 0 ? dateCompare : b.time.localeCompare(a.time);
  });

  for (const transaction of sorted) {
    const last = groups[groups.length - 1];
    if (last && last.dateKey === transaction.date) {
      last.items.push(transaction);
    } else {
      groups.push({
        dateKey: transaction.date,
        dateLabel: formatDateShort(transaction.date),
        items: [transaction],
      });
    }
  }

  return groups;
}

export default function Transactions() {
  const navigate = useNavigate();
  const transactions = useTransactions();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryId | "all">("all");
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [view, setView] = useState<DialogView>("none");

  const activeFilters = [
    typeFilter !== "all",
    dateRange !== "all",
    categoryFilter !== "all",
  ].filter(Boolean).length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = filterByDateRange(transactions, dateRange);

    return base.filter((t) => {
      if (typeFilter !== "all" && t.type !== typeFilter) return false;
      if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
      if (q && !t.description.toLowerCase().includes(q) && !t.category.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [transactions, query, typeFilter, dateRange, categoryFilter]);

  const groups = useMemo(() => groupByDate(filtered), [filtered]);

  function openDetail(transaction: Transaction) {
    setSelected(transaction);
    setView("detail");
  }

  function handleEditClick(transaction: Transaction) {
    setSelected(transaction);
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
    setView("none");
    setSelected(null);
  }

  function handleConfirmDelete() {
    if (!selected) return;
    deleteTransaction(selected.id);
    setView("none");
    setSelected(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-28">
      <header className="rounded-b-[2rem] bg-gradient-to-br from-emerald-600 to-emerald-700 px-6 pb-12 pt-12 text-white shadow-lg">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition hover:bg-white/30 text-white"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div>
            <h1 className="text-lg font-bold">Historial</h1>
            <p className="text-sm text-white/80">
              Consulta y filtra tus ingresos y gastos.
            </p>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <button
                className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition hover:bg-white/30"
                aria-label="Filtros"
              >
                <Filter className="h-5 w-5" />
                {activeFilters > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                    {activeFilters}
                  </span>
                )}
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-sm">
              <SheetHeader>
                <SheetTitle>Filtrar movimientos</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-900">Categoría</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={categoryFilter === "all" ? "default" : "outline"}
                      className="cursor-pointer px-3 py-1.5 text-xs"
                      onClick={() => setCategoryFilter("all")}
                    >
                      Todas
                    </Badge>
                    {CATEGORIES.map((category) => (
                      <Badge
                        key={category.id}
                        variant={categoryFilter === category.id ? "default" : "outline"}
                        className="cursor-pointer px-3 py-1.5 text-xs"
                        onClick={() => setCategoryFilter(category.id)}
                      >
                        {category.label}
                      </Badge>
                    ))}
                  </div>
                </div>
                {activeFilters > 0 && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setCategoryFilter("all");
                      setDateRange("all");
                      setTypeFilter("all");
                    }}
                  >
                    <X className="h-4 w-4" /> Limpiar filtros
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="mx-auto mt-6 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar transacción..."
              className="h-12 rounded-xl border-0 bg-white pl-10 text-slate-900 shadow-sm placeholder:text-slate-400"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto -mt-6 max-w-2xl px-6">
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-white p-1.5 shadow-md">
          {TYPE_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = typeFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setTypeFilter(tab.value)}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition",
                  active
                    ? "bg-emerald-600 text-white shadow"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {RANGE_TABS.map((tab) => {
            const active = dateRange === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setDateRange(tab.value)}
                className={cn(
                  "rounded-lg border-2 px-4 py-1.5 text-xs font-medium transition",
                  active
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="mt-5 space-y-5">
          {groups.length === 0 && (
            <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
              {transactions.length === 0
                ? "Aún no hay movimientos registrados"
                : "No se encontraron transacciones."}
            </div>
          )}

          {groups.map((group) => (
            <section key={group.dateKey}>
              <h2 className="mb-2 px-1 text-sm font-semibold text-slate-500">
                {group.dateLabel}
              </h2>
              <div className="space-y-2">
                {group.items.map((transaction) => {
                  const isIncome = transaction.type === "income";
                  const categoryLabel =
                    CATEGORIES.find((category) => category.id === transaction.category)
                      ?.label ?? transaction.category;

                  return (
                    <Card
                      key={transaction.id}
                      className="cursor-pointer p-3 transition-shadow hover:shadow-md"
                      onClick={() => openDetail(transaction)}
                    >
                      <div className="flex items-center gap-3">
                        <CategoryIcon categoryId={transaction.category} size="md" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {transaction.description}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {categoryLabel} · {formatTime12h(transaction.time)}
                          </p>
                        </div>
                        <p
                          className={cn(
                            "text-sm font-bold tabular-nums",
                            isIncome ? "text-emerald-600" : "text-red-600"
                          )}
                        >
                          {isIncome ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>

      <Link
        to="/add-expense"
        className="fixed bottom-24 right-6 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl transition hover:bg-emerald-700 hover:shadow-2xl active:scale-95"
        aria-label="Agregar movimiento"
      >
        <Plus className="h-6 w-6" />
      </Link>

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
