// @ts-nocheck
import type { APIRoute } from "astro";

export const prerender = false;

/**
 * Import a Shinigami session the user copied from their own browser.
 *
 * Why not log in server-side? Shinigami's login route
 * (`11.shinigami.asia/auth/supabase/login-user`) sits behind a Cloudflare
 * managed challenge (`cf-mitigated: challenge`) that rejects every non-browser
 * request — even from a residential IP. So the user logs in on Shinigami
 * normally, copies the `__session_v2` cookie value from DevTools, and pastes it
 * here.
 *
 * `__session_v2` decodes to:
 *   { user_id, token (PASETO v4.public, issuer izanami-api), username, email,
 *     avatar_image_url, is_premium, access_token, refresh_token }
 *
 * We keep only what Kurokami needs (no Supabase access/refresh tokens) in an
 * httpOnly `kurokami_session` cookie, and return the public profile + izanami
 * token for the client to call api.shngm.io.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FALLBACK_TTL = 60 * 60 * 23; // izanami token lives ~24h

/** Accept the raw cookie value (URL-encoded) or the already-decoded JSON. */
function parseSession(input: string): any | null {
  let text = input.trim().replace(/^__session_v2=/, "").replace(/;.*$/s, "");
  if (!text.startsWith("{")) {
    try {
      text = decodeURIComponent(text);
    } catch {
      return null;
    }
  }
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** Read `exp` (ms) from a PASETO v4.public token's unsigned-but-readable payload. */
function pasetoExpiry(token: string): number | null {
  const m = token.match(/^v4\.public\.([A-Za-z0-9_-]+)/);
  if (!m) return null;
  try {
    const bytes = Buffer.from(m[1], "base64url");
    // payload = message || 64-byte Ed25519 signature
    const claims = JSON.parse(bytes.subarray(0, bytes.length - 64).toString("utf8"));
    const exp = Date.parse(claims.exp);
    return Number.isNaN(exp) ? null : exp;
  } catch {
    return null;
  }
}

export const POST: APIRoute = async ({ request, cookies }) => {
  let input = "";
  try {
    input = String((await request.json()).session ?? "");
  } catch {
    return json({ error: "Body harus JSON { session }" }, 400);
  }
  if (!input.trim()) return json({ error: "Tempel nilai cookie __session_v2" }, 400);

  const session = parseSession(input);
  if (!session) {
    return json({ error: "Format tidak dikenali — pastikan menyalin seluruh nilai __session_v2" }, 400);
  }
  if (!UUID_RE.test(session.user_id ?? "") || typeof session.token !== "string") {
    return json({ error: "Sesi tidak lengkap (user_id / token tidak ditemukan)" }, 400);
  }

  const expiresAt = pasetoExpiry(session.token) ?? Date.now() + FALLBACK_TTL * 1000;
  const maxAge = Math.floor((expiresAt - Date.now()) / 1000);
  if (maxAge <= 0) {
    return json({ error: "Sesi sudah kedaluwarsa — login ulang di Shinigami lalu salin lagi" }, 401);
  }

  const user = {
    user_id: session.user_id,
    username: session.username,
    email: session.email,
    avatar_image_url: session.avatar_image_url,
    is_premium: !!session.is_premium,
    token: session.token,
    expiresAt,
  };

  cookies.set("kurokami_session", encodeURIComponent(JSON.stringify(user)), {
    httpOnly: true,
    secure: import.meta.env.PROD, // allow http://localhost during dev
    sameSite: "lax",
    path: "/",
    maxAge,
  });

  return json(user);
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}
