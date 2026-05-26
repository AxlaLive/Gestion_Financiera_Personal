import { Bar, BarChart, CartesianGrid, Cell, XAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { formatCurrency } from '@/lib/currency';
import type { GastoHormigaHistoricoMes } from '@/lib/api-types';

interface AntExpensesChartProps {
  data: GastoHormigaHistoricoMes[];
}

const ABREVIATURAS_MES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function formatearMes(mesISO: string): string {
  const [, mes] = mesISO.split('-');
  const idx = parseInt(mes, 10) - 1;
  return ABREVIATURAS_MES[idx] ?? mesISO;
}

function obtenerMesActual(): string {
  const ahora = new Date();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  return `${ahora.getFullYear()}-${mes}`;
}

const chartConfig = {
  total: {
    label: 'Gastos hormiga',
    color: 'hsl(var(--expense))',
  },
} satisfies ChartConfig;

export function AntExpensesChart({ data }: AntExpensesChartProps) {
  const mesActual = obtenerMesActual();
  const chartData = data.map((item) => ({
    ...item,
    mesLabel: formatearMes(item.mes),
    esActual: item.mes === mesActual,
  }));

  const promedio =
    chartData.length > 0
      ? chartData.reduce((acc, item) => acc + item.total, 0) / chartData.length
      : 0;

  return (
    <section className="rounded-2xl bg-card p-5 shadow-sm" aria-label="Evolución de gastos hormiga últimos 6 meses">
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Últimos 6 meses</h2>
          <p className="text-xs text-muted-foreground">Promedio: {formatCurrency(promedio)}</p>
        </div>
      </div>

      <ChartContainer config={chartConfig} className="aspect-[2/1] w-full">
        <BarChart accessibilityLayer data={chartData} margin={{ top: 10, right: 4, left: 4, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="mesLabel"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            className="text-xs"
          />
          <ChartTooltip
            cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }}
            content={
              <ChartTooltipContent
                labelKey="mesLabel"
                formatter={(value) => (
                  <span className="font-mono font-medium tabular-nums text-foreground">
                    {formatCurrency(Number(value))}
                  </span>
                )}
              />
            }
          />
          <Bar dataKey="total" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, idx) => (
              <Cell
                key={`cell-${idx}`}
                fill="hsl(var(--expense))"
                fillOpacity={entry.esActual ? 1 : 0.55}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </section>
  );
}
