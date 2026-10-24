// @ts-nocheck
import type { APIRoute } from "astro";

export const prerender = false;

/**
 * Restore the current session from the httpOnly `kurokami_session` cookie.
 * Lets the client re-hydrate auth after a reload without keeping the token in
 * localStorage longer than needed. Returns 401 when there is no live session.
 */
export const GET: APIRoute = async ({ cookies }) => {
  const raw = cookies.get("kurokami_session")?.value;
  if (!raw) return json({ error: "Tidak ada sesi" }, 401);

  let session: any;
  try {
    session = JSON.parse(decodeURIComponent(raw));
  } catch {
    return json({ error: "Sesi rusak" }, 401);
  }

  return json({
    user_id: session.user_id,
    username: session.username,
    email: session.email,
    avatar_image_url: session.avatar_image_url,
    is_premium: !!session.is_premium,
    token: session.token,
    expiresAt: session.expiresAt,
  });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}
