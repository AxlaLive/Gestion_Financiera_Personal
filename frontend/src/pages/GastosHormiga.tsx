import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bug, Loader2, Settings } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import { ProfileMenu } from '@/components/ProfileMenu';
import { TransactionCard } from '@/components/TransactionCard';
import { BottomNav } from '@/components/BottomNav';
import { AntExpenseLimitDrawer } from '@/components/AntExpenseLimitDrawer';
import { AntExpensesSummaryCard } from '@/components/AntExpensesSummaryCard';
import { AntExpensesChart } from '@/components/AntExpensesChart';
import { useAntExpensesSummary } from '@/hooks/use-ant-expenses-summary';
import { useAntExpensesList } from '@/hooks/use-ant-expenses-list';
import { useAntExpensesHistory } from '@/hooks/use-ant-expenses-history';
import type { Transaccion } from '@/lib/api-types';

function mapTransaccion(t: Transaccion) {
  return {
    id: String(t.id),
    category: t.categoria?.nombre?.toLowerCase() ?? 'otros',
    label: t.categoria?.nombre ?? 'Gasto hormiga',
    description: t.descripcion || '',
    amount: t.monto,
    date: t.fecha,
    type: 'expense' as const,
  };
}

export default function GastosHormiga() {
  const navigate = useNavigate();
  const usuarioGuardado = JSON.parse(localStorage.getItem('usuario') || '{}');
  const USUARIO_ID = usuarioGuardado.id ?? 1;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [months, setMonths] = useState(6);

  const {
    data: resumen,
    isLoading: loadingResumen,
    isError: errorResumen,
  } = useAntExpensesSummary(USUARIO_ID);
  const { data: lista = [], isLoading: loadingLista } = useAntExpensesList(USUARIO_ID);
  const { data: historico = [], isLoading: loadingHistorico } = useAntExpensesHistory(USUARIO_ID, months);

  const tieneLimite = resumen?.limite != null;
  const transaccionesMapeadas = lista.map(mapTransaccion);

  if (loadingResumen) {
    return (
      <div className="flex min-h-screen flex-col bg-background pb-20">
        <header className="rounded-b-3xl bg-primary px-5 pb-8 pt-6 text-primary-foreground">
          <h1 className="text-lg font-bold">Gastos hormiga</h1>
        </header>
        <main className="flex flex-1 items-center justify-center px-5">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
        <BottomNav />
      </div>
    );
  }

  if (errorResumen) {
    return (
      <div className="flex min-h-screen flex-col bg-background pb-20">
        <header className="rounded-b-3xl bg-primary px-5 pb-8 pt-6 text-primary-foreground">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              aria-label="Volver"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-bold">Gastos hormiga</h1>
            <div className="h-9 w-9" aria-hidden="true" />
          </div>
        </header>
        <main className="flex flex-1 items-center justify-center px-5 text-center">
          <div>
            <p className="text-base font-semibold text-foreground">Sin conexión al servidor</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Vuelve a intentarlo en un momento.
            </p>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      <header className="rounded-b-3xl bg-primary px-5 pb-8 pt-6 text-primary-foreground">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            aria-label="Volver"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold">Gastos hormiga</h1>
          <div className="flex items-center gap-2">
            {tieneLimite ? (
              <button
                onClick={() => setDrawerOpen(true)}
                aria-label="Editar tope por compra de gasto hormiga"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/20"
              >
                <Settings className="h-5 w-5" />
              </button>
            ) : (
              <div className="h-9 w-9" aria-hidden="true" />
            )}
            <ProfileMenu />
          </div>
        </div>
        {tieneLimite && (
          <p className="mt-4 text-sm opacity-90">
            Pequeños gastos que suman grandes diferencias al final del mes.
          </p>
        )}
      </header>

      <main className="flex-1 px-5 py-6">
        {!tieneLimite ? (
          <EmptyState onConfigurar={() => setDrawerOpen(true)} />
        ) : (
          <div className="space-y-6">
            {resumen && <AntExpensesSummaryCard resumen={resumen} />}

            {loadingHistorico ? (
              <div className="flex h-40 items-center justify-center rounded-2xl bg-card shadow-sm">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : historico.length > 0 ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-foreground">Evolución de gastos hormiga</div>
                  <div className="flex flex-wrap gap-2">
                    {[3, 6, 12].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setMonths(option)}
                        className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                          months === option
                            ? 'border-primary bg-primary text-white'
                            : 'border-border bg-card text-muted-foreground hover:border-primary/70'
                        }`}
                      >
                        {option}M
                      </button>
                    ))}
                  </div>
                </div>

                <AntExpensesChart data={historico} meses={months} />
              </div>
            ) : null}

            <section aria-labelledby="lista-titulo">
              <div className="mb-3 flex items-baseline justify-between">
                <h2 id="lista-titulo" className="text-lg font-bold text-foreground">
                  Transacciones hormiga
                </h2>
                {transaccionesMapeadas.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    ({transaccionesMapeadas.length})
                  </span>
                )}
              </div>

              {loadingLista ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : transaccionesMapeadas.length === 0 ? (
                <p className="rounded-xl bg-card p-6 text-center text-sm text-muted-foreground shadow-sm">
                  Aún no tienes gastos hormiga clasificados este mes.
                </p>
              ) : (
                <div className="space-y-3" role="list" aria-label="Lista de gastos hormiga">
                  {transaccionesMapeadas.map((t) => (
                    <TransactionCard key={t.id} transaction={t} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      <AntExpenseLimitDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        usuarioId={USUARIO_ID}
        currentLimit={resumen?.limite ?? null}
      />

      <BottomNav />
    </div>
  );
}

function EmptyState({ onConfigurar }: { onConfigurar: () => void }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mt-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
        <Bug className="h-12 w-12 text-primary" aria-hidden="true" />
      </div>

      <h2 className="mt-6 text-xl font-bold text-foreground">
        Detecta tus gastos hormiga
      </h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        Son pequeños gastos diarios que parecen insignificantes pero acumulan un monto importante
        al final del mes.
      </p>

      <div className="mt-6 w-full rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4 text-left">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Ejemplo</p>
        <p className="mt-1 text-sm text-foreground">
          Un café diario de {formatCurrency(5000)} se convierte en{' '}
          <strong className="text-foreground">{formatCurrency(150000)}</strong> al mes.
        </p>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        Indica cuánto puede costar como máximo una sola compra para considerarla gasto hormiga:
      </p>
      <Button
        onClick={onConfigurar}
        className="mt-3 h-12 w-full rounded-2xl text-base font-semibold"
      >
        Configurar tope por compra
      </Button>
    </div>
  );
}
