// REFERENCIA: Cómo agregar botón de acceso a "Exportar Reporte" 
// desde la página ReportesGastos.tsx

// En ReportesGastos.tsx, agrega este botón en el header o en la sección de acciones:

import { useNavigate } from 'react-router-dom';
import { Download, BarChart3 } from 'lucide-react';

// Dentro del componente ReportesGastos:
const navigate = useNavigate();

// OPCIÓN 1: Botón flotante en la esquina superior derecha
<div className="fixed bottom-6 right-6">
  <button
    onClick={() => navigate('/exportar-reporte')}
    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg shadow-lg transition-colors"
  >
    <Download size={20} />
    Exportar Reporte
  </button>
</div>

// OPCIÓN 2: Botón en el header (parte superior)
<div className="flex items-center justify-between mb-6">
  <h1 className="text-3xl font-bold text-gray-900">Reportes de Gastos</h1>
  <button
    onClick={() => navigate('/exportar-reporte')}
    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
  >
    <Download size={18} />
    Exportar
  </button>
</div>

// OPCIÓN 3: Tarjeta/Card de acceso rápido
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
  {/* Tarjeta existente */}
  
  {/* Nueva tarjeta de exportación */}
  <div
    onClick={() => navigate('/exportar-reporte')}
    className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 cursor-pointer hover:shadow-lg transition-shadow"
  >
    <div className="flex items-center gap-4">
      <div className="p-3 bg-white bg-opacity-20 rounded-lg">
        <Download size={24} />
      </div>
      <div>
        <h3 className="font-bold text-lg">Exportar Reporte</h3>
        <p className="text-sm text-blue-100">Descargar en PDF o Excel</p>
      </div>
    </div>
  </div>
</div>

// OPCIÓN 4: Menú dropdown con más opciones
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from 'lucide-react';

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
      <MoreVertical size={20} />
    </button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem onClick={() => navigate('/exportar-reporte')}>
      <Download className="mr-2 h-4 w-4" />
      <span>Exportar Reporte</span>
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>

// ============================================
// EJEMPLO COMPLETO: Sección de acciones
// ============================================

export function ReportsActionsBar() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-3 mb-6">
      <button
        onClick={() => navigate('/exportar-reporte')}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        <Download size={18} />
        Exportar Reporte
      </button>
      
      <button
        className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
      >
        <BarChart3 size={18} />
        Filtros
      </button>
    </div>
  );
}

// En ReportesGastos.tsx agregar:
// <ReportsActionsBar />
