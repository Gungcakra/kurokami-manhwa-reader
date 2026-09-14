// @ts-nocheck
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink, faCheck } from "@fortawesome/free-solid-svg-icons";

/**
 * Copies the URL of the page currently being viewed.
 *
 * Deliberately does **not** call `navigator.share`: the native sheet decides
 * for itself what to hand over and on several Android targets it passed the
 * page's cover image along instead of the link. Copying the address bar is the
 * one behaviour that is identical everywhere.
 */
const ShareButton = ({ className = "" }) => {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    const url = window.location.href;

    let ok = false;
    try {
      await navigator.clipboard.writeText(url);
      ok = true;
    } catch {
      // the async clipboard needs a secure context — fall back to a throwaway
      // input, which works on plain http and in older webviews
      const el = document.createElement("input");
      el.value = url;
      el.setAttribute("readonly", "");
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      el.setSelectionRange(0, url.length);
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
      document.body.removeChild(el);
    }

    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copyLink}
      aria-label="Salin link halaman ini"
      title="Salin link halaman ini"
      className={`flex items-center justify-center gap-2 px-4 py-2.5 lg:px-5 lg:py-3.5 rounded-xl lg:rounded-2xl text-sm lg:text-base font-semibold border transition-all hover:cursor-pointer active:scale-[0.98] ${
        copied
          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
          : "bg-white/5 text-zinc-400 border-white/10 hover:text-white hover:border-white/20"
      } ${className}`}
    >
      <FontAwesomeIcon icon={copied ? faCheck : faLink} className="text-xs lg:text-sm" />
      {copied ? "Tersalin" : "Salin Link"}
    </button>
  );
};

export default ShareButton;
