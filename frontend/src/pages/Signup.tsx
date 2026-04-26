import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  DollarSign,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type FormState = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type TouchedState = Record<keyof FormState, boolean>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [touched, setTouched] = useState<TouchedState>({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const passwordChecks = {
    minLength: form.password.length >= 8,
    hasUpper: /[A-Z]/.test(form.password),
    hasNumber: /\d/.test(form.password),
    hasSpecial: SPECIAL_CHAR_REGEX.test(form.password),
  };
  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length;
  const passwordIsValid = passwordStrength === 4;

  const errors = {
    name: !form.name.trim() ? 'El nombre completo es requerido' : '',
    email: !form.email.trim()
      ? 'El correo electrónico es requerido'
      : !EMAIL_REGEX.test(form.email)
      ? 'Correo inválido'
      : '',
    password: !form.password
      ? 'La contraseña es requerida'
      : !passwordIsValid
      ? 'La contraseña no cumple los requisitos'
      : '',
    confirmPassword: !form.confirmPassword
      ? 'Confirma tu contraseña'
      : form.password !== form.confirmPassword
      ? 'Las contraseñas no coinciden'
      : '',
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const handleChange = (field: keyof FormState) => (value: string) => {
    setForm({ ...form, [field]: value });
    if (serverError) setServerError('');
  };

  const handleBlur = (field: keyof FormState) => () => {
    setTouched({ ...touched, [field]: true });
  };

  const showError = (field: keyof FormState) =>
    touched[field] && errors[field];

  const extractBackendMessage = (error: unknown): string => {
    const err = error as {
      response?: { data?: unknown; status?: number };
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
    return 'Ocurrió un error al crear la cuenta. Intenta de nuevo.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });
    setServerError('');
    if (hasErrors) return;

    setLoading(true);
    try {
      const response = await api.post('/usuarios/registro', {
        nombre: form.name,
        correo: form.email,
        password: form.password,
      });
      localStorage.removeItem('usuario');
      localStorage.setItem('usuario', JSON.stringify(response.data));
      toast.success('Cuenta creada exitosamente', {
        description: 'Bienvenido a tu panel financiero',
      });
      navigate('/dashboard');
    } catch (error) {
      setServerError(extractBackendMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const strengthSegments = [0, 1, 2, 3];

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-6 py-10">
      <div
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg"
        aria-hidden="true"
      >
        <DollarSign className="h-8 w-8 text-primary-foreground" />
      </div>

      <h1 className="text-2xl font-bold text-foreground">Crear Cuenta</h1>
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
            htmlFor="name"
            className="mb-1.5 block font-semibold text-foreground"
          >
            Nombre Completo
          </Label>
          <div className="relative">
            <User
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="name"
              autoComplete="name"
              placeholder="Ej. María González"
              value={form.name}
              onChange={(e) => handleChange('name')(e.target.value)}
              onBlur={handleBlur('name')}
              aria-invalid={!!showError('name')}
              aria-describedby={showError('name') ? 'name-error' : undefined}
              className={`rounded-xl bg-secondary pl-10 transition-colors ${
                showError('name') ? 'border-destructive' : ''
              }`}
            />
          </div>
          {showError('name') && (
            <p
              id="name-error"
              className="mt-1 text-xs text-destructive"
              role="alert"
            >
              {errors.name}
            </p>
          )}
        </div>

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
              onChange={(e) => handleChange('email')(e.target.value)}
              onBlur={handleBlur('email')}
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

        <div className="mb-5">
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
              autoComplete="new-password"
              placeholder="Ingresa tu contraseña"
              value={form.password}
              onChange={(e) => handleChange('password')(e.target.value)}
              onBlur={handleBlur('password')}
              aria-invalid={!!showError('password')}
              aria-describedby="password-requirements"
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

          <div className="mt-2 flex gap-1" aria-hidden="true">
            {strengthSegments.map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i < passwordStrength ? 'bg-primary' : 'bg-secondary'
                }`}
              />
            ))}
          </div>

          <ul
            id="password-requirements"
            className="mt-3 space-y-1 rounded-xl bg-secondary p-3 text-xs"
          >
            <Requirement met={passwordChecks.minLength}>
              Mínimo 8 caracteres
            </Requirement>
            <Requirement met={passwordChecks.hasUpper}>
              Al menos 1 letra mayúscula
            </Requirement>
            <Requirement met={passwordChecks.hasNumber}>
              Al menos 1 número
            </Requirement>
            <Requirement met={passwordChecks.hasSpecial}>
              Al menos 1 carácter especial (!@#$...)
            </Requirement>
          </ul>

          {showError('password') && (
            <p
              className="mt-1 text-xs text-destructive"
              role="alert"
            >
              {errors.password}
            </p>
          )}
        </div>

        <div className="mb-6">
          <Label
            htmlFor="confirmPassword"
            className="mb-1.5 block font-semibold text-foreground"
          >
            Confirmar Contraseña
          </Label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Repite tu contraseña"
              value={form.confirmPassword}
              onChange={(e) => handleChange('confirmPassword')(e.target.value)}
              onBlur={handleBlur('confirmPassword')}
              aria-invalid={!!showError('confirmPassword')}
              aria-describedby={
                showError('confirmPassword')
                  ? 'confirm-password-error'
                  : undefined
              }
              className={`rounded-xl bg-secondary pl-10 pr-10 transition-colors ${
                showError('confirmPassword') ? 'border-destructive' : ''
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={
                showConfirmPassword
                  ? 'Ocultar contraseña'
                  : 'Mostrar contraseña'
              }
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {showError('confirmPassword') && (
            <p
              id="confirm-password-error"
              className="mt-1 text-xs text-destructive"
              role="alert"
            >
              {errors.confirmPassword}
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
              Creando cuenta...
            </>
          ) : (
            'Registrarme'
          )}
        </Button>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          ¿Ya tienes una cuenta?{' '}
          <Link
            to="/login"
            className="font-semibold text-primary hover:underline"
          >
            Inicia Sesión
          </Link>
        </p>
      </form>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Al registrarte, aceptas nuestros{' '}
        <Link to="#" className="font-medium text-primary hover:underline">
          Términos de Servicio
        </Link>{' '}
        y{' '}
        <Link to="#" className="font-medium text-primary hover:underline">
          Política de Privacidad
        </Link>
        .
      </p>
    </div>
  );
}

function Requirement({
  met,
  children,
}: {
  met: boolean;
  children: React.ReactNode;
}) {
  return (
    <li
      className={`flex items-center gap-2 transition-colors ${
        met ? 'text-primary' : 'text-muted-foreground'
      }`}
    >
      {met ? (
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      <span>{children}</span>
    </li>
  );
}
