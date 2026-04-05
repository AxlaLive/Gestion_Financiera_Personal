import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, UtensilsCrossed, Car, Home, ShoppingCart, Heart, Gamepad2, Plane, GraduationCap, Shirt, Smartphone, Coffee, DollarSign, Calendar, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { parseAmountInput, isValidAmount, formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useCrearTransaccion } from '@/hooks/use-transacciones';
import { useCategorias } from '@/hooks/use-categorias';
import { useToast } from '@/hooks/use-toast';

const iconMap: Record<string, LucideIcon> = {
  comida: UtensilsCrossed,
  transporte: Car,
  hogar: Home,
  compras: ShoppingCart,
  salud: Heart,
  ocio: Gamepad2,
  viajes: Plane,
  educacion: GraduationCap,
  ropa: Shirt,
  tecnologia: Smartphone,
  cafes: Coffee,
};

function getCategoryIcon(nombre: string): LucideIcon {
  const key = nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return iconMap[key] ?? DollarSign;
}


export default function AddExpense() {
  const navigate = useNavigate();
  const usuarioGuardado = JSON.parse(localStorage.getItem('usuario') || '{}');
  const USUARIO_ID = usuarioGuardado.id ?? 1;
  const { toast } = useToast();
  const { data: categorias = [], isLoading: loadingCategorias } = useCategorias(USUARIO_ID, 'GASTO');
  const [amount, setAmount] = useState('0.00');
  const [date, setDate] = useState<Date>(new Date());
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [amountError, setAmountError] = useState('');

  const mutation = useCrearTransaccion();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseAmountInput(e.target.value);
    setAmount(val);
    setAmountError('');
  };

  const handleSave = () => {
    if (!isValidAmount(amount)) {
      setAmountError('Ingresa un monto válido mayor a $0');
      return;
    }
    if (!selectedCategoryId) return;

    mutation.mutate(
      {
        monto: parseFloat(amount),
        descripcion: description,
        fecha: format(date, 'yyyy-MM-dd'),
        tipo: 'GASTO',
        usuario: { id: USUARIO_ID },
        categoria: { id: selectedCategoryId },
      },
      {
        onSuccess: () => {
          toast({ title: '✅ Gasto registrado', description: 'La transacción se guardó correctamente.' });
          navigate('/dashboard');
        },
        onError: (error) => {
          toast({ title: 'Error al guardar', description: error.message, variant: 'destructive' });
        },
      }
    );
  };

  const numericAmount = parseFloat(amount) || 0;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="rounded-b-3xl bg-[hsl(var(--expense))] px-5 pb-6 pt-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Nuevo Gasto</h1>
          <button onClick={() => navigate(-1)} aria-label="Cerrar" className="text-white/80 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        <p className="text-center text-sm opacity-90 mb-2">Monto del Gasto</p>
        <div className="text-center">
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={handleAmountChange}
            onFocus={() => { if (amount === '0.00') setAmount(''); }}
            onBlur={() => { if (!amount) setAmount('0.00'); }}
            className="w-full bg-transparent text-center text-5xl font-bold text-white/40 outline-none placeholder:text-white/30 focus:text-white"
            aria-label="Monto del gasto"
            aria-invalid={!!amountError}
            aria-describedby={amountError ? 'amount-error' : undefined}
          />
          <div className="mx-auto mt-2 h-px w-3/4 bg-white/30" />
          <p className="mt-2 text-sm opacity-90">{formatCurrency(numericAmount)}</p>
        </div>
        {amountError && (
          <p id="amount-error" className="mt-1 text-center text-xs text-white font-medium bg-white/20 rounded-lg py-1" role="alert">
            {amountError}
          </p>
        )}
      </header>

      <main className="flex-1 px-5 py-6">
        <div className="mb-6">
          <h2 className="mb-2 font-semibold text-foreground">Fecha de la Transacción</h2>
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex w-full items-center justify-between rounded-xl border bg-card px-4 py-3 text-sm" aria-label="Seleccionar fecha">
                <span>{format(date, 'dd/MM/yyyy')}</span>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                disabled={(d) => d > new Date()}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          <p className="mt-1 text-xs text-muted-foreground">
            {format(date, "EEE, dd 'de' MMM 'de' yyyy", { locale: es })}
          </p>
        </div>

        <div className="mb-6">
          <h2 className="mb-3 font-semibold text-foreground">Categoría</h2>
          <div className="grid grid-cols-4 gap-3" role="radiogroup" aria-label="Categoría del gasto">
            {loadingCategorias && <p className="col-span-4 text-sm text-muted-foreground">Cargando categorías...</p>}
            {categorias.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              const Icon = getCategoryIcon(cat.nombre);
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all',
                    isSelected
                      ? 'border-[hsl(var(--expense))] bg-orange-50 text-[hsl(var(--expense))]'
                      : 'border-border bg-card text-muted-foreground hover:border-muted-foreground/30'
                  )}
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={cat.nombre}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[11px] font-medium">{cat.nombre}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="mb-2 font-semibold text-foreground">
            Descripción <span className="font-normal text-muted-foreground">(Opcional)</span>
          </h2>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 200))}
            placeholder="Ej. Compras del supermercado Walmart"
            className="rounded-xl bg-secondary resize-none"
            maxLength={200}
            aria-label="Descripción del gasto"
          />
          <p className="mt-1 text-right text-xs text-muted-foreground">{description.length}/200 caracteres</p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 rounded-xl h-12 font-semibold" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button
            className="flex-1 rounded-xl h-12 font-semibold bg-[hsl(var(--expense))] hover:bg-[hsl(var(--expense))]/90 text-white"
            onClick={handleSave}
            disabled={!isValidAmount(amount) || !selectedCategoryId || mutation.isPending}
          >
            {mutation.isPending ? 'Guardando...' : 'Guardar Gasto'}
          </Button>
        </div>
      </main>
    </div>
  );
}
