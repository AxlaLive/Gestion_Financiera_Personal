import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, Eye, EyeOff, ArrowDownLeft, ArrowUpRight, Plus, TrendingUp, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { TransactionCard } from '@/components/TransactionCard';
import { BottomNav } from '@/components/BottomNav';
import { useBalance } from '@/hooks/use-balance';
import { useTransacciones } from '@/hooks/use-transacciones';
import type { Transaccion } from '@/lib/api-types';

function mapTransaccion(t: Transaccion) {
  return {
    id: String(t.id),
    category: t.categoria?.nombre?.toLowerCase() ?? 'otros',
    label: t.tipo === 'INGRESO' ? 'Ingreso' : 'Gasto',
    description: t.descripcion || '',
    amount: t.monto,
    date: t.fecha,
    type: t.tipo === 'INGRESO' ? 'income' as const : 'expense' as const,
  };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const usuarioGuardado = JSON.parse(localStorage.getItem('usuario') || '{}');
  const USUARIO_ID = usuarioGuardado.id ?? 1;
  const [showBalance, setShowBalance] = useState(true);

  const { data: balance, isLoading: loadingBalance, isError: errorBalance } = useBalance(USUARIO_ID);
  const { data: transacciones, isLoading: loadingTx } = useTransacciones(USUARIO_ID);

  const balanceAmount = balance?.monto ?? 0;
  const mensaje = balance?.mensaje ?? '';

  // Calcular ingresos y gastos del historial
  const totalIncome = transacciones?.filter(t => t.tipo === 'INGRESO').reduce((s, t) => s + t.monto, 0) ?? 0;
  const totalExpense = transacciones?.filter(t => t.tipo === 'GASTO').reduce((s, t) => s + t.monto, 0) ?? 0;

  // Últimas 5 transacciones
  const recentTx = (transacciones ?? []).slice(0, 5).map(mapTransaccion);

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      {/* Header */}
      <header className="rounded-b-3xl bg-primary px-5 pb-8 pt-6 text-primary-foreground">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm opacity-90">Bienvenido de nuevo</p>
            <h1 className="text-lg font-bold">{usuarioGuardado.nombre ?? 'Usuario'}</h1>
          </div>
          <button
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20"
            aria-label="Notificaciones"
          >
            <Bell className="h-5 w-5" />
          </button>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-sm opacity-90">
            <span>Balance Total</span>
            <button
              onClick={() => setShowBalance(!showBalance)}
              aria-label={showBalance ? 'Ocultar balance' : 'Mostrar balance'}
            >
              {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
          </div>

          {loadingBalance ? (
            <div className="mt-3 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin opacity-70" />
            </div>
          ) : errorBalance ? (
            <p className="mt-1 text-2xl font-bold opacity-70">Sin conexión al servidor</p>
          ) : (
            <>
              <p className="mt-1 text-4xl font-extrabold tracking-tight" aria-live="polite">
                {showBalance ? formatCurrency(balanceAmount) : '••••••'}
              </p>
              {mensaje && (
                <p className="mt-2 text-sm opacity-90">{mensaje}</p>
              )}
            </>
          )}
        </div>
      </header>

      <main className="flex-1 px-5">
        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/add-income')}
            className="flex flex-col items-center gap-2 rounded-2xl bg-[hsl(var(--income))] p-4 text-white shadow-md transition-transform active:scale-95"
            aria-label="Registrar nuevo ingreso"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <ArrowDownLeft className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-1 font-semibold text-sm">
              <Plus className="h-4 w-4" />
              Ingreso
            </div>
            <span className="text-xs opacity-90">Registrar entrada</span>
          </button>

          <button
            onClick={() => navigate('/add-expense')}
            className="flex flex-col items-center gap-2 rounded-2xl bg-[hsl(var(--expense))] p-4 text-white shadow-md transition-transform active:scale-95"
            aria-label="Registrar nuevo gasto"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <ArrowUpRight className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-1 font-semibold text-sm">
              <Plus className="h-4 w-4" />
              Gasto
            </div>
            <span className="text-xs opacity-90">Registrar salida</span>
          </button>
        </div>

        {/* Month Summary */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground">Resumen del Mes</h2>
            <Link to="/budgets" className="text-sm font-semibold text-primary">Ver Presupuestos</Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                <TrendingUp className="h-4 w-4 text-[hsl(var(--income))]" />
                Ingresos
              </div>
              <p className="text-xl font-bold text-[hsl(var(--income))]">
                {loadingTx ? '...' : formatCurrency(totalIncome)}
              </p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                <TrendingUp className="h-4 w-4 text-[hsl(var(--expense))]" />
                Gastos
              </div>
              <p className="text-xl font-bold text-[hsl(var(--expense))]">
                {loadingTx ? '...' : formatCurrency(totalExpense)}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground">Transacciones Recientes</h2>
            <Link to="/transactions" className="text-sm font-semibold text-primary">Ver todas</Link>
          </div>

          {loadingTx ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : recentTx.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">
              No hay transacciones aún. ¡Registra tu primera!
            </p>
          ) : (
            <div className="space-y-3" role="list" aria-label="Transacciones recientes">
              {recentTx.map((t) => (
                <TransactionCard key={t.id} transaction={t} />
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
