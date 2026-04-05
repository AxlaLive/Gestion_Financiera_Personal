import {
  FileText, ShoppingCart, Home, CreditCard, UtensilsCrossed,
  Car, Heart, Gamepad2, Plane, GraduationCap, Shirt, Smartphone, Coffee, DollarSign,
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

const categoryIcons: Record<string, React.ElementType> = {
  salario: FileText,
  compras: ShoppingCart,
  vivienda: Home,
  servicios: CreditCard,
  comida: UtensilsCrossed,
  transporte: Car,
  salud: Heart,
  ocio: Gamepad2,
  viajes: Plane,
  educacion: GraduationCap,
  ropa: Shirt,
  tecnologia: Smartphone,
  cafes: Coffee,
  otros: DollarSign,
};

const categoryColors: Record<string, string> = {
  salario: 'bg-blue-100 text-blue-700',
  compras: 'bg-purple-100 text-purple-700',
  vivienda: 'bg-orange-100 text-orange-700',
  servicios: 'bg-slate-100 text-slate-700',
  comida: 'bg-red-100 text-red-700',
  transporte: 'bg-sky-100 text-sky-700',
  salud: 'bg-pink-100 text-pink-700',
  ocio: 'bg-indigo-100 text-indigo-700',
  viajes: 'bg-cyan-100 text-cyan-700',
  educacion: 'bg-amber-100 text-amber-700',
  ropa: 'bg-violet-100 text-violet-700',
  tecnologia: 'bg-teal-100 text-teal-700',
  cafes: 'bg-yellow-100 text-yellow-700',
  otros: 'bg-gray-100 text-gray-700',
};

export interface Transaction {
  id: string;
  category: string;
  label: string;
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
}

interface TransactionCardProps {
  transaction: Transaction;
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const Icon = categoryIcons[transaction.category] || DollarSign;
  const colorClass = categoryColors[transaction.category] || 'bg-gray-100 text-gray-700';
  const isIncome = transaction.type === 'income';

  return (
    <div className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-sm" role="listitem">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${colorClass}`} aria-hidden="true">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-sm text-foreground">{transaction.label}</span>
          {isIncome ? (
            <ArrowDownLeft className="h-3.5 w-3.5 text-[hsl(var(--income))]" aria-label="Ingreso" />
          ) : (
            <ArrowUpRight className="h-3.5 w-3.5 text-[hsl(var(--expense))]" aria-label="Gasto" />
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{transaction.description}</p>
        <p className="text-xs text-muted-foreground">{transaction.date}</p>
      </div>
      <span
        className={`font-semibold text-sm whitespace-nowrap ${
          isIncome ? 'text-[hsl(var(--income))]' : 'text-[hsl(var(--expense))]'
        }`}
        aria-label={`${isIncome ? 'Ingreso' : 'Gasto'} de ${formatCurrency(transaction.amount)}`}
      >
        {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
      </span>
    </div>
  );
}
