import { Info } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { Separator } from '@/components/ui/separator';
import type { GastoHormigaResumen } from '@/lib/api-types';

interface AntExpensesSummaryCardProps {
  resumen: GastoHormigaResumen;
}

export function AntExpensesSummaryCard({ resumen }: AntExpensesSummaryCardProps) {
  const porcentaje = Math.round(resumen.porcentajeDelTotal);
  const porcentajeBar = Math.max(0, Math.min(100, porcentaje));
  const limite = resumen.limite ?? 0;

  return (
    <article
      className="rounded-2xl bg-card p-5 shadow-sm"
      aria-label="Resumen de gastos hormiga del mes"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Acumulado del mes
      </p>
      <p className="mt-1 text-4xl font-bold text-foreground">
        {formatCurrency(resumen.acumuladoMes)}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {resumen.cantidadTransacciones} {resumen.cantidadTransacciones === 1 ? 'transacción' : 'transacciones'}
        {' · '}
        {porcentaje}% del gasto total
      </p>

      <div
        className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={porcentaje}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${porcentaje} por ciento del gasto total mensual`}
      >
        <div
          className="h-full rounded-full bg-[hsl(var(--expense))] transition-all"
          style={{ width: `${porcentajeBar}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>{formatCurrency(resumen.acumuladoMes)} hormiga</span>
        <span>de {formatCurrency(resumen.totalGastosMes)}</span>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Límite configurado: <span className="font-semibold text-foreground">{formatCurrency(limite)}</span>
      </p>

      {resumen.recomendacion && (
        <>
          <Separator className="my-4" />
          <div className="flex gap-3 rounded-xl bg-primary/5 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Info className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground">Recomendación</h3>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {resumen.recomendacion}
              </p>
            </div>
          </div>
        </>
      )}
    </article>
  );
}
