// @ts-nocheck
/**
 * Client-side SEO for the static `_` shells (/manhwa/_ and /chapter/_).
 *
 * The site is a static build for PHP-only hosting, so the detail and chapter
 * pages can't fetch their title at request time any more. Once the React
 * component has its data it calls `applySeo()` to fill in the title, meta
 * description, Open Graph / Twitter tags, canonical and JSON-LD.
 */
import { metaDescription } from "./function";

const setMeta = (attr: "name" | "property", key: string, content?: string) => {
  if (content == null) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

export function applySeo({ title, description, image, keywords, jsonLd }: {
  title: string;
  description?: string;
  image?: string;
  keywords?: string;
  jsonLd?: unknown[];
}) {
  if (typeof document === "undefined") return;
  const url = location.origin + location.pathname;
  document.title = title;
  setMeta("name", "description", description);
  setMeta("name", "keywords", keywords);
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:url", url);
  setMeta("name", "twitter:title", title);
  setMeta("name", "twitter:description", description);
  if (image) {
    setMeta("property", "og:image", image);
    setMeta("name", "twitter:image", image);
  }
  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", url);

  document.head.querySelectorAll("script[data-seo]").forEach((s) => s.remove());
  for (const item of jsonLd ?? []) {
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.dataset.seo = "";
    s.textContent = JSON.stringify(item);
    document.head.appendChild(s);
  }
}

/** Title / description / JSON-LD for /manhwa/:id (was in manhwa/[id].astro). */
export function detailSeo(manhwa: any) {
  const origin = location.origin;
  const url = origin + location.pathname;
  const title = manhwa.title ?? "";
  const alt = manhwa.alternative_title ?? "";
  const genres = (manhwa.taxonomy?.Genre ?? []).map((g) => g.name);
  const authors = (manhwa.taxonomy?.Author ?? []).map((a) => a.name);
  const artists = (manhwa.taxonomy?.Artist ?? []).map((a) => a.name);
  const format = manhwa.taxonomy?.Format?.[0]?.name ?? manhwa.taxonomy?.Type?.[0]?.name ?? "Manhwa";
  const cover = manhwa.cover_portrait_url || manhwa.cover_image_url || undefined;
  const statusLabel = manhwa.status === 1 ? "Ongoing" : "Tamat";
  const synopsis = metaDescription(manhwa.description, 155);
  const description = synopsis
    ? `${synopsis} Baca ${title} bahasa Indonesia gratis di Kurokami.`
    : `Baca ${title} bahasa Indonesia gratis di Kurokami. ${format} ${statusLabel}${
        genres.length ? ` bergenre ${genres.slice(0, 3).join(", ")}` : ""
      }, update chapter terbaru tiap hari dengan kualitas gambar HD.`;

  return {
    title: `Baca ${title} Bahasa Indonesia — Kurokami`,
    description,
    image: cover,
    keywords: [`baca ${title}`, `${title} bahasa indonesia`, `${title} chapter terbaru`, alt, ...genres.slice(0, 5), "kurokami"]
      .filter(Boolean)
      .join(", "),
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Book",
        name: title,
        alternateName: alt || undefined,
        url,
        image: cover,
        description: metaDescription(manhwa.description, 500) || description,
        bookFormat: "https://schema.org/GraphicNovel",
        inLanguage: "id-ID",
        genre: genres.length ? genres : undefined,
        author: authors.length ? authors.map((n) => ({ "@type": "Person", name: n })) : undefined,
        illustrator: artists.length ? artists.map((n) => ({ "@type": "Person", name: n })) : undefined,
        datePublished: manhwa.release_year ? String(manhwa.release_year) : undefined,
        aggregateRating:
          manhwa.user_rate && manhwa.view_count
            ? { "@type": "AggregateRating", ratingValue: manhwa.user_rate, bestRating: 10, ratingCount: manhwa.bookmark_count || manhwa.view_count }
            : undefined,
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Beranda", item: origin },
          { "@type": "ListItem", position: 2, name: title, item: url },
        ],
      },
    ],
  };
}

/** Title / description / JSON-LD for /chapter/:id (was in chapter/[id].astro). */
export function chapterSeo(chapter: any, manhwa: any) {
  const origin = location.origin;
  const url = origin + location.pathname;
  const title = manhwa?.title ?? "";
  const number = chapter?.chapter_number;
  const chTitle = (chapter?.chapter_title ?? "").trim();
  const pages = chapter?.chapter?.data?.length ?? 0;
  const cover = manhwa?.cover_portrait_url || manhwa?.cover_image_url || chapter?.thumbnail_image_url;
  const label = number != null ? `Chapter ${number}` : chTitle || "Chapter";
  const synopsis = metaDescription(manhwa?.description, 90);
  const seriesUrl = `${origin}/manhwa/${chapter?.manga_id}`;

  return {
    title: title ? `Baca ${title} ${label} Bahasa Indonesia di Kurokami` : "Baca Chapter di Kurokami",
    description: title
      ? `Baca ${title} ${label}${chTitle ? ` — ${chTitle}` : ""} bahasa Indonesia di Kurokami${
          pages ? `, ${pages} halaman` : ""
        } dengan kualitas gambar HD dan gratis. ${synopsis || "Lanjut ke chapter berikutnya langsung dari halaman baca."}`
      : undefined,
    image: cover,
    keywords: title
      ? [`baca ${title} ${label}`, `${title} ${label} bahasa indonesia`, `${title} ${label} kurokami`, `baca ${title}`, "kurokami"].join(", ")
      : undefined,
    jsonLd: title
      ? [
          {
            "@context": "https://schema.org",
            "@type": "Chapter",
            name: `${title} ${label}`,
            headline: chTitle || `${title} ${label}`,
            url,
            image: cover,
            inLanguage: "id-ID",
            position: number ?? undefined,
            datePublished: chapter?.release_date ?? chapter?.created_at ?? undefined,
            isPartOf: { "@type": "Book", name: title, url: seriesUrl },
            publisher: { "@type": "Organization", name: "Kurokami" },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Beranda", item: origin },
              { "@type": "ListItem", position: 2, name: title, item: seriesUrl },
              { "@type": "ListItem", position: 3, name: label, item: url },
            ],
          },
        ]
      : [],
  };
}

/** The id segment of /manhwa/:id or /chapter/:id from the address bar. */
export function idFromPath(): string {
  if (typeof location === "undefined") return "";
  const seg = location.pathname.split("/").filter(Boolean)[1] ?? "";
  try {
    return decodeURIComponent(seg);
  } catch {
    return seg;
  }
}
