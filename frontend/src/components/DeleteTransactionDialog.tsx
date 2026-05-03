import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";
import { CategoryIcon } from "./CategoryIcon";
import { formatSignedAmount } from "@/features/transactions/format";
import { getCategory } from "@/features/transactions/categories";
import type { Transaction } from "@/features/transactions/types";

interface DeleteTransactionDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteTransactionDialog({
  transaction,
  open,
  onOpenChange,
  onConfirm,
}: DeleteTransactionDialogProps) {
  if (!transaction) return null;

  const category = getCategory(transaction.category);
  const isIncome = transaction.type === "income";

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Eliminar Movimiento
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            ¿Estás seguro de que deseas eliminar este movimiento? Esta acción no se puede deshacer.
          </p>

          <div className="flex items-center gap-3 rounded-lg bg-muted/60 p-3">
            <CategoryIcon categoryId={transaction.category} size="md" />
            <div className="flex-1">
              <p className="font-semibold text-sm">{category?.label}</p>
              <p className="text-xs text-muted-foreground truncate">
                {transaction.description}
              </p>
            </div>
            <span
              className={`font-bold text-sm whitespace-nowrap ${
                isIncome ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatSignedAmount(transaction.amount, transaction.type)}
            </span>
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Sí, eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
