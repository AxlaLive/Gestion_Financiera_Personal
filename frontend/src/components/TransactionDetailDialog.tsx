import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, X } from "lucide-react";
import { CategoryIcon } from "./CategoryIcon";
import { formatSignedAmount, formatDateLong, formatTime12h } from "@/features/transactions/format";
import { getCategory } from "@/features/transactions/categories";
import type { Transaction } from "@/features/transactions/types";
import { cn } from "@/lib/utils";

interface TransactionDetailDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (transaction: Transaction) => void;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/60 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

export function TransactionDetailDialog({
  transaction,
  open,
  onOpenChange,
  onEdit,
}: TransactionDetailDialogProps) {
  if (!transaction) return null;

  const category = getCategory(transaction.category);
  const isIncome = transaction.type === "income";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <DialogHeader className="border-b border-border px-5 py-4 flex flex-row items-center justify-between">
          <DialogTitle className="text-base font-bold">Detalle del Movimiento</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="px-5 py-5">
          <div className="flex flex-col items-center text-center">
            <CategoryIcon categoryId={transaction.category} size="lg" />
            <p
              className={cn(
                "mt-3 text-3xl font-extrabold tabular-nums",
                isIncome ? "text-green-600" : "text-red-600"
              )}
            >
              {formatSignedAmount(transaction.amount, transaction.type)}
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {category?.label}
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <Field label="Descripción" value={transaction.description} />
            <Field label="Fecha" value={formatDateLong(transaction.date)} />
            <Field label="Hora" value={formatTime12h(transaction.time)} />
            <Field label="Tipo" value={isIncome ? "Ingreso" : "Gasto"} />
            <Field label="ID" value={transaction.id} />
          </div>

          {onEdit && (
            <Button
              onClick={() => onEdit(transaction)}
              variant="outline"
              className="mt-6 w-full"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
