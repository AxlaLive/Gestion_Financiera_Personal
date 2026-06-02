import React, { useEffect, useMemo, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { fetchGastosPorCategoriaMesActual } from '@/lib/api-client';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#6366f1', '#0f766e', '#8b5cf6', '#db2777', '#14b8a6'];

export default function Estadisticas() {
  const [gastosPorCategoria, setGastosPorCategoria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEmpty, setIsEmpty] = useState(false);

  const usuarioGuardado = JSON.parse(localStorage.getItem('usuario') || 'null');
  const USUARIO_ID = usuarioGuardado?.id;

  const totalGastos = useMemo(
    () => gastosPorCategoria.reduce((sum, entrada) => sum + (entrada.monto ?? 0), 0),
    [gastosPorCategoria],
  );

  const loadGastosPorCategoria = async () => {
    if (!USUARIO_ID) {
      setError('No se encontró la información del usuario.');
      setIsEmpty(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetchGastosPorCategoriaMesActual(USUARIO_ID);
      const lista = Array.isArray(response) ? response : [];
      const montoTotal = lista.reduce((sum, item) => sum + (item.monto ?? 0), 0);
      setGastosPorCategoria(lista);
      setIsEmpty(lista.length === 0 || montoTotal === 0);
    } catch (err) {
      setError(err?.message || 'No se pudo cargar la distribución de gastos.');
      setGastosPorCategoria([]);
      setIsEmpty(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGastosPorCategoria();
  }, []);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '30px' }}>
      <div style={{ backgroundColor: '#1d4ed8', color: 'white', padding: '22px 18px', textAlign: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>Distribución de gastos por categoría</h2>
        <p style={{ margin: '10px auto 0', maxWidth: '760px', color: '#bfdbfe', fontSize: '0.95rem' }}>
          Visualiza el porcentaje de tus gastos del mes actual por categoría y detecta en qué áreas consumes más.
        </p>
      </div>

      <div style={{ padding: '22px', maxWidth: '960px', margin: '0 auto' }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '18px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px', flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Gastos del mes actual</h3>
              <p style={{ margin: '10px 0 0', color: '#475569', fontSize: '0.95rem' }}>
                El gráfico muestra la distribución de tus egresos por categoría para el mes en curso.
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#0f172a', fontSize: '1.5rem', fontWeight: 700 }}>${totalGastos.toFixed(2)}</div>
              <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Total de gastos</div>
            </div>
          </div>
        </div>

        {loading && (
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '18px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            Cargando distribución de gastos...
          </div>
        )}

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '20px', borderRadius: '18px', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        {!loading && !error && isEmpty && (
          <div style={{ backgroundColor: '#f8fafc', padding: '30px', borderRadius: '18px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
            <div style={{ marginBottom: '12px', fontSize: '1.05rem', color: '#334155', fontWeight: 600 }}>
              Aún no tienes gastos registrados para generar un gráfico
            </div>
            <div style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Agrega tus transacciones de tipo gasto para que aparezcan aquí en la distribución por categoría.
            </div>
          </div>
        )}

        {!loading && !error && !isEmpty && (
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '18px', border: '1px solid #e2e8f0' }}>
            <div style={{ width: '100%', height: '460px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gastosPorCategoria}
                    dataKey="monto"
                    nameKey="categoria"
                    cx="50%"
                    cy="50%"
                    innerRadius={90}
                    outerRadius={140}
                    paddingAngle={4}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {gastosPorCategoria.map((entry, index) => (
                      <Cell key={`cell-${entry.categoria}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Monto']} />
                  <Legend verticalAlign="bottom" height={72} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
