import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, DollarSign, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [devUrl, setDevUrl] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const emailError = !email.trim()
    ? "El correo es requerido"
    : !EMAIL_REGEX.test(email)
      ? "Correo inválido"
      : "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!email.trim() || emailError) return;

    const result = requestPasswordReset(email.trim());

    // CA-03: mensaje genérico independientemente del resultado real
    setSubmitted(true);

    if (result.ok) {
      // En producción esto se enviaría por correo. Aquí mostramos el enlace
      // para poder probar el flujo desde la misma interfaz.
      setDevUrl(result.url);
      toast.success("Enlace de recuperación generado", {
        description: "Tiene una vigencia de 30 minutos.",
      });
    } else {
      setDevUrl(null);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg">
            <DollarSign className="h-8 w-8 text-white" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-slate-900">Recuperar contraseña</h1>
          <p className="text-base text-slate-600">
            Ingresa tu correo y te enviaremos un enlace para restablecerla.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
          {!submitted ? (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <Label htmlFor="email" className="mb-2 block text-base font-semibold text-slate-900">
                  Correo electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched(true)}
                    className={`h-12 border-slate-300 pl-10 text-base ${
                      touched && emailError ? "border-red-500 bg-red-50" : ""
                    }`}
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                {touched && emailError && (
                  <p className="mt-1 text-sm text-red-600">{emailError}</p>
                )}
              </div>
              <Button
                type="submit"
                className="h-14 w-full rounded-xl bg-emerald-600 text-base font-semibold text-white shadow-lg hover:bg-emerald-700"
              >
                Recuperar contraseña
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">
                Si el correo <strong>{email}</strong> está registrado, recibirás un enlace de
                recuperación con vigencia de 30 minutos.
              </div>
              {devUrl && (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-xs text-slate-600">
                  <p className="mb-2 font-semibold text-slate-700">
                    Enlace de prueba (en producción llegaría por correo):
                  </p>
                  <a
                    href={devUrl}
                    className="break-all font-mono text-emerald-700 underline hover:text-emerald-800"
                  >
                    {devUrl}
                  </a>
                </div>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setSubmitted(false);
                  setDevUrl(null);
                  setEmail("");
                  setTouched(false);
                }}
                className="h-12 w-full"
              >
                Enviar a otro correo
              </Button>
            </div>
          )}

          <Link
            to="/login"
            className="mt-6 flex items-center justify-center gap-2 text-base font-semibold text-emerald-600 hover:text-emerald-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
