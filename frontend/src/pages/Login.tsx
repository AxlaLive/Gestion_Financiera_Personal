import { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { DollarSign, Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const errors = {
    email: !form.email.trim()
      ? 'El correo es requerido'
      : !EMAIL_REGEX.test(form.email)
      ? 'Correo inválido'
      : '',
    password: !form.password ? 'La contraseña es requerida' : '',
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const showError = (field: 'email' | 'password') =>
    touched[field] && errors[field];

  const extractBackendMessage = (error: unknown): string => {
    const err = error as {
      response?: { data?: unknown };
      message?: string;
    };
    const data = err?.response?.data;
    if (typeof data === 'string' && data.trim()) return data;
    if (data && typeof data === 'object') {
      const maybe = data as { message?: string; error?: string };
      if (maybe.message) return maybe.message;
      if (maybe.error) return maybe.error;
    }
    if (err?.message === 'Network Error') {
      return 'No se pudo conectar con el servidor. Verifica tu conexión.';
    }
    return 'Ocurrió un error al iniciar sesión. Intenta de nuevo.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setServerError('');
    if (hasErrors) return;

    setLoading(true);
    try {
      const response = await api.post('/usuarios/login', {
        correo: form.email,
        password: form.password,
      });
      localStorage.removeItem('usuario');
      localStorage.setItem('usuario', JSON.stringify(response.data));
      toast.success('Sesión iniciada correctamente');
      navigate('/dashboard');
    } catch (error) {
      setServerError(extractBackendMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-6 py-10">
      <div
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg"
        aria-hidden="true"
      >
        <DollarSign className="h-8 w-8 text-primary-foreground" />
      </div>

      <h1 className="text-2xl font-bold text-foreground">Iniciar Sesión</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Gestiona tus finanzas de forma inteligente
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 w-full max-w-sm rounded-3xl bg-card p-6 shadow-xl"
        noValidate
      >
        <div className="mb-5">
          <Label
            htmlFor="email"
            className="mb-1.5 block font-semibold text-foreground"
          >
            Correo Electrónico
          </Label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="correo@ejemplo.com"
              value={form.email}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                if (serverError) setServerError('');
              }}
              onBlur={() => setTouched({ ...touched, email: true })}
              aria-invalid={!!showError('email')}
              aria-describedby={showError('email') ? 'email-error' : undefined}
              className={`rounded-xl bg-secondary pl-10 transition-colors ${
                showError('email') ? 'border-destructive' : ''
              }`}
            />
          </div>
          {showError('email') && (
            <p
              id="email-error"
              className="mt-1 text-xs text-destructive"
              role="alert"
            >
              {errors.email}
            </p>
          )}
        </div>

        <div className="mb-6">
          <Label
            htmlFor="password"
            className="mb-1.5 block font-semibold text-foreground"
          >
            Contraseña
          </Label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Ingresa tu contraseña"
              value={form.password}
              onChange={(e) => {
                setForm({ ...form, password: e.target.value });
                if (serverError) setServerError('');
              }}
              onBlur={() => setTouched({ ...touched, password: true })}
              aria-invalid={!!showError('password')}
              aria-describedby={
                showError('password') ? 'password-error' : undefined
              }
              className={`rounded-xl bg-secondary pl-10 pr-10 transition-colors ${
                showError('password') ? 'border-destructive' : ''
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={
                showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
              }
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {showError('password') && (
            <p
              id="password-error"
              className="mt-1 text-xs text-destructive"
              role="alert"
            >
              {errors.password}
            </p>
          )}
        </div>

        {serverError && (
          <div
            className="mb-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
            role="alert"
          >
            {serverError}
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-xl text-base font-semibold"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Iniciando sesión...
            </>
          ) : (
            'Iniciar Sesión'
          )}
        </Button>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          ¿No tienes una cuenta?{' '}
          <Link
            to="/signup"
            className="font-semibold text-primary hover:underline"
          >
            Regístrate
          </Link>
        </p>
      </form>
    </div>
  );
}
