// @ts-nocheck
import type { APIRoute } from "astro";

export const prerender = false;

/** Clear the local session cookie. (The upstream Supabase session expires on
 * its own; we only drop our copy.) */
export const POST: APIRoute = async ({ cookies }) => {
  cookies.delete("kurokami_session", { path: "/" });
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
};
