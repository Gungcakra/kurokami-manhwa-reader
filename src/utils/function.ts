export function truncateTitle(title: string): string {
  if (title.length >= 25) {
    return title.substring(0, 20) + "...";
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
