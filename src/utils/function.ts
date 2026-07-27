export function truncateTitle(title: string, maxLength = 30): string {
  if (title.length >= maxLength) {
    return title.substring(0, maxLength) + "...";
  }
  return title;
}

export function getTitleFromComa(title: string, part: 0 | 1): string {
  const parts = title.split(",");
  if (part === 0) return parts[0].trim();
  if (part === 1) return parts[1]?.trim() || "";
  return title;
}

export function removeTextTitle(title: string, removeText: string): string {
  return title.replace(removeText, "");
}

export function changeToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
}

export function slugToText(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

/** Compact number: 1234 -> 1.2K, 3290000 -> 3.3M */
export function formatCount(n?: number): string {
  if (!n) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

/**
 * Short origin label for a country_id (KR/JP/CN/...).
 *
 * Deliberately text, not a flag emoji: Windows does not render regional-indicator
 * flags at all (and many Linux builds lack the glyphs), so emoji flags show up as
 * empty boxes for a large share of readers.
 */
export function countryFlag(code?: string): string {
  if (!code) return "";
  const c = code.toUpperCase();
  const map: Record<string, string> = { EN: "GB" };
  return map[c] ?? c;
}

/** Tailwind colour classes per origin, used by the small origin badge. */
export function countryTone(code?: string): string {
  switch ((code || "").toUpperCase()) {
    case "KR":
      return "bg-sky-500/20 text-sky-300 border-sky-500/30";
    case "JP":
      return "bg-rose-500/20 text-rose-300 border-rose-500/30";
    case "CN":
      return "bg-amber-500/20 text-amber-300 border-amber-500/30";
    default:
      return "bg-zinc-700/40 text-zinc-300 border-zinc-600/40";
  }
}

/** Short time-ago label: 2j, 3h, 5h, 2bln */
export function timeAgoShort(dateString: string): string {
  if (!dateString) return "";
  const diff = Date.now() - new Date(dateString).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  const mo = Math.floor(d / 30);
  if (m < 1) return "baru";
  if (m < 60) return `${m}m`;
  if (h < 24) return `${h}j`;
  if (d < 30) return `${d}h`;
  if (mo < 12) return `${mo}bln`;
  return `${Math.floor(mo / 12)}thn`;
}

/** True when a date is within the last `days` days */
export function isRecent(dateString: string, days = 3): boolean {
  if (!dateString) return false;
  return Date.now() - new Date(dateString).getTime() < days * 86_400_000;
}

/**
 * Normalize a manga item from any Shinigami list endpoint.
 *
 * The shapes differ per endpoint: only `is_update=true` (new update) returns a
 * `chapters[]` array; popular / top / completed / explore / search instead return
 * flat `latest_chapter_*` fields. Reading either directly means half the lists
 * render no chapter info, so every card goes through here.
 */
export function normalizeManga(m: any) {
  const chapters = Array.isArray(m?.chapters) ? m.chapters : [];
  const latest = chapters[0];
  return {
    id: m?.manga_id,
    title: m?.title ?? "",
    altTitle: m?.alternative_title ?? "",
    cover: m?.cover_image_url || m?.cover_portrait_url || "",
    portrait: m?.cover_portrait_url || m?.cover_image_url || "",
    country: m?.country_id ?? "",
    rating: m?.user_rate ?? null,
    views: m?.view_count ?? 0,
    bookmarks: m?.bookmark_count ?? 0,
    year: m?.release_year ?? "",
    status: m?.status,
    format: m?.taxonomy?.Format?.[0]?.name ?? "",
    genres: m?.taxonomy?.Genre ?? [],
    chapterNumber: latest?.chapter_number ?? m?.latest_chapter_number ?? null,
    chapterId: latest?.chapter_id ?? m?.latest_chapter_id ?? null,
    chapterTime: latest?.created_at ?? m?.latest_chapter_time ?? "",
    /** Up to 3 recent chapters — powers the komikcast-style update rows */
    chapters: chapters.slice(0, 3),
  };
}

export function timeAgo(dateString: string): string {
  if (!dateString) return "";
  const now = new Date();
  const date = new Date(dateString);
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return `${seconds} detik lalu`;
  if (minutes < 60) return `${minutes} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days < 30) return `${days} hari lalu`;
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
