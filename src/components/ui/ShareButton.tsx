// @ts-nocheck
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShareNodes, faCheck } from "@fortawesome/free-solid-svg-icons";

/**
 * Share control.
 *
 * Uses the native share sheet where it exists (every mobile browser, which is
 * where sharing actually happens) and falls back to copying the URL with a
 * short confirmation state on desktop.
 */
const ShareButton = ({ title, text, className = "" }) => {
  const [state, setState] = useState("idle"); // idle | copied

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const payload = { title, text: text || title, url };

    if (navigator.share) {
      try {
        await navigator.share(payload);
        return;
      } catch (err) {
        // AbortError just means the user dismissed the sheet — not a failure,
        // and it must not fall through to copying.
        if (err?.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // clipboard API needs a secure context; fall back to a throwaway input
      const el = document.createElement("input");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      try {
        document.execCommand("copy");
      } catch {
        /* nothing left to try — leave the button in its idle state */
        document.body.removeChild(el);
        return;
      }
      document.body.removeChild(el);
    }

    setState("copied");
    setTimeout(() => setState("idle"), 2000);
  };

  const copied = state === "copied";

  return (
    <button
      onClick={share}
      aria-label="Bagikan"
      className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:cursor-pointer active:scale-[0.98] ${
        copied
          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
          : "bg-white/5 text-zinc-400 border-white/10 hover:text-white hover:border-white/20"
      } ${className}`}
    >
      <FontAwesomeIcon icon={copied ? faCheck : faShareNodes} className="text-xs" />
      {copied ? "Tersalin" : "Bagikan"}
    </button>
  );
};

export default ShareButton;
