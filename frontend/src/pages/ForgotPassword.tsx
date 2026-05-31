import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, DollarSign, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "../api/axios";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const emailError = !email.trim()
    ? "El correo es requerido"
    : !EMAIL_REGEX.test(email)
      ? "Correo inválido"
      : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setServerError("");
    if (!email.trim() || emailError) return;

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { correo: email.trim() });
      setSubmitted(true);
      toast.success("Solicitud recibida", {
        description: "Si el correo está registrado, recibirás un enlace para recuperarlo.",
      });
    } catch (error) {
      setServerError(
        "No se pudo procesar la solicitud. Verifica tu conexión o intenta más tarde.",
      );
    } finally {
      setLoading(false);
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

              {serverError && (
                <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                  {serverError}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="h-14 w-full rounded-xl bg-emerald-600 text-base font-semibold text-white shadow-lg hover:bg-emerald-700"
              >
                {loading ? "Enviando..." : "Recuperar contraseña"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">
                Si el correo <strong>{email}</strong> está registrado, recibirás un enlace de recuperación con vigencia de 30 minutos.
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSubmitted(false);
                  setEmail("");
                  setTouched(false);
                  setServerError("");
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
