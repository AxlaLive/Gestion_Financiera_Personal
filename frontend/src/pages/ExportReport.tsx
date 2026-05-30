import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExportReportPanel from '@/components/ExportReportPanel';

export default function ExportReport() {
  const navigate = useNavigate();
  const [emptyState] = useState(false); // Cambiar a true para ver estado vacío

  // Datos de ejemplo (puedes conectar con tu API)
  const reportSummary = {
    totalIncome: 5000000,
    totalExpenses: 3500000,
    netBalance: 1500000,
    categoryBreakdown: [
      { name: 'Alimentación', percentage: 30 },
      { name: 'Transporte', percentage: 15 },
      { name: 'Servicios', percentage: 20 },
      { name: 'Ocio', percentage: 10 },
      { name: 'Otros', percentage: 25 },
    ],
    savingsPercentage: 12,
    hasData: !emptyState,
  };

  return (
    <ExportReportPanel
      onBack={() => navigate('/reportes')}
      summary={reportSummary}
    />
  );
}
