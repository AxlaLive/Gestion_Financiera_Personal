export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';

export const SESSION_STORAGE_KEY = 'usuario';

export const AUTH_SESSION_CLEARED_EVENT = 'auth:session-cleared';

/** JWT del backend: tres segmentos separados por punto */
export function isBackendJwtToken(token: string): boolean {
  return token.split('.').length === 3;
}

export function getStoredToken(): string | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const usuario = JSON.parse(raw) as { token?: string };
    const token = usuario?.token ?? null;
    if (!token || !isBackendJwtToken(token)) return null;
    return token;
  } catch {
    return null;
  }
}

export function getAuthHeaders(extra?: HeadersInit): HeadersInit {
  const headers = new Headers(extra);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const token = getStoredToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
}

let redirectingToLogin = false;

export function clearAuthSession(options?: { redirect?: boolean }): void {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(AUTH_SESSION_CLEARED_EVENT));

  if (options?.redirect === false) return;

  const path = window.location.pathname;
  if (path.startsWith('/login') || path.startsWith('/signup')) return;
  if (redirectingToLogin) return;

  redirectingToLogin = true;
  window.location.replace('/login');
}

export function clearSessionAndRedirectToLogin(): void {
  clearAuthSession({ redirect: true });
}

const PUBLIC_AUTH_PATHS = [
  '/usuarios/login',
  '/usuarios/registro',
  '/auth/forgot-password',
  '/auth/reset-password',
] as const;

export function isPublicAuthRequest(url: string): boolean {
  const path = url.toLowerCase();
  return PUBLIC_AUTH_PATHS.some((segment) => path.includes(segment));
}

export function shouldHandleUnauthorized(url: string): boolean {
  return !isPublicAuthRequest(url);
}
