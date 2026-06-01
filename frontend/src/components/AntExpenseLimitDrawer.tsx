import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { parseAmountInput, isValidAmount, formatCurrency } from '@/lib/currency';
import { useAntExpenseLimit } from '@/hooks/use-ant-expense-limit';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AntExpenseLimitDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuarioId: number;
  currentLimit?: number | null;
}

const SUGERENCIAS = [5000, 10000, 20000];

export function AntExpenseLimitDrawer({
  open,
  onOpenChange,
  usuarioId,
  currentLimit,
}: AntExpenseLimitDrawerProps) {
  const { toast } = useToast();
  const mutation = useAntExpenseLimit(usuarioId);
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState('');

  useEffect(() => {
    if (open) {
      setAmount(currentLimit != null ? String(currentLimit) : '');
      setAmountError('');
    }
  }, [open, currentLimit]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(parseAmountInput(e.target.value));
    setAmountError('');
  };

  const handleSugerencia = (valor: number) => {
    setAmount(String(valor));
    setAmountError('');
  };

  const handleGuardar = () => {
    if (!isValidAmount(amount)) {
      setAmountError('Ingresa un monto válido mayor a $0');
      return;
    }
    const limite = parseFloat(amount);
    mutation.mutate(limite, {
      onSuccess: () => {
        toast({
          title: 'Límite guardado',
          description: `Marcaremos como hormiga los gastos menores a ${formatCurrency(limite)}.`,
        });
        onOpenChange(false);
      },
      onError: (error) => {
        toast({
          title: 'No pudimos guardar el límite',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  const numericAmount = parseFloat(amount) || 0;
  const esEdicion = currentLimit != null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{esEdicion ? 'Modifica el tope por compra' : 'Tope por compra hormiga'}</DrawerTitle>
          <DrawerDescription>
            Cada gasto menor a este monto se cuenta como gasto hormiga. No es un tope mensual, sino el valor máximo de una sola compra pequeña.
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-5 pb-4">
          <div className="rounded-2xl bg-secondary p-5">
            <p className="text-center text-xs uppercase tracking-wide text-muted-foreground">
              Máximo por transacción
            </p>
            <div className="mt-2 flex items-center justify-center gap-1">
              <span className="text-2xl font-semibold text-muted-foreground">$</span>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full max-w-[200px] bg-transparent text-center text-4xl font-bold text-foreground outline-none placeholder:text-muted-foreground/40"
                aria-label="Monto máximo por transacción para clasificar gasto hormiga"
                aria-invalid={!!amountError}
                aria-describedby={amountError ? 'limit-error' : undefined}
                autoFocus
              />
            </div>
            <p className="mt-1 text-center text-xs text-muted-foreground">
              {numericAmount > 0 ? formatCurrency(numericAmount) : 'Pesos colombianos'}
            </p>
            {amountError && (
              <p
                id="limit-error"
                className="mt-3 rounded-lg bg-destructive/10 px-3 py-1.5 text-center text-xs font-medium text-destructive"
                role="alert"
              >
                {amountError}
              </p>
            )}
          </div>

          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Sugerencias rápidas</p>
            <div className="flex gap-2">
              {SUGERENCIAS.map((valor) => (
                <button
                  key={valor}
                  type="button"
                  onClick={() => handleSugerencia(valor)}
                  className={cn(
                    'flex-1 rounded-xl border bg-card px-3 py-2 text-sm font-semibold transition-colors',
                    parseFloat(amount) === valor
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-foreground hover:border-primary/40',
                  )}
                >
                  {formatCurrency(valor)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DrawerFooter>
          <Button
            onClick={handleGuardar}
            disabled={!isValidAmount(amount) || mutation.isPending}
            className="h-12 rounded-2xl text-base font-semibold"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar'
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
            className="rounded-2xl"
          >
            Cancelar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
