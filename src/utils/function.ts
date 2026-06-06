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
