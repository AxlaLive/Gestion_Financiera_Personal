import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { DollarSign, Eye, EyeOff, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const { validateResetToken, resetPassword } = useAuth();

  const [status, setStatus] = useState<"checking" | "valid" | "invalid">("checking");
  const [reason, setReason] = useState<"missing" | "expired" | "used" | null>(null);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      setReason("missing");
      return;
    }
    const result = validateResetToken(token);
    if (result.ok) {
      setStatus("valid");
      setEmail(result.email);
    } else {
      setStatus("invalid");
      setReason(result.reason);
    }
  }, [token, validateResetToken]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    const result = resetPassword(token, password);
    if (!result.ok) {
      setError(
        result.reason === "weak"
          ? "La contraseña no cumple los requisitos mínimos"
          : "El enlace no es válido o ha expirado",
      );
      return;
    }
    toast.success("Contraseña actualizada", {
      description: "Ya puedes iniciar sesión con tu nueva contraseña.",
    });
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg">
            <DollarSign className="h-8 w-8 text-white" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-slate-900">Restablecer contraseña</h1>
          {status === "valid" && (
            <p className="text-base text-slate-600">
              Define una nueva contraseña para <strong>{email}</strong>.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
          {status === "checking" && (
            <p className="text-center text-sm text-slate-500">Validando enlace…</p>
          )}

          {status === "invalid" && (
            <div className="space-y-4 text-center">
              <div className="rounded-xl bg-red-50 p-4 text-sm text-red-800">
                {reason === "expired" && "El enlace ha expirado. Solicita uno nuevo."}
                {reason === "used" && "Este enlace ya fue utilizado. Solicita uno nuevo."}
                {reason === "missing" && "El enlace no es válido."}
              </div>
              <Link
                to="/forgot-password"
                className="inline-block text-base font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Solicitar un nuevo enlace
              </Link>
            </div>
          )}

          {status === "valid" && (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <Label htmlFor="password" className="mb-2 block text-base font-semibold text-slate-900">
                  Nueva contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    type={show ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 px-10 text-base"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500"
                    aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirm" className="mb-2 block text-base font-semibold text-slate-900">
                  Confirmar contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="confirm"
                    type={show ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="h-12 pl-10 text-base"
                    placeholder="Repite tu contraseña"
                  />
                </div>
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="h-14 w-full rounded-xl bg-emerald-600 text-base font-semibold text-white shadow-lg hover:bg-emerald-700"
              >
                Actualizar contraseña
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
