export function truncateTitle(title: string, maxLength: number): string {
  if (title.length >= maxLength) {
    return title.substring(0, maxLength) + "...";
  }
  return title;
}
export function getTitleFromComa(title: string, part: 0 | 1): string {
  const parts = title.split(",");
  if (part === 0) {
    return parts[0].trim();
  } else if (part === 1) {
    return parts[1]?.trim() || "";
  }
  return title;
}

export function removeTextTitle(
  title: string,
  removeTextTitle: string
): string {
  return title.replace(removeTextTitle, "");
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
export function timeStampToTime(timeStamp: string): string {
  const date = new Date(timeStamp);
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
