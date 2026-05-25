import React, { useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart as PieIcon, Utensils, Car } from 'lucide-react';
import { useResumenGastosMesActual } from '@/hooks/use-transacciones';

// Colores institucionales y mapping por categoría
const CATEGORY_COLORS: Record<string, string> = {
  Alimentación: '#2ECC71',
  Transporte: '#F1C40F',
  Vivienda: '#3498DB',
  Educación: '#9B59B6',
  Entretenimiento: '#E91E63',
  'Gastos varios': '#95A5A6',
};

function monthLabelFor(date = new Date()) {
  return new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(date);
}

// CustomTooltip removed from top-level; defined inside component to access refs

export default function ReportesGastos() {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const usuarioGuardado = JSON.parse(localStorage.getItem('usuario') || '{}');
  const USUARIO_ID = usuarioGuardado?.id as number | undefined;
  const { data: resumenGastos = [], isLoading } = useResumenGastosMesActual(USUARIO_ID);

  const [periodLabel] = useState(() => `Mes actual: ${monthLabelFor()}`);

  // Demo data mode via query param ?demo=1 to showcase Scenario 1
  const demo = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === '1';

  const demoGrouped = [
    { name: 'Alimentación', value: 200000 },
    { name: 'Transporte', value: 100000 },
  ];

  // Agrupar por categoría usando datos del backend
  const grouped = useMemo(() => {
    return resumenGastos.map((item) => ({
      name: item.categoriaNombre || 'Gastos varios',
      value: item.montoTotal ?? 0,
    }));
  }, [resumenGastos]);

  // If demo mode and no real grouped data, override
  const effectiveGrouped = demo ? demoGrouped : grouped;

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 bg-background">
        <div className="max-w-5xl mx-auto rounded-xl border bg-card p-6 text-center">
          <div className="text-lg font-semibold">Cargando resumen de gastos...</div>
        </div>
      </div>
    );
  }

  const total = effectiveGrouped.reduce((s, g) => s + g.value, 0);

  // Si no hay datos, mostrar estado vacío
  const isEmpty = effectiveGrouped.length === 0;

  // Preparar datos para recharts
  const chartData = effectiveGrouped.map(g => ({ name: g.name, value: g.value, percent: total ? (g.value / total) * 100 : 0 }));

  // Tooltip component has access to chartRef to compute safe position
  function CustomTooltipInner({ active, payload, coordinate }: any) {
    if (!active || !payload || !payload.length) return null;
    const p = payload[0];
    const name = p.name;
    const value = p.value;
    const percent = (p.payload && p.payload.percent) ? Number(p.payload.percent).toFixed(1) : '';

    const chartRect = chartRef.current?.getBoundingClientRect();
    const tooltipWidth = 220;
    const tooltipHeight = 48;

    // default offsets (relative to chart)
    let left = (coordinate?.x ?? 0) + 10;
    let top = (coordinate?.y ?? 0) + 10;

    if (chartRect) {
      const centerY = chartRect.height / 2;
      const centerX = chartRect.width / 2;
      const centerRadius = 70; // innerRadius used for donut


      // Place tooltip near the cursor but avoid covering center
      const padding = 8;
      if ((coordinate?.x ?? 0) > centerX) {
        left = (coordinate?.x ?? 0) - tooltipWidth - 12;
      } else {
        left = (coordinate?.x ?? 0) + 12;
      }

      // Clamp horizontally inside chart bounds
      if (left < padding) left = padding;
      if (left + tooltipWidth > chartRect.width - padding) left = chartRect.width - tooltipWidth - padding;

      // Vertical centered on cursor, clamped
      top = (coordinate?.y ?? 0) - tooltipHeight / 2;
      if (top < padding) top = padding;
      if (top + tooltipHeight > chartRect.height - padding) top = chartRect.height - tooltipHeight - padding;

      // If still overlapping center circle, push further vertically
      const tooltipCenterX = left + tooltipWidth / 2;
      const tooltipCenterY = top + tooltipHeight / 2;
      const dx = tooltipCenterX - centerX;
      const dy = tooltipCenterY - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < centerRadius + 16) {
        const push = centerRadius + 16 - dist;
        top = tooltipCenterY > centerY ? Math.min(chartRect.height - tooltipHeight - padding, top + push) : Math.max(padding, top - push);
      }

      // Round to integer to avoid subpixel blurring
      left = Math.round(left);
      top = Math.round(top);
    }

    const style: React.CSSProperties = {
      position: 'absolute',
      left,
      top,
      background: '#2d3436',
      color: '#fff',
      padding: 10,
      borderRadius: 8,
      minWidth: tooltipWidth,
      boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
      transform: `translate3d(0,0,0)`,
      willChange: 'transform',
      pointerEvents: 'none',
      zIndex: 50,
    };

    return (
      <div style={style}>
        <div style={{ fontWeight: 700 }}>{`${name}: $${Number(value).toLocaleString('es-ES')} (${percent}%)`}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start gap-6">
          {/* Sección control (izq) */}
          <div className="w-1/4">
            <h2 className="text-2xl font-bold">Distribución de gastos</h2>
            <div className="mt-4">
              <label className="text-sm opacity-90">Período</label>
              <div className="mt-2 rounded-md border bg-card p-3 text-sm">{periodLabel}</div>
            </div>
          </div>

          {/* Gráfico central */}
          <div className="flex-1 rounded-xl border bg-card p-6 relative" style={{ minHeight: 320 }}>
            <div className="flex items-center gap-4 mb-3">
              <PieIcon className="h-5 w-5 text-muted-foreground" />
              <div className="text-sm opacity-90">Visualización tipo dona</div>
            </div>

            <div style={{ width: '100%', height: 260 }} ref={chartRef}>
              <ResponsiveContainer>
                <PieChart>
                  {isEmpty ? (
                    <Pie data={[{ name: 'Sin datos', value: 1 }]} dataKey="value" innerRadius={70} outerRadius={100} startAngle={90} endAngle={-270}>
                      <Cell fill="#DFE4EA" />
                    </Pie>
                  ) : (
                    <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} startAngle={90} endAngle={-270}>
                      {chartData.map((entry, index) => {
                        const color = CATEGORY_COLORS[entry.name] ?? CATEGORY_COLORS['Gastos varios'];
                        return <Cell key={`c-${index}`} fill={color} />;
                      })}
                    </Pie>
                  )}

                  <Tooltip content={<CustomTooltipInner />} wrapperStyle={{ position: 'relative' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Centro de la dona con total */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              {isEmpty ? (
                <div className="text-center text-sm font-semibold text-muted-foreground">Aún no tienes gastos registrados para generar un gráfico</div>
              ) : (
                <div className="text-center">
                  <div className="text-sm opacity-90">Total gastos:</div>
                  <div className="text-lg font-bold">${total.toLocaleString('es-ES')}</div>
                </div>
              )}
            </div>

            {/* Estado vacío CTA */}
            {isEmpty && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <button onClick={() => navigate('/add-expense')} className="rounded-md bg-[hsl(var(--expense))] px-4 py-2 text-white font-medium">
                  Registrar primer gasto
                </button>
              </div>
            )}
          </div>

          {/* Leyenda (derecha) */}
          <aside className="w-1/4">
            <div className="rounded-xl border bg-card p-4">
              <h3 className="text-sm font-semibold mb-3">Leyenda</h3>
              <div className="space-y-3">
                {Object.entries(CATEGORY_COLORS).map(([name, color]) => {
                  // calcular porcentaje si existe
                  const found = chartData.find(d => d.name === name);
                  const pct = found && total ? `${found.percent.toFixed(1)}%` : (grouped.length ? '0.0%' : '—');

                  // icon mapping básico
                  const Icon = name === 'Alimentación' ? Utensils : name === 'Transporte' ? Car : null;

                  return (
                    <div key={name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div style={{ width: 14, height: 14, background: color, borderRadius: 3 }} />
                        {Icon ? <Icon className="h-4 w-4 text-muted-foreground" /> : <div className="h-4 w-4" />}
                        <div className="text-sm">{name}</div>
                      </div>
                      <div className="text-sm opacity-90">{pct}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
