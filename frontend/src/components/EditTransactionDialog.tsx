import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, X } from "lucide-react";
import { CategoryIcon } from "./CategoryIcon";
import { getCategory, CATEGORIES } from "@/features/transactions/categories";
import type { Transaction, CategoryId } from "@/features/transactions/types";

interface EditTransactionDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    amount: number;
    date: string;
    time: string;
    category: CategoryId;
    description: string;
  }) => void;
  onRequestDelete?: () => void;
}

export function EditTransactionDialog({
  transaction,
  open,
  onOpenChange,
  onSubmit,
  onRequestDelete,
}: EditTransactionDialogProps) {
  const [amount, setAmount] = useState(transaction?.amount.toString() ?? "");
  const [date, setDate] = useState(transaction?.date ?? "");
  const [time, setTime] = useState(transaction?.time ?? "");
  const [category, setCategory] = useState<CategoryId>(transaction?.category ?? "otros");
  const [description, setDescription] = useState(transaction?.description ?? "");

  // Update local state when transaction prop changes
  useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount.toString());
      setDate(transaction.date);
      setTime(transaction.time);
      setCategory(transaction.category);
      setDescription(transaction.description);
    }
  }, [transaction]);

  if (!transaction) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("El monto debe ser un número positivo");
      return;
    }

    if (!date || !time || !category || !description.trim()) {
      alert("Todos los campos son requeridos");
      return;
    }

    onSubmit({
      amount: parsedAmount,
      date,
      time,
      category,
      description: description.trim(),
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
          <DialogTitle className="text-base font-bold">Editar Movimiento</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Monto */}
          <div className="space-y-2">
            <Label htmlFor="amount">Monto</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="text-lg font-semibold"
            />
          </div>

          {/* Fecha */}
          <div className="space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Hora */}
          <div className="space-y-2">
            <Label htmlFor="time">Hora</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryId)}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción del movimiento"
              maxLength={100}
            />
          </div>

          <DialogFooter className="flex gap-2 border-t pt-4">
            {onRequestDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={onRequestDelete}
                className="mr-auto"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
