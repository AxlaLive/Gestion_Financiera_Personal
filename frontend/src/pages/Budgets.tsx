import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, TrendingUp } from 'lucide-react';
import api from '../api/axios';
import { formatCurrency } from '@/lib/currency';
import { BudgetCard, Budget } from '@/components/BudgetCard';
import { useCategorias } from '@/hooks/use-categorias';
import { useToast } from '@/hooks/use-toast';

interface EstadoPresupuestoDTO {
  categoriaId: number;
  categoriaNombre: string;
  presupuestoMaximo: number;
  gastoActual: number;
  porcentajeConsumido: number;
  excedido: boolean;
  mes: string;
}

export default function Budgets() {
  const navigate = useNavigate();
  const usuarioGuardado = JSON.parse(localStorage.getItem('usuario') || '{}');
  const USUARIO_ID = usuarioGuardado?.id as number | undefined;
  const { toast } = useToast();
  const { data: categorias = [], isLoading: loadingCategorias } = useCategorias(USUARIO_ID, 'GASTO');

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loadingBudgets, setLoadingBudgets] = useState(true);
  const [budgetError, setBudgetError] = useState<string | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<EstadoPresupuestoDTO | null>(null);
  const [selectedBudgetLimit, setSelectedBudgetLimit] = useState('');
  const [savingBudget, setSavingBudget] = useState(false);
  const [loadingBudgetDetails, setLoadingBudgetDetails] = useState(false);
  const [showCreateBudgetForm, setShowCreateBudgetForm] = useState(false);
  const [newBudgetCategoryId, setNewBudgetCategoryId] = useState<number | null>(null);
  const [newBudgetMonth, setNewBudgetMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [newBudgetLimit, setNewBudgetLimit] = useState('');
  const [creatingBudget, setCreatingBudget] = useState(false);

  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0);
  const totalPercent = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;
  const remaining = totalLimit - totalSpent;

  async function loadBudgets() {
    if (!USUARIO_ID) return;
    setLoadingBudgets(true);
    setBudgetError(null);

    try {
      const response = await api.get<EstadoPresupuestoDTO[]>(`/presupuestos/estado-todos/${USUARIO_ID}`);
      const mapped = response.data.map((item) => ({
        id: String(item.categoriaId),
        category: item.categoriaNombre.toLowerCase(),
        label: item.categoriaNombre,
        spent: item.gastoActual,
        limit: item.presupuestoMaximo,
      }));
      setBudgets(mapped);
    } catch (error) {
      console.error(error);
      setBudgetError('No se pudieron cargar los presupuestos.');
      setBudgets([]);
    } finally {
      setLoadingBudgets(false);
    }
  }

  async function fetchBudgetDetails(categoriaId: number) {
    if (!USUARIO_ID) return;
    setLoadingBudgetDetails(true);
    setSelectedBudget(null);

    try {
      const response = await api.get<EstadoPresupuestoDTO>(`/presupuestos/estado/${USUARIO_ID}/${categoriaId}`);
      setSelectedBudget(response.data);
      setSelectedBudgetLimit(String(response.data.presupuestoMaximo));
    } catch (error) {
      console.error(error);
      setBudgetError('No se pudo cargar el detalle del presupuesto.');
      setSelectedBudget(null);
    } finally {
      setLoadingBudgetDetails(false);
    }
  }

  async function handleSaveBudget() {
    if (!selectedBudget) return;
    const presupuestoMaximo = Number(selectedBudgetLimit);
    if (!presupuestoMaximo || presupuestoMaximo <= 0) {
      toast({ title: 'Presupuesto inválido', description: 'Ingresa un monto mayor a cero.', variant: 'destructive' });
      return;
    }

    setSavingBudget(true);
    try {
      await api.post('/presupuestos', null, {
        params: {
          usuarioId: USUARIO_ID,
          categoriaId: selectedBudget.categoriaId,
          mes: selectedBudget.mes,
          presupuestoMaximo,
        },
      });

      toast({ title: 'Presupuesto actualizado', description: 'Se guardó el límite correctamente.' });
      await loadBudgets();
      await fetchBudgetDetails(selectedBudget.categoriaId);
    } catch (error) {
      console.error(error);
      toast({ title: 'Error al guardar', description: 'No se pudo actualizar el presupuesto.', variant: 'destructive' });
    } finally {
      setSavingBudget(false);
    }
  }

  async function handleCreateBudget() {
    if (!newBudgetCategoryId) {
      toast({ title: 'Selecciona una categoría', description: 'Elige una categoría para el presupuesto.', variant: 'destructive' });
      return;
    }

    const presupuestoMaximo = Number(newBudgetLimit);
    if (!presupuestoMaximo || presupuestoMaximo <= 0) {
      toast({ title: 'Presupuesto inválido', description: 'Ingresa un monto mayor a cero.', variant: 'destructive' });
      return;
    }

    if (!newBudgetMonth) {
      toast({ title: 'Mes inválido', description: 'Selecciona el mes del presupuesto.', variant: 'destructive' });
      return;
    }

    setCreatingBudget(true);
    try {
      await api.post('/presupuestos', null, {
        params: {
          usuarioId: USUARIO_ID,
          categoriaId: newBudgetCategoryId,
          mes: newBudgetMonth,
          presupuestoMaximo,
        },
      });

      toast({ title: 'Presupuesto creado', description: 'Se agregó un nuevo presupuesto correctamente.' });
      setShowCreateBudgetForm(false);
      setNewBudgetCategoryId(null);
      setNewBudgetLimit('');
      setNewBudgetMonth(new Date().toISOString().slice(0, 7));
      await loadBudgets();
    } catch (error) {
      console.error(error);
      toast({ title: 'Error al crear', description: 'No se pudo crear el presupuesto.', variant: 'destructive' });
    } finally {
      setCreatingBudget(false);
    }
  }

  useEffect(() => {
    loadBudgets();
  }, [USUARIO_ID]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="rounded-b-3xl bg-primary px-5 pb-6 pt-6 text-primary-foreground">
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => navigate(-1)} aria-label="Volver" className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/20">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold">Mis Presupuestos</h1>
          <button aria-label="Agregar presupuesto" className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/20">
            <Plus className="h-5 w-5" />
          </button>
        </div>

        <div className="rounded-xl bg-primary-foreground/15 p-4">
          <div className="flex justify-between text-sm opacity-90 mb-1">
            <span>Total gastado este mes</span>
            <span>De tu límite</span>
          </div>
          <div className="flex justify-between font-bold text-xl mb-1">
            <span>{formatCurrency(totalSpent)}</span>
            <span>{formatCurrency(totalLimit)}</span>
          </div>
          <div className="flex justify-between text-xs opacity-80 mb-3">
            <span>{totalPercent}% usado</span>
            <span>{formatCurrency(remaining)} restante</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-primary-foreground/20 overflow-hidden" role="progressbar" aria-valuenow={totalPercent} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-primary-foreground transition-all" style={{ width: `${Math.min(totalPercent, 100)}%` }} />
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Por Categoría</h2>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span>Marzo 2026</span>
          </div>
        </div>

        <div className="space-y-4" role="list" aria-label="Presupuestos por categoría">
          {loadingBudgets ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
              Cargando presupuestos...
            </div>
          ) : budgetError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center text-sm text-destructive">
              {budgetError}
            </div>
          ) : budgets.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
              No hay presupuestos registrados para este mes.
            </div>
          ) : (
            budgets.map((b) => (
              <button key={b.id} type="button" onClick={() => fetchBudgetDetails(Number(b.id))} className="w-full text-left">
                <BudgetCard budget={b} />
              </button>
            ))
          )}
        </div>

        <div className="mt-6 rounded-xl bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground">Detalle por categoría</h2>
            {selectedBudget && (
              <button type="button" onClick={() => setSelectedBudget(null)} className="text-sm text-muted-foreground hover:text-foreground">
                Cerrar
              </button>
            )}
          </div>

          {loadingBudgetDetails ? (
            <p className="text-sm text-muted-foreground">Cargando detalle...</p>
          ) : selectedBudget ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Categoría: <span className="font-medium text-foreground">{selectedBudget.categoriaNombre}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Mes: <span className="font-medium text-foreground">{selectedBudget.mes}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Gasto actual: <span className="font-medium text-foreground">{formatCurrency(selectedBudget.gastoActual)}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Límite actual: <span className="font-medium text-foreground">{formatCurrency(selectedBudget.presupuestoMaximo)}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Porcentaje consumido: <span className="font-medium text-foreground">{Math.round(selectedBudget.porcentajeConsumido)}%</span>
              </p>
              <p className={`text-sm font-medium ${selectedBudget.excedido ? 'text-destructive' : 'text-emerald-600'}`}>
                {selectedBudget.excedido ? 'Presupuesto excedido' : 'Dentro del presupuesto'}
              </p>

              <div className="space-y-2">
                <label htmlFor="budget-limit" className="block text-sm font-medium text-foreground">Actualizar límite</label>
                <input
                  id="budget-limit"
                  type="number"
                  min="1"
                  value={selectedBudgetLimit}
                  onChange={(e) => setSelectedBudgetLimit(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Nuevo límite mensual"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveBudget}
                disabled={savingBudget}
                className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingBudget ? 'Guardando...' : 'Guardar presupuesto'}
              </button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Selecciona un presupuesto para ver detalles y actualizar el límite.</p>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowCreateBudgetForm((value) => !value)}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-4 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          <Plus className="h-4 w-4" />
          {showCreateBudgetForm ? 'Cancelar nuevo presupuesto' : 'Agregar Nuevo Presupuesto'}
        </button>

        {showCreateBudgetForm && (
          <div className="mt-6 rounded-xl bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">Nuevo presupuesto</h2>
                <p className="text-sm text-muted-foreground">Define un límite mensual para una categoría.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Categoría</label>
                {loadingCategorias ? (
                  <p className="text-sm text-muted-foreground">Cargando categorías...</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {categorias.map((categoria) => {
                      const isSelected = newBudgetCategoryId === categoria.id;
                      return (
                        <button
                          key={categoria.id}
                          type="button"
                          onClick={() => setNewBudgetCategoryId(categoria.id)}
                          className={`rounded-xl border px-3 py-2 text-left text-sm transition ${isSelected ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-background text-muted-foreground hover:border-primary/70'}`}
                        >
                          {categoria.nombre}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="new-budget-month" className="block text-sm font-medium text-foreground mb-2">Mes</label>
                  <input
                    id="new-budget-month"
                    type="month"
                    value={newBudgetMonth}
                    onChange={(e) => setNewBudgetMonth(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="new-budget-limit" className="block text-sm font-medium text-foreground mb-2">Límite mensual</label>
                  <input
                    id="new-budget-limit"
                    type="number"
                    min="1"
                    value={newBudgetLimit}
                    onChange={(e) => setNewBudgetLimit(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateBudgetForm(false);
                    setNewBudgetCategoryId(null);
                    setNewBudgetLimit('');
                    setNewBudgetMonth(new Date().toISOString().slice(0, 7));
                  }}
                  className="flex-1 rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-muted-foreground hover:border-primary"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCreateBudget}
                  disabled={creatingBudget}
                  className="flex-1 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creatingBudget ? 'Creando...' : 'Crear presupuesto'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tip */}
        <div className="mt-6 rounded-xl bg-blue-50 p-4 flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-[hsl(var(--income))]">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">Tip para ahorrar</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Estás gastando más en <strong>Compras</strong> este mes. Intenta reducir un 20% el próximo mes para mantener tu presupuesto equilibrado.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
