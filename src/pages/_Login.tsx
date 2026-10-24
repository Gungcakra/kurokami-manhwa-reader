// @ts-nocheck
import React, { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import BottomNav from "../components/common/BottomNav";
import ButtonCorner from "../components/ui/ButtonCorner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUpRightFromSquare,
  faRightToBracket,
  faSpinner,
  faCircleExclamation,
  faCrown,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { getAuth, importSession, logout, type AuthUser } from "../utils/auth";

const SHINIGAMI_URL = "https://11.shinigami.asia";

const Login = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  const [session, setSession] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Restore from localStorage, then try the httpOnly cookie as a fallback.
  useEffect(() => {
    const cached = getAuth();
    if (cached) {
      setUser(cached);
      setReady(true);
      return;
    }
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => u?.user_id && setUser(u))
      .finally(() => setReady(true));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const u = await importSession(session);
      setUser(u);
      // bounce home shortly so the Navbar picks up the new state cleanly
      setTimeout(() => (window.location.href = "/"), 600);
    } catch (err: any) {
      setError(err?.message || "Login gagal");
    } finally {
      setSubmitting(false);
    }
  };

  const doLogout = async () => {
    await logout();
    setUser(null);
    setSession("");
  };

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-56px)] max-w-md mx-auto px-4 py-10 lg:py-16">
        {!ready ? (
          <div className="flex justify-center py-20 text-zinc-600">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-2xl" />
          </div>
        ) : user ? (
          /* ---- signed in ---- */
          <div className="text-center">
            <div className="flex flex-col items-center gap-4">
              <img
                src={user.avatar_image_url || "/android-chrome-512x512.png"}
                alt=""
                className="w-20 h-20 rounded-full object-cover ring-2 ring-[#EF4444]/50 bg-zinc-900"
              />
              <div>
                <h1 className="text-xl font-black text-white flex items-center justify-center gap-2">
                  {user.username}
                  {user.is_premium && (
                    <FontAwesomeIcon icon={faCrown} className="text-amber-400 text-sm" />
                  )}
                </h1>
                {user.email && <p className="text-sm text-zinc-500 mt-0.5">{user.email}</p>}
              </div>
            </div>
            <button
              onClick={doLogout}
              className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.04] border border-[#1c1c1c] text-zinc-300 font-semibold text-sm hover:bg-white/[0.07] active:scale-95 transition-all"
            >
              <FontAwesomeIcon icon={faRightFromBracket} />
              Keluar
            </button>
          </div>
        ) : (
          /* ---- login form ---- */
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-black text-white">
                Masuk ke <span className="text-[#EF4444]">Kurokami</span>
              </h1>
              <p className="text-sm text-zinc-500 mt-2">
                Hubungkan akun Shinigami kamu untuk sinkronkan bookmark & riwayat.
              </p>
            </div>

            <ol className="text-sm text-zinc-400 space-y-2 mb-6 list-decimal list-inside bg-white/[0.02] border border-[#1c1c1c] rounded-xl px-4 py-3.5">
              <li>
                Login di{" "}
                <a
                  href={SHINIGAMI_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#EF4444] hover:underline inline-flex items-center gap-1"
                >
                  Shinigami <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[10px]" />
                </a>{" "}
                seperti biasa.
              </li>
              <li>
                Buka DevTools (<kbd className="text-zinc-300">F12</kbd>) → tab <b className="text-zinc-300">Application</b> →{" "}
                <b className="text-zinc-300">Cookies</b> → pilih domain Shinigami.
              </li>
              <li>
                Salin <b className="text-zinc-300">Value</b> dari cookie{" "}
                <code className="text-zinc-300 bg-white/[0.06] px-1 rounded">__session_v2</code>, lalu tempel di bawah.
              </li>
            </ol>

            <form onSubmit={submit} className="space-y-4">
              <label className="block">
                <span className="text-xs font-semibold text-zinc-400">Nilai cookie __session_v2</span>
                <textarea
                  required
                  rows={5}
                  spellCheck={false}
                  autoComplete="off"
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                  placeholder="%7B%22user_id%22%3A%22…"
                  className="mt-1.5 w-full px-3.5 py-3 bg-[#0c0c0c] border border-[#1c1c1c] rounded-xl text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-[#EF4444]/60 transition-colors resize-none break-all"
                />
              </label>

              {error && (
                <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3.5 py-2.5">
                  <FontAwesomeIcon icon={faCircleExclamation} className="mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#EF4444] text-white font-bold text-sm hover:bg-[#DC2626] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                <FontAwesomeIcon icon={submitting ? faSpinner : faRightToBracket} className={submitting ? "animate-spin" : ""} />
                {submitting ? "Memproses…" : "Masuk"}
              </button>
            </form>

            <p className="text-[11px] leading-relaxed text-zinc-600 mt-6 text-center">
              Kurokami tidak pernah melihat password kamu. Sesi berlaku ±24 jam; setelah itu
              salin ulang cookie-nya. Jangan bagikan nilai cookie ini ke orang lain.
            </p>
          </>
        )}
      </main>
      <Footer />
      <BottomNav />
      <ButtonCorner />
    </>
  );
};

export default Login;
