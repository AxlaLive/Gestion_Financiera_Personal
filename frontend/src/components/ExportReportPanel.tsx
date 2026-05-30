import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Download, CheckCircle, AlertCircle, FileText, Sheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface ReportSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  categoryBreakdown: Array<{ name: string; percentage: number }>;
  savingsPercentage: number;
  hasData: boolean;
}

interface ExportReportPanelProps {
  onBack?: () => void;
  summary?: ReportSummary;
  isLoading?: boolean;
}

const DEFAULT_SUMMARY: ReportSummary = {
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
  hasData: true,
};

const EMPTY_SUMMARY: ReportSummary = {
  totalIncome: 0,
  totalExpenses: 0,
  netBalance: 0,
  categoryBreakdown: [],
  savingsPercentage: 0,
  hasData: false,
};

export default function ExportReportPanel({ 
  onBack, 
  summary = DEFAULT_SUMMARY,
  isLoading = false 
}: ExportReportPanelProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [format, setFormat] = useState<'pdf' | 'excel'>('pdf');
  const [exportStatus, setExportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [showEmptyState, setShowEmptyState] = useState(!summary.hasData);

  // Format month/year display
  const monthLabel = selectedMonth.toLocaleString('es-ES', { 
    month: 'long', 
    year: 'numeric' 
  }).replace(/^\w/, (c) => c.toUpperCase());

  // Change month navigation
  const handlePreviousMonth = () => {
    setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  // Simulate report generation
  const handleGenerateReport = async () => {
    if (!showEmptyState) {
      setExportStatus('loading');
      
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock file
      const content = generateReportContent();
      const blob = new Blob([content], { 
        type: format === 'pdf' ? 'application/pdf' : 'application/vnd.ms-excel' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte-${monthLabel.replace(/\s+/g, '-')}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setExportStatus('success');
      setTimeout(() => setExportStatus('idle'), 3000);
    }
  };

  const generateReportContent = () => {
    if (format === 'pdf') {
      return `Reporte Financiero - ${monthLabel}\n\nTotal de Ingresos: $${summary.totalIncome.toLocaleString('es-ES')}\nTotal de Gastos: $${summary.totalExpenses.toLocaleString('es-ES')}\nBalance Neto: $${summary.netBalance.toLocaleString('es-ES')}`;
    } else {
      return `Reporte Financiero,${monthLabel}\nTotal de Ingresos,$${summary.totalIncome.toLocaleString('es-ES')}\nTotal de Gastos,$${summary.totalExpenses.toLocaleString('es-ES')}\nBalance Neto,$${summary.netBalance.toLocaleString('es-ES')}`;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-blue-600 text-white rounded-b-3xl shadow-lg">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
                aria-label="Volver"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            <h1 className="text-2xl font-bold flex-1">Exportar Reporte</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Configuration Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <FileText size={20} className="text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">Configuración del reporte</h2>
          </div>

          {/* Period Selector */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-4">Período</label>
            <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <button
                onClick={handlePreviousMonth}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                aria-label="Mes anterior"
              >
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
              <div className="flex-1 text-center">
                <span className="text-lg font-semibold text-gray-900 capitalize">{monthLabel}</span>
              </div>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                aria-label="Próximo mes"
              >
                <ChevronRight size={20} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Format Selector */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-4">Formato de exportación</label>
            <RadioGroup value={format} onValueChange={(value) => setFormat(value as 'pdf' | 'excel')}>
              <div className="grid grid-cols-2 gap-4">
                {/* PDF Option */}
                <label className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  format === 'pdf' 
                    ? 'border-blue-600 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}>
                  <RadioGroupItem value="pdf" id="pdf-option" className="mr-3" />
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">PDF</div>
                      <div className="text-xs text-gray-500">Documento visual</div>
                    </div>
                  </div>
                </label>

                {/* Excel Option */}
                <label className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  format === 'excel' 
                    ? 'border-blue-600 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}>
                  <RadioGroupItem value="excel" id="excel-option" className="mr-3" />
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Sheet size={20} className="text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Excel</div>
                      <div className="text-xs text-gray-500">Hoja de cálculo</div>
                    </div>
                  </div>
                </label>
              </div>
            </RadioGroup>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerateReport}
            disabled={exportStatus === 'loading' || showEmptyState}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            <Download size={20} />
            Generar reporte
          </Button>

          {/* Export Status Feedback */}
          {exportStatus === 'success' && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircle size={20} className="text-green-600" />
              <span className="text-sm text-green-800 font-medium">Reporte generado exitosamente</span>
            </div>
          )}

          {showEmptyState && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle size={20} className="text-red-600" />
              <span className="text-sm text-red-800 font-medium">No hay datos para exportar</span>
            </div>
          )}
        </div>

        {/* Summary Section */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText size={20} />
            Resumen: {monthLabel}
          </h2>

          {showEmptyState ? (
            // Empty State
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12">
              <div className="text-center">
                <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 font-medium text-base">
                  No hay movimientos registrados para el período seleccionado.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Income */}
                <div className="bg-blue-600 text-white rounded-xl p-6 shadow-md">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium opacity-90">Total de ingresos</span>
                  </div>
                  <p className="text-3xl font-bold">${summary.totalIncome.toLocaleString('es-ES')}</p>
                </div>

                {/* Total Expenses */}
                <div className="bg-orange-500 text-white rounded-xl p-6 shadow-md">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-orange-400 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium opacity-90">Total de gastos</span>
                  </div>
                  <p className="text-3xl font-bold">${summary.totalExpenses.toLocaleString('es-ES')}</p>
                </div>

                {/* Net Balance */}
                <div className="bg-green-600 text-white rounded-xl p-6 shadow-md">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium opacity-90">Balance neto</span>
                  </div>
                  <p className="text-3xl font-bold">${summary.netBalance.toLocaleString('es-ES')}</p>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Porcentaje de gasto por categoría</h3>
                <div className="space-y-3">
                  {summary.categoryBreakdown.map((category, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <span className="text-sm font-medium text-gray-700 min-w-[120px]">{category.name}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all"
                          style={{ width: `${category.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 min-w-[40px] text-right">{category.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Savings Indicator */}
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl p-8 shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-90 mb-2">Porcentaje de ingreso destinado a ahorro</p>
                    <p className="text-4xl font-bold">{summary.savingsPercentage}%</p>
                  </div>
                  <div className="p-4 bg-white bg-opacity-20 rounded-lg">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
