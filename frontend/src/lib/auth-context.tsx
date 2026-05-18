import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

const SESSION_KEY = "fin.auth.session.v1";
const USERS_KEY = "fin.auth.users.v1";
const RESET_KEY = "fin.auth.reset.v1";

// 15 minutos de inactividad antes de cerrar sesión automáticamente (CA-05)
const INACTIVITY_MS = 15 * 60 * 1000;
// 30 minutos de vigencia para el enlace de recuperación (CA-02 Recovery)
const RESET_TTL_MS = 30 * 60 * 1000;

export interface AuthUser {
  name: string;
  email: string;
}

interface StoredSession {
  user: AuthUser;
  token: string;
  issuedAt: number;
  lastActivity: number;
}

interface StoredUser {
  name: string;
  email: string;
  password: string;
}

interface ResetToken {
  email: string;
  token: string;
  expiresAt: number;
  used: boolean;
}

export type ResetRequestResult =
  | { ok: true; token: string; url: string; expiresAt: number }
  | { ok: false };

export type ResetValidationResult =
  | { ok: true; email: string }
  | { ok: false; reason: "missing" | "expired" | "used" };

export type PasswordResetOutcome =
  | { ok: true }
  | { ok: false; reason: "invalid" | "weak" };

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => { ok: boolean; error?: string };
  signUp: (name: string, email: string, password: string) => { ok: boolean; error?: string };
  signOut: (reason?: "manual" | "inactivity") => void;
  requestPasswordReset: (email: string) => ResetRequestResult;
  validateResetToken: (token: string) => ResetValidationResult;
  resetPassword: (token: string, newPassword: string) => PasswordResetOutcome;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    // ignore
  }
}

function readResets(): ResetToken[] {
  try {
    const raw = localStorage.getItem(RESET_KEY);
    return raw ? (JSON.parse(raw) as ResetToken[]) : [];
  } catch {
    return [];
  }
}

function writeResets(items: ResetToken[]) {
  try {
    localStorage.setItem(RESET_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

function genToken() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2) +
    Math.random().toString(36).slice(2)
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StoredSession | null>(null);
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cargar sesión persistida
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as StoredSession;
      // Si excede el límite de inactividad, no restaurar
      if (Date.now() - parsed.lastActivity > INACTIVITY_MS) {
        localStorage.removeItem(SESSION_KEY);
        return;
      }
      setSession(parsed);
    } catch {
      // ignore
    }
  }, []);

  const persistSession = useCallback((s: StoredSession | null) => {
    try {
      if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
      else localStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
  }, []);

  const signOut = useCallback<AuthContextValue["signOut"]>(
    (reason = "manual") => {
      setSession(null);
      persistSession(null);
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
        inactivityTimer.current = null;
      }
      if (reason === "inactivity") {
        toast.warning("Tu sesión se cerró por inactividad", {
          description: "Por seguridad, vuelve a iniciar sesión para continuar.",
        });
      }
    },
    [persistSession],
  );

  // Temporizador de inactividad — CA-05
  useEffect(() => {
    if (!session) return;

    const reset = () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => signOut("inactivity"), INACTIVITY_MS);
      setSession((prev) => {
        if (!prev) return prev;
        const next = { ...prev, lastActivity: Date.now() };
        persistSession(next);
        return next;
      });
    };

    const events: (keyof WindowEventMap)[] = [
      "mousemove",
      "keydown",
      "click",
      "scroll",
      "touchstart",
    ];

    let last = 0;
    const handler = () => {
      const now = Date.now();
      // throttle: máximo una actualización cada 30s
      if (now - last < 30_000) return;
      last = now;
      reset();
    };

    reset(); // inicia el timer
    events.forEach((e) => window.addEventListener(e, handler, { passive: true }));
    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.token, signOut, persistSession]);

  const signIn = useCallback<AuthContextValue["signIn"]>((email, password) => {
    const users = readUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      const fallbackName =
        email.split("@")[0]?.replace(/\./g, " ").replace(/^\w/, (c) => c.toUpperCase()) ||
        "Usuario";
      const newUser: StoredUser = { name: fallbackName, email, password };
      writeUsers([...users, newUser]);
      const s: StoredSession = {
        user: { name: newUser.name, email: newUser.email },
        token: genToken(),
        issuedAt: Date.now(),
        lastActivity: Date.now(),
      };
      setSession(s);
      persistSession(s);
      return { ok: true };
    }
    if (found.password !== password) {
      return { ok: false, error: "Correo o contraseña incorrectos" };
    }
    const s: StoredSession = {
      user: { name: found.name, email: found.email },
      token: genToken(),
      issuedAt: Date.now(),
      lastActivity: Date.now(),
    };
    setSession(s);
    persistSession(s);
    return { ok: true };
  }, [persistSession]);

  const signUp = useCallback<AuthContextValue["signUp"]>((name, email, password) => {
    const users = readUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, error: "Este correo ya está registrado" };
    }
    const newUser: StoredUser = { name, email, password };
    writeUsers([...users, newUser]);
    const s: StoredSession = {
      user: { name, email },
      token: genToken(),
      issuedAt: Date.now(),
      lastActivity: Date.now(),
    };
    setSession(s);
    persistSession(s);
    return { ok: true };
  }, [persistSession]);

  const requestPasswordReset = useCallback<AuthContextValue["requestPasswordReset"]>((email) => {
    const users = readUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found) return { ok: false };

    const token = genToken();
    const expiresAt = Date.now() + RESET_TTL_MS;
    const existing = readResets().filter((r) => r.email.toLowerCase() !== email.toLowerCase());
    writeResets([...existing, { email: found.email, token, expiresAt, used: false }]);
    const url = `${window.location.origin}/reset-password?token=${token}`;
    return { ok: true, token, url, expiresAt };
  }, []);

  const validateResetToken = useCallback<AuthContextValue["validateResetToken"]>((token) => {
    const items = readResets();
    const found = items.find((r) => r.token === token);
    if (!found) return { ok: false, reason: "missing" };
    if (found.used) return { ok: false, reason: "used" };
    if (Date.now() > found.expiresAt) return { ok: false, reason: "expired" };
    return { ok: true, email: found.email };
  }, []);

  const resetPassword = useCallback<AuthContextValue["resetPassword"]>((token, newPassword) => {
    if (!newPassword || newPassword.length < 6) return { ok: false, reason: "weak" };
    const items = readResets();
    const found = items.find((r) => r.token === token);
    if (!found || found.used || Date.now() > found.expiresAt) {
      return { ok: false, reason: "invalid" };
    }
    const users = readUsers();
    const next = users.map((u) =>
      u.email.toLowerCase() === found.email.toLowerCase() ? { ...u, password: newPassword } : u,
    );
    writeUsers(next);
    writeResets(items.map((r) => (r.token === token ? { ...r, used: true } : r)));
    return { ok: true };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      isAuthenticated: !!session,
      signIn,
      signUp,
      signOut,
      requestPasswordReset,
      validateResetToken,
      resetPassword,
    }),
    [session, signIn, signUp, signOut, requestPasswordReset, validateResetToken, resetPassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
