# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
npm run dev       # Start dev server at localhost:4321
npm run build     # Build for production (outputs to ./dist/)
npm run preview   # Serve dist/ + the PHP API with php -S (localhost:8080)
```

There are no tests or linting scripts configured.

## Architecture

This is an **Astro + React** manhwa reader app built as a **static site** (`output: 'static'`) for PHP-only hosting (Hostinger). The only server code is `public/api/index.php` (the `/api/auth/*` session routes); `public/.htaccess` serves the `/manhwa/_` and `/chapter/_` shells for every id.

### Page-Component Pattern

Every route follows a two-file pattern:

- **`.astro` page** — static layout + default meta, renders a React component via `client:only="react"` (or `client:load` on the home page)
- **`_Component.tsx`** — the actual React component that fetches its own data client-side

Example: `/manhwa/[id].astro` is built once as `/manhwa/_`; `<Detail client:only="react" />` reads the id from the URL (`idFromPath` in `src/utils/seo.ts`), fetches its data in the browser and sets title/meta/JSON-LD with `applySeo`.

### Routes

| URL | Astro page | React component |
|-----|-----------|-----------------|
| `/` | `src/pages/index.astro` | `_Home.tsx` |
| `/explore` | `src/pages/explore.astro` | `_Explore.tsx` (stub) |
| `/manhwa/[id]` | `src/pages/manhwa/[id].astro` | `_Detail.tsx` |
| `/chapter/[id]` | `src/pages/chapter/[id].astro` | `_Chapter.tsx` |

### Data Layer

All API calls are in `src/utils/api.ts`. The app exclusively uses the **Shinigami API** at `https://api.shinigami.io/v1` (offset/limit paging, `meta.has_next`; chapter lists are cursor-based and loaded in full, then paged locally). Legacy functions calling `/api/...` endpoints in the same file are unused.

Key API functions in active use:
- `fetchTopShinigami` / `fetchNewShinigami` / `fetchRecommendShinigami` — home page lists
- `fetchDetailShinigami(manhwaId)` — manga detail + taxonomy
- `fetchChapterListDetailShinigami(manhwaId, page)` — paginated chapter list
- `fetchChapterShinigami(chapterId)` — chapter images (returns `base_url`, `chapter.path`, `chapter.data[]`)
- `fetchSearch(keyword)` — search

### Styling

Tailwind CSS v4 via PostCSS. Theme colors are defined as direct hex values in `src/styles/global.css` using utility class overrides (`.bg-secondary`, `.bg-accent`, etc.). The `tailwind.config.js` references CSS variables (`var(--color-primary)`) that are not currently defined — the `global.css` class definitions take precedence.

Color palette: `#131218` (secondary/background), `#23212F` (primary), `#6B69F1` (accent/links).

### Utilities

`src/utils/function.ts` — pure string helpers: `truncateTitle`, `changeToSlug`, `slugToText`, `removeTextTitle`, `timeStampToTime`.

### Key Notes

- Page components use `// @ts-nocheck` to suppress TypeScript errors
- Chapter navigation supports keyboard arrow keys (`_Chapter.tsx`)
- `_Explore.tsx` is a layout stub with no data fetching implemented yet
- Loading states use skeleton components (`CardSkeleton`, `ListCardSkeleton`, `CardSliderSkeleton`)
- Loading indicator is a `kuru.webp` spinning image in `src/assets/images/`
