# Componente ExportReportPanel - Documentación

## Descripción General
El componente `ExportReportPanel` implementa la interfaz de usuario para la funcionalidad **HU-17: Exportar Reporte** de un sistema de tablero de reportes financieros. La interfaz es minimalista, profesional y coherente con la paleta corporativa (azul, gris claro, blanco).

## Ubicación de Archivos
- **Componente**: `frontend/src/components/ExportReportPanel.tsx`
- **Página**: `frontend/src/pages/ExportReport.tsx`
- **Ruta**: `/exportar-reporte`

## Características Implementadas

### 1. **Sección de Configuración del Reporte**
- **Selector de Período**: Control interactivo con flechas de navegación (mes/año)
  - Formato: "Octubre 2025" (en español)
  - Botones `<` y `>` para cambiar mes
  
- **Selector de Formato**: Dos tarjetas tipo radio
  - **PDF** (seleccionado por defecto) - Documento visual
  - **Excel** - Hoja de cálculo
  - Cada opción tiene icono, etiqueta y descripción

- **Botón de Acción**: "Generar reporte"
  - Ancho completo, azul corporativo (#2563EB)
  - Incluye icono de descarga
  - Se deshabilita si no hay datos

### 2. **Previsualización del Resumen**
Antes de exportar, muestra:

#### **Tarjetas KPI (3 columnas)**
- **Total de Ingresos** (azul): Ej. $5.000.000,00
- **Total de Gastos** (naranja): Ej. $3.500.000,00
- **Balance Neto** (verde): Ej. $1.500.000,00

#### **Gráfico de Porcentaje por Categoría**
- Tabla con barras horizontales
- Muestra categoría, barra visual y porcentaje
- Ejemplo: Alimentación 30%, Transporte 15%, etc.

#### **Indicador de Ahorro**
- Tarjeta destacada con gradiente azul/indigo
- Muestra: "Ahorro: 12% del ingreso total"
- Incluye icono de moneda

### 3. **Estado Vacío (Escenario sin datos)**
Cuando no hay movimientos en el período seleccionado:
- Muestra contenedor con borde punteado gris claro
- Mensaje centrado y elegante: "No hay movimientos registrados para el período seleccionado"
- Botón "Generar reporte" deshabilitado
- Alerta roja indicando "No hay datos para exportar"

### 4. **Feedback de Exportación**
- **Cargando**: Botón muestra estado "loading"
- **Éxito**: Tarjeta verde con icono ✓ "Reporte generado exitosamente"
- **Error**: Tarjeta roja con icono ⚠ "No hay datos para exportar"

## Estructura de Datos (Props)

```typescript
interface ReportSummary {
  totalIncome: number;           // Ej: 5000000
  totalExpenses: number;         // Ej: 3500000
  netBalance: number;            // Ej: 1500000
  categoryBreakdown: Array<{
    name: string;                // "Alimentación"
    percentage: number;          // 30
  }>;
  savingsPercentage: number;     // 12
  hasData: boolean;              // true/false
}

interface ExportReportPanelProps {
  onBack?: () => void;           // Callback para botón atrás
  summary?: ReportSummary;       // Datos del reporte
  isLoading?: boolean;           // Estado de carga
}
```

## Estilos y Diseño

### Paleta de Colores
- **Primario**: Azul corporativo (#2563EB)
- **Fondo**: Blanco (#FFFFFF) y Gris claro (#F8FAFC)
- **Ingresos**: Azul (#2563EB)
- **Gastos**: Naranja (#F97316)
- **Balance**: Verde (#16A34A)
- **Texto**: Gris oscuro (#111827)

### Tipografía
- **Sans-serif**: Por defecto (Tailwind)
- **Títulos**: font-bold
- **Contenido**: font-medium/regular

### Espaciado
- Secciones: 32px (py-8)
- Elementos: 16-24px (p-4, p-6, gap-4)
- Bordes redondeados: 8px-12px (rounded-lg, rounded-xl)

### Sombras
- Tarjetas: shadow-sm (sombra suave)
- Elementos destacados: shadow-md (sombra media)

## Cómo Usar

### Importar en una página:
```tsx
import ExportReportPanel from '@/components/ExportReportPanel';

function MyPage() {
  return (
    <ExportReportPanel
      onBack={() => navigate('/reportes')}
      summary={{
        totalIncome: 5000000,
        totalExpenses: 3500000,
        netBalance: 1500000,
        categoryBreakdown: [
          { name: 'Alimentación', percentage: 30 },
          // ... más categorías
        ],
        savingsPercentage: 12,
        hasData: true,
      }}
    />
  );
}
```

### Página Completa:
```
URL: /exportar-reporte
```

## Funcionalidades Interactivas

1. **Navegación de Períodos**: Cambiar mes/año con flechas
2. **Selección de Formato**: Cambiar entre PDF y Excel
3. **Generación de Reporte**: Click genera descarga simulada
4. **Feedback Visual**: Mensajes de estado (éxito/error)

## Estados de la Interfaz

| Estado | Descripción |
|--------|------------|
| **Idle** | Interfaz lista, sin acción |
| **Loading** | Procesando generación de reporte |
| **Success** | Reporte generado, descargado |
| **Error/Empty** | Sin datos en el período |

## Integraciones Necesarias

Para conectar con datos reales:

1. **Obtener resumen del backend**: Hook para traer datos del API
   ```tsx
   const { data: summary } = useReportSummary(userId, month, year);
   ```

2. **Generar PDF/Excel**: Usar librerías como:
   - `jspdf` (PDF)
   - `xlsx` (Excel)

3. **Llamada al API**: Endpoint para generar reportes
   ```
   POST /api/reportes/generar
   Body: { usuarioId, mes, año, formato }
   ```

## Notas de Implementación

- ✅ Usa componentes de shadcn/ui (Button, RadioGroup, Label)
- ✅ Completamente responsivo (grid md:grid-cols-3)
- ✅ Accesibilidad: aria-labels en botones
- ✅ Estados deshabilitados manejados automáticamente
- ✅ Animaciones smooth con transition-all
- ✅ Uso de lucide-react para iconos

## Próximos Pasos

1. Conectar con endpoint del backend para obtener datos reales
2. Implementar generación real de PDF y Excel
3. Agregar validaciones de fechas (no permitir períodos futuros)
4. Agregar análisis más detallados (gráficos adicionales)
5. Implementar descarga directa del servidor

## Pruebas Recomendadas

- [ ] Cambio de período (navegación mes anterior/siguiente)
- [ ] Selección de formato (PDF/Excel)
- [ ] Generación de reporte (simulado funciona)
- [ ] Estado vacío (sin datos)
- [ ] Responsive en móvil (3 col -> 1 col)
- [ ] Accesibilidad (navegación con teclado)
