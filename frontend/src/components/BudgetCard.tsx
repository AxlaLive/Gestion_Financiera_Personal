import {
  UtensilsCrossed, Car, Home, ShoppingCart, Heart, Gamepad2, Plane,
  GraduationCap, Shirt, Smartphone, Coffee, DollarSign, CheckCircle2, AlertTriangle, XCircle,
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

const categoryIcons: Record<string, React.ElementType> = {
  comida: UtensilsCrossed,
  transporte: Car,
  hogar: Home,
  compras: ShoppingCart,
  salud: Heart,
  ocio: Gamepad2,
  viajes: Plane,
  educacion: GraduationCap,
  ropa: Shirt,
  tecnologia: Smartphone,
  cafes: Coffee,
  otros: DollarSign,
};

const categoryBgColors: Record<string, string> = {
  comida: 'bg-red-100 text-red-600',
  transporte: 'bg-sky-100 text-sky-600',
  hogar: 'bg-orange-100 text-orange-600',
  compras: 'bg-purple-100 text-purple-600',
  salud: 'bg-pink-100 text-pink-600',
  ocio: 'bg-indigo-100 text-indigo-600',
  viajes: 'bg-cyan-100 text-cyan-600',
  educacion: 'bg-amber-100 text-amber-600',
  ropa: 'bg-violet-100 text-violet-600',
  tecnologia: 'bg-teal-100 text-teal-600',
  cafes: 'bg-yellow-100 text-yellow-600',
  otros: 'bg-gray-100 text-gray-600',
};

export interface Budget {
  id: string;
  category: string;
  label: string;
  spent: number;
  limit: number;
}

function getStatus(percent: number) {
  if (percent >= 100) return { label: 'Límite superado', color: 'text-destructive', barColor: 'bg-destructive', Icon: XCircle };
  if (percent >= 90) return { label: 'Casi al límite', color: 'text-[hsl(var(--budget-warning))]', barColor: 'bg-[hsl(var(--budget-warning))]', Icon: AlertTriangle };
  if (percent >= 70) return { label: 'En camino', color: 'text-[hsl(var(--income))]', barColor: 'bg-[hsl(var(--income))]', Icon: CheckCircle2 };
  return { label: 'Excelente', color: 'text-[hsl(var(--success))]', barColor: 'bg-[hsl(var(--success))]', Icon: CheckCircle2 };
}

interface BudgetCardProps {
  budget: Budget;
}

export function BudgetCard({ budget }: BudgetCardProps) {
  const percent = Math.round((budget.spent / budget.limit) * 100);
  const remaining = budget.limit - budget.spent;
  const availablePercent = Math.max(0, 100 - percent);
  const status = getStatus(percent);
  const Icon = categoryIcons[budget.category] || DollarSign;
  const bgColor = categoryBgColors[budget.category] || 'bg-gray-100 text-gray-600';

  return (
    <div className="rounded-xl bg-card p-4 shadow-sm" role="article" aria-label={`Presupuesto ${budget.label}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bgColor}`} aria-hidden="true">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{budget.label}</h3>
            <div className={`flex items-center gap-1 text-xs font-medium ${status.color}`}>
              <status.Icon className="h-3.5 w-3.5" />
              <span>{status.label}</span>
            </div>
          </div>
        </div>
        <span className={`text-2xl font-bold ${status.color}`} aria-label={`${percent} por ciento usado`}>
          {Math.min(percent, 100)}%
        </span>
      </div>

      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <span>Gastado</span>
        <span>Límite</span>
      </div>
      <div className="flex justify-between font-semibold text-sm mb-2">
        <span>{formatCurrency(budget.spent)}</span>
        <span>{formatCurrency(budget.limit)}</span>
      </div>

      <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden mb-2" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        <div
          className={`h-full rounded-full transition-all ${status.barColor}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>

      <div className="flex justify-between text-xs">
        <span className={remaining < 0 ? 'text-destructive font-medium' : 'text-muted-foreground'}>
          {remaining >= 0 ? `Te quedan ${formatCurrency(remaining)}` : `Te pasaste por ${formatCurrency(Math.abs(remaining))}`}
        </span>
        <span className="text-muted-foreground">
          {remaining >= 0 ? `${availablePercent}% disponible` : `+0% excedido`}
        </span>
      </div>
    </div>
  );
}
