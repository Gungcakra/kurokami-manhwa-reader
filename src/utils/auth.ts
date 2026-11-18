// @ts-nocheck
/**
 * Client-side auth helpers for Kurokami.
 *
 * Shinigami's login is behind a Cloudflare challenge, so instead of proxying
 * credentials the user pastes their `__session_v2` cookie into our
 * `/api/auth/import` route (see `src/pages/api/auth/import.ts`). On success we keep the public profile + the
 * izanami token in localStorage so the browser can call api.shinigami.io with a
 * Bearer token, and the server also holds an httpOnly copy for reload recovery.
 */

const STORE_KEY = "kurokami_auth";

export type AuthUser = {
  user_id: string;
  username: string;
  email?: string;
  avatar_image_url?: string;
  is_premium: boolean;
  token: string;
  expiresAt?: number;
};

/** Read the cached session, or null if missing/expired. */
export function getAuth(): AuthUser | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const u = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
    if (!u?.token) return null;
    if (u.expiresAt && Date.now() > u.expiresAt) {
      localStorage.removeItem(STORE_KEY);
      return null;
    }
    return u;
  } catch {
    return null;
  }
}

function save(user: AuthUser) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(user));
  } catch {}
  notify();
}

function clear() {
  try {
    localStorage.removeItem(STORE_KEY);
  } catch {}
  notify();
}

/** Broadcast auth changes so any mounted component (e.g. Navbar) can react. */
function notify() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kurokami-auth"));
  }
}

export function onAuthChange(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener("kurokami-auth", handler);
  window.addEventListener("storage", handler); // sync across tabs
  return () => {
    window.removeEventListener("kurokami-auth", handler);
    window.removeEventListener("storage", handler);
  };
}

/** Import a pasted `__session_v2` cookie value. Throws Error(message) on failure. */
export async function importSession(session: string): Promise<AuthUser> {
  const res = await fetch("/api/auth/import", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ session }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Login gagal");
  save(data);
  return data;
}

export async function logout(): Promise<void> {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {}
  clear();
}

/** Headers for an authenticated api.shinigami.io request. */
export function authHeader(): Record<string, string> {
  const u = getAuth();
  return u?.token ? { Authorization: `Bearer ${u.token}` } : {};
}
