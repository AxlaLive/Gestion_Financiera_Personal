import React, { useState } from 'react';

export default function Estadisticas() {
  // 1. Estados para los filtros de búsqueda según las vistas de diseño (Figma)
  const [fechaInicio, setFechaInicio] = useState('2026-03-01');
  const [fechaFin, setFechaFin] = useState('2026-03-31');
  const [tipoTransaccion, setTipoTransaccion] = useState('Todos');

  // 2. Datos basados en los saldos reales analizados del proyecto (Hito 2)
  const datosMensuales = {
    ingresos: 15750.50,
    gastos: 5889.80,
    balance: 9860.70,
    variacionGastos: '+12.5%', // El indicador del +12.5% solicitado en el inicio
    // Datos de la tendencia por semanas para construir la gráfica temporal
    tendencia: [
      { etiqueta: 'Semana 1', ingresos: 3500, gastos: 1200, gastosMesPasado: 1000 },
      { etiqueta: 'Semana 2', ingresos: 4200, gastos: 850, gastosMesPasado: 900 },
      { etiqueta: 'Semana 3', ingresos: 3550, gastos: 2500, gastosMesPasado: 2100 },
      { etiqueta: 'Semana 4', ingresos: 4500, gastos: 1339.8, gastosMesPasado: 1200 },
    ]
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh', paddingBottom: '30px' }}>
      {/* Cabecera superior azul */}
      <div style={{ backgroundColor: '#0d6efd', color: 'white', padding: '20px', textAlign: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '500' }}>Visualiza y analiza tus finanzas de forma detallada</h2>
      </div>

      <div style={{ padding: '15px', maxWidth: '600px', margin: '0 auto' }}>
        {/* Tarjeta de Ingresos */}
        <div style={{ backgroundColor: '#1e40af', color: 'white', padding: '15px', borderRadius: '10px', marginBottom: '10px' }}>
          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Ingresos Mensuales</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>${datosMensuales.ingresos.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>

        {/* Tarjeta de Gastos */}
        <div style={{ backgroundColor: '#ea580c', color: 'white', padding: '15px', borderRadius: '10px', marginBottom: '10px' }}>
          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Gastos Mensuales</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>${datosMensuales.gastos.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>

        {/* Tarjeta de Balance */}
        <div style={{ backgroundColor: '#16a34a', color: 'white', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Balance Neto (Positivo)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>${datosMensuales.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>

        {/* Sección de Filtros de Búsqueda */}
        <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '10px', border: '1px solid #e5e7eb', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '1.05rem', color: '#1f2937', fontWeight: 'bold' }}>🔍 Filtros de Búsqueda</h3>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.8rem', color: '#4b5563', display: 'block', marginBottom: '4px' }}>Fecha Inicio</label>
              <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.8rem', color: '#4b5563', display: 'block', marginBottom: '4px' }}>Fecha Fin</label>
              <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#4b5563', display: 'block', marginBottom: '4px' }}>Tipo de Transacción</label>
            <select value={tipoTransaccion} onChange={(e) => setTipoTransaccion(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: 'white' }}>
              <option value="Todos">Todos</option>
              <option value="Ingresos">Ingresos</option>
              <option value="Gastos">Gastos</option>
            </select>
          </div>
        </div>

        {/* HU-16: Componente del Gráfico de Tendencias Temporales */}
        <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '1.05rem', color: '#1f2937', fontWeight: 'bold' }}>📈 Gráfico de Tendencia Temporal</h3>
          <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0 0 15px 0' }}>
            Comparativa de comportamiento de egresos vs mes anterior ({datosMensuales.variacionGastos})
          </p>
          
          {/* Diseño gráfico adaptativo usando SVG puro */}
          <svg viewBox="0 0 400 220" style={{ width: '100%', height: 'auto', background: '#fafafa', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
            {/* Líneas horizontales de guía */}
            <line x1="40" y1="40" x2="380" y2="40" stroke="#f0f0f0" strokeWidth="1" />
            <line x1="40" y1="90" x2="380" y2="90" stroke="#eee" strokeDasharray="4" />
            <line x1="40" y1="140" x2="380" y2="140" stroke="#eee" strokeDasharray="4" />
            <line x1="40" y1="180" x2="380" y2="180" stroke="#ccc" strokeWidth="1" />

            {/* Renderizado dinámico de las Barras del Mes Actual */}
            {datosMensuales.tendencia.map((item, index) => {
              const xPos = 65 + index * 85;
              const alturaBarra = (item.gastos / 3000) * 130;
              return (
                <g key={index}>
                  {/* Barra de Gastos (Naranja/Rojo según el Figma de egresos) */}
                  <rect x={xPos} y={180 - alturaBarra} width="28" height={alturaBarra} fill="#ea580c" rx="4" />
                  {/* Etiquetas de las semanas en el eje X */}
                  <text x={xPos + 14} y="200" fontSize="10" textAnchor="middle" fill="#6b7280" fontFamily="sans-serif">{item.etiqueta}</text>
                </g>
              );
            })}

            {/* Línea de Tendencia del Mes Anterior (Línea Azul punteada que cruza) */}
            <path
              d="M 79 145 L 164 149 L 249 95 L 334 135"
              fill="none"
              stroke="#0d6efd"
              strokeWidth="3"
              strokeDasharray="5"
              strokeLinecap="round"
            />
            
            {/* Puntos de unión en la línea del mes pasado */}
            <circle cx="79" cy="145" r="4" fill="#0d6efd" />
            <circle cx="164" cy="149" r="4" fill="#0d6efd" />
            <circle cx="249" cy="95" r="4" fill="#0d6efd" />
            <circle cx="334" cy="135" r="4" fill="#0d6efd" />
          </svg>

          {/* Leyendas explicativas del gráfico */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '12px', fontSize: '0.8rem', fontFamily: 'sans-serif' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#ea580c', borderRadius: '2px' }}></span>
              Gastos Mes Actual
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ color: '#0d6efd', fontWeight: 'bold' }}>- - -</span>
              Tendencia Mes Anterior
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
