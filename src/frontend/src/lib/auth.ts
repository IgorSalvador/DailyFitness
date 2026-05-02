const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export interface AuthUser {
  id: string | null;
  name: string | null;
  email: string | null;
  role: string | null;
}

// Schemas usados pelo backend .NET (ClaimTypes)
const CLAIM_KEYS = {
  id: [
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
    "nameid",
    "sub",
    "id",
  ],
  name: [
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
    "name",
    "unique_name",
  ],
  email: [
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
    "email",
  ],
  role: [
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
    "role",
    "roles",
  ],
} as const;

function pickClaim(payload: Record<string, unknown>, keys: readonly string[]): string | null {
  for (const k of keys) {
    const v = payload[k];
    if (typeof v === "string" && v.trim() !== "") return v;
    if (typeof v === "number") return String(v);
  }
  return null;
}

/**
 * Decodifica o payload de um JWT sem validar a assinatura.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Extrai informações do usuário a partir de um JWT.
 */
export function extractUserFromToken(token: string): AuthUser | null {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  return {
    id: pickClaim(payload, CLAIM_KEYS.id),
    name: pickClaim(payload, CLAIM_KEYS.name),
    email: pickClaim(payload, CLAIM_KEYS.email),
    role: pickClaim(payload, CLAIM_KEYS.role),
  };
}

export function saveAuth(token: string, user?: AuthUser | Record<string, unknown>) {
  localStorage.setItem(TOKEN_KEY, token);
  const resolvedUser = user ?? extractUserFromToken(token);
  if (resolvedUser) {
    localStorage.setItem(USER_KEY, JSON.stringify(resolvedUser));
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      // fallback abaixo
    }
  }
  const token = getToken();
  return token ? extractUserFromToken(token) : null;
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Retorna timestamp (ms) de expiração do token, ou null.
 */
export function getTokenExpiration(): number | null {
  const token = getToken();
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  const exp = payload && typeof payload.exp === "number" ? payload.exp : null;
  return exp ? exp * 1000 : null;
}

// ----- Eventos de sessão expirada (pub/sub simples) -----
type Listener = () => void;
const expiredListeners = new Set<Listener>();
let expiredDispatched = false;

export function onSessionExpired(listener: Listener): () => void {
  expiredListeners.add(listener);
  return () => expiredListeners.delete(listener);
}

function dispatchSessionExpired() {
  if (expiredDispatched) return;
  expiredDispatched = true;
  expiredListeners.forEach((l) => {
    try {
      l();
    } catch {
      /* noop */
    }
  });
}

/**
 * Verifica se o token JWT armazenado ainda é válido (não expirou).
 * Se expirado, limpa o storage e dispara evento de sessão expirada.
 */
export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;

  const payload = decodeJwtPayload(token);
  if (!payload) return true;

  const exp = typeof payload.exp === "number" ? payload.exp : null;
  if (exp === null) return true;

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (exp <= nowSeconds) {
    clearAuth();
    dispatchSessionExpired();
    return false;
  }
  return true;
}

/**
 * Inicia um watcher que verifica periodicamente se o token expirou.
 * Quando expirar, dispara o evento de sessão expirada.
 */
export function startSessionWatcher(intervalMs = 15000): () => void {
  // reset flag quando um novo watcher inicia com sessão válida
  if (getToken()) expiredDispatched = false;

  const check = () => {
    const token = getToken();
    if (!token) return;
    isAuthenticated();
  };

  check();
  const id = window.setInterval(check, intervalMs);
  return () => window.clearInterval(id);
}

export function resetSessionExpiredFlag() {
  expiredDispatched = false;
}
