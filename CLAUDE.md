# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
npm run dev       # Start dev server at localhost:4321
npm run build     # Build for production (outputs to ./dist/)
npm run preview   # Preview the production build locally
```

There are no tests or linting scripts configured.

## Architecture

This is an **Astro + React** manhwa reader app deployed to **Vercel Serverless** (`output: 'server'`). All pages use SSR (`prerender = false`).

### Page-Component Pattern

Every route follows a two-file pattern:

- **`.astro` page** — handles SSR: fetches data for the `<title>` tag, then renders a React component via `client:only="react"` (or `client:load` on the home page)
- **`_Component.tsx`** — the actual React component that fetches its own data client-side

Example: `/manhwa/[id].astro` fetches the manga title server-side for SEO, then passes `id` to `<Detail id={id} client:only="react" />` which independently fetches all its data in the browser.

### Routes

| URL | Astro page | React component |
|-----|-----------|-----------------|
| `/` | `src/pages/index.astro` | `_Home.tsx` |
| `/explore` | `src/pages/explore.astro` | `_Explore.tsx` (stub) |
| `/manhwa/[id]` | `src/pages/manhwa/[id].astro` | `_Detail.tsx` |
| `/chapter/[id]` | `src/pages/chapter/[id].astro` | `_Chapter.tsx` |

### Data Layer

All API calls are in `src/utils/api.ts`. The app exclusively uses the **Shinigami API** at `https://api.shngm.io/v1/`. Legacy functions calling `/api/...` endpoints in the same file are unused.

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
