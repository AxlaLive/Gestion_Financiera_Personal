import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { BudgetCard, Budget } from '@/components/BudgetCard';

const mockBudgets: Budget[] = [
  { id: '1', category: 'comida', label: 'Comida', spent: 2851, limit: 5000 },
  { id: '2', category: 'transporte', label: 'Transporte', spent: 1200, limit: 2000 },
  { id: '3', category: 'hogar', label: 'Hogar', spent: 3800, limit: 4000 },
  { id: '4', category: 'compras', label: 'Compras', spent: 1581, limit: 1500 },
  { id: '5', category: 'cafes', label: 'Cafés y Restaurantes', spent: 450, limit: 1000 },
  { id: '6', category: 'tecnologia', label: 'Tecnología', spent: 150, limit: 800 },
];

export default function Budgets() {
  const navigate = useNavigate();
  const totalSpent = mockBudgets.reduce((s, b) => s + b.spent, 0);
  const totalLimit = mockBudgets.reduce((s, b) => s + b.limit, 0);
  const totalPercent = Math.round((totalSpent / totalLimit) * 100);
  const remaining = totalLimit - totalSpent;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="rounded-b-3xl bg-primary px-5 pb-6 pt-6 text-primary-foreground">
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => navigate(-1)} aria-label="Volver" className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/20">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold">Mis Presupuestos</h1>
          <button aria-label="Agregar presupuesto" className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/20">
            <Plus className="h-5 w-5" />
          </button>
        </div>

        <div className="rounded-xl bg-primary-foreground/15 p-4">
          <div className="flex justify-between text-sm opacity-90 mb-1">
            <span>Total gastado este mes</span>
            <span>De tu límite</span>
          </div>
          <div className="flex justify-between font-bold text-xl mb-1">
            <span>{formatCurrency(totalSpent)}</span>
            <span>{formatCurrency(totalLimit)}</span>
          </div>
          <div className="flex justify-between text-xs opacity-80 mb-3">
            <span>{totalPercent}% usado</span>
            <span>{formatCurrency(remaining)} restante</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-primary-foreground/20 overflow-hidden" role="progressbar" aria-valuenow={totalPercent} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-primary-foreground transition-all" style={{ width: `${Math.min(totalPercent, 100)}%` }} />
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Por Categoría</h2>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span>Marzo 2026</span>
          </div>
        </div>

        <div className="space-y-4" role="list" aria-label="Presupuestos por categoría">
          {mockBudgets.map((b) => (
            <BudgetCard key={b.id} budget={b} />
          ))}
        </div>

        <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-4 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors">
          <Plus className="h-4 w-4" />
          Agregar Nuevo Presupuesto
        </button>

        {/* Tip */}
        <div className="mt-6 rounded-xl bg-blue-50 p-4 flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-[hsl(var(--income))]">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">Tip para ahorrar</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Estás gastando más en <strong>Compras</strong> este mes. Intenta reducir un 20% el próximo mes para mantener tu presupuesto equilibrado.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
