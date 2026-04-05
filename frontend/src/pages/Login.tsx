import { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { DollarSign, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!isLogin && !form.name.trim()) errs.name = 'El nombre es requerido';
    if (!form.email.trim()) errs.email = 'El correo es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Correo inválido';
    if (!form.password) errs.password = 'La contraseña es requerida';
    else if (form.password.length < 8) errs.password = 'Mínimo 8 caracteres';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const errs = validate();
  if (Object.keys(errs).length > 0) {
    setErrors(errs);
    return;
  }

  try {
    if (isLogin) {
      // Login
      const response = await api.post('/usuarios/login', {
        correo: form.email,
        password: form.password,
      });
      localStorage.removeItem('usuario');
      localStorage.setItem('usuario', JSON.stringify(response.data));
      navigate('/dashboard');
    } else {
      // Registro
      const response = await api.post('/usuarios/registro', {
        nombre: form.name,
        correo: form.email,
        password: form.password,
      });
      localStorage.removeItem('usuario');
      localStorage.setItem('usuario', JSON.stringify(response.data));
      navigate('/dashboard');
    }
  } catch (error: any) {
    setErrors({ general: 'Error al conectar con el servidor' });
  }
};

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-6 py-10">
      {/* Logo */}
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary shadow-lg" aria-hidden="true">
        <DollarSign className="h-7 w-7 text-primary-foreground" />
      </div>

      <h1 className="text-2xl font-bold text-foreground">
        {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Gestiona tus finanzas de forma inteligente
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 w-full max-w-sm rounded-2xl bg-card p-6 shadow-sm"
        noValidate
      >
        {!isLogin && (
          <div className="mb-4">
            <Label htmlFor="name" className="mb-1.5 block font-semibold text-foreground">
              Nombre Completo
            </Label>
            <Input
              id="name"
              placeholder="Ej. María González"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
              className="rounded-xl bg-secondary"
            />
            {errors.name && <p id="name-error" className="mt-1 text-xs text-destructive" role="alert">{errors.name}</p>}
          </div>
        )}

        <div className="mb-4">
          <Label htmlFor="email" className="mb-1.5 block font-semibold text-foreground">
            Correo Electrónico
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="correo@ejemplo.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className="rounded-xl bg-secondary"
          />
          {errors.email && <p id="email-error" className="mt-1 text-xs text-destructive" role="alert">{errors.email}</p>}
        </div>

        <div className="mb-6">
          <Label htmlFor="password" className="mb-1.5 block font-semibold text-foreground">
            Contraseña
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Mínimo 8 caracteres"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              className="rounded-xl bg-secondary pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p id="password-error" className="mt-1 text-xs text-destructive" role="alert">{errors.password}</p>}
        </div>

        <Button type="submit" className="w-full rounded-xl text-base font-semibold h-12">
          {isLogin ? 'Iniciar Sesión' : 'Registrarme'}
        </Button>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">o continuar con</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full rounded-xl h-12 font-medium"
        >
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Iniciar Sesión con Google
        </Button>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}{' '}
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setErrors({}); }}
            className="font-semibold text-primary hover:underline"
          >
            {isLogin ? 'Regístrate' : 'Inicia Sesión'}
          </button>
        </p>
      </form>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Al registrarte, aceptas nuestros{' '}
        <Link to="#" className="font-medium text-primary hover:underline">Términos de Servicio</Link>
        {' '}y{' '}
        <Link to="#" className="font-medium text-primary hover:underline">Política de Privacidad</Link>
      </p>
    </div>
  );
}
