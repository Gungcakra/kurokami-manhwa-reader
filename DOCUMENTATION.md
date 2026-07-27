# Kurokami — Full Technical Documentation

Kurokami is a mobile **manhwa / manga / manhua reader** built with **React Native + Expo (SDK 54)**. It provides a fast, ad-free, HD reading experience with curated discovery feeds, advanced filtering, and an immersive vertical reader.

This document explains **every feature**, **how each part works internally**, and the **complete API route reference** the app depends on.

- **App name:** Kurokami (`app.json` → `expo.name`)
- **Package:** `com.kurokami.app`
- **Version:** 1.0.0
- **UI style:** forced dark (`userInterfaceStyle: "dark"`), new architecture enabled (`newArchEnabled: true`)
- **Content source:** a remote REST API set via the `EXPO_PUBLIC_API_BASE_URL` environment variable

---

## Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Tech Stack](#2-tech-stack)
3. [Data Layer & API Client](#3-data-layer--api-client)
4. [Complete API Route Reference](#4-complete-api-route-reference)
5. [Custom Hooks (State + Data Fetching)](#5-custom-hooks-state--data-fetching)
6. [Navigation System](#6-navigation-system)
7. [Screens — Features & How They Work](#7-screens--features--how-they-work)
8. [Shared Components](#8-shared-components)
9. [Design System & UX Patterns](#9-design-system--ux-patterns)
10. [Performance Strategy](#10-performance-strategy)
11. [Known Limitations](#11-known-limitations)

---

## 1. Architecture Overview

The app follows a clean **layered architecture**:

```
UI (Screens / Components)
        │  props & callbacks
        ▼
Custom Hooks  (src/hooks/*.js)      ← state, pagination, debounce, loading flags
        │  function calls
        ▼
API Service   (src/services/api.js) ← builds URLs, fetches, normalizes errors
        │  fetch()
        ▼
Remote REST API (EXPO_PUBLIC_API_BASE_URL)
```

- **Screens** are dumb-ish views: they render UI and delegate all data/state work to hooks.
- **Hooks** own component state (results, loading, pagination, filters) and orchestrate calls to the API service.
- **The API service** is the single place where HTTP happens and where every endpoint URL is constructed.

Folder layout:

```
src/
├── services/api.js          # single HTTP client + all endpoint builders
├── hooks/
│   ├── home.js              # updates, genres, recommend, popular, top, complete, search, explore, byType
│   ├── detail.js            # manhwa detail + chapter list
│   └── chapter.js           # chapter (reader) detail
├── navigation/
│   ├── AppNavigator.jsx     # root native stack
│   └── TabNavigator.jsx     # custom animated bottom tabs
├── components/              # ManhwaCard, FeaturesCard, MiniCard, FilterSheet, GenreBadge, skeletons...
└── screens/
    ├── WelcomeScreen.jsx
    ├── Home/                # HomeScreen + section components + SearchScreen
    ├── Explore/ExploreScreen.jsx
    ├── Detail/              # DetailScreen, DetailSection, ChapterListSection (+ skeletons)
    ├── Chapter/ChapterScreen.jsx
    ├── All/AllScreen.jsx
    ├── BookmarkScreen.jsx
    ├── HistoryScreen.jsx
    └── Info/InfoScreen.jsx
```

---

## 2. Tech Stack

| Area | Library | Role |
|------|---------|------|
| Framework | Expo `~54`, React Native `0.81`, React `19` | Core runtime |
| Navigation | `@react-navigation/native`, `native-stack`, `material-top-tabs` | Stack + tab routing |
| Styling | `nativewind` + `tailwindcss` | Tailwind classes via `className` |
| Animation | `react-native-reanimated`, `react-native-animatable`, `LayoutAnimation` | Splash, list stagger, accordion |
| Images | `expo-image` | Disk/memory caching + fade transitions |
| Icons | `@expo/vector-icons` (Ionicons), `lucide-react-native` | Iconography |
| Vector art | `react-native-svg` | Country flags on cards |
| Feedback | `expo-haptics` | Tap vibration |
| Visual | `expo-linear-gradient`, `expo-status-bar`, `expo-system-ui` | Gradients, status bar |
| Gestures | `react-native-gesture-handler`, `react-native-pager-view` | Swipe tabs, horizontal scroll |
| Safe area | `react-native-safe-area-context` | Notch/inset handling |

---

## 3. Data Layer & API Client

**File:** `src/services/api.js`

All network access goes through one helper:

```js
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const fetchData = async (endpoint) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) throw new Error("Network response was not ok");
    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    return null;      // ← graceful failure: callers get null, never a crash
  }
};
```

**How it works:**
- The base URL comes from the environment (`EXPO_PUBLIC_API_BASE_URL`) — nothing is hard-coded, so you point the app at any compatible backend by setting that variable (e.g. in `.env`).
- Every endpoint is a small builder function on the exported `apiService` object that returns `fetchData(<path>)`.
- On **any** failure (network error or non-2xx response) the helper logs and returns `null`. Hooks then treat `null`/missing `data` as "no results," so the UI shows empty/skeleton states instead of throwing.
- Responses are expected in the shape `{ data: [...], meta: { total_page } }`.

---

## 4. Complete API Route Reference

All paths are **relative to `EXPO_PUBLIC_API_BASE_URL`**. Query params shown with their defaults from the code.

### Manga lists (`/v1/manga/list`)

| Function | Method | Full route (template) | Purpose |
|----------|--------|-----------------------|---------|
| `getNewUpdate(page=1, pageSize=30, format="all")` | GET | `/v1/manga/list?{format=<f> if not all}&type=project&page={page}&page_size={pageSize}&is_update=true&sort=latest&sort_order=desc` | Latest updated titles (Home → New Update) |
| `getPopular(page=1, pageSize=24)` | GET | `/v1/manga/list?page={page}&page_size={pageSize}&genre_include_mode=or&genre_exclude_mode=or&sort=popularity&sort_order=desc` | Most popular (Home → Popular) |
| `getTop(page=1, pageSize=24)` | GET | `/v1/manga/list?page={page}&page_size={pageSize}&genre_include_mode=or&genre_exclude_mode=or&sort=rating&sort_order=desc` | Highest rated (Home → Top) |
| `getRecommend(page=1, pageSize=8)` | GET | `/v1/manga/list?page={page}&page_size={pageSize}&category=explore-list-2` | Editorial recommendations (Home → For You) |
| `getCompleted(page=1, pageSize=24)` | GET | `/v1/manga/list?page={page}&page_size={pageSize}&genre_include_mode=or&genre_exclude_mode=or&status=completed&sort=latest&sort_order=desc` | Finished series (Home → Complete) |
| `getManhwa / getManga / getManhua(page=1, pageSize=10)` | GET | `/v1/manga/list?format={format}&page={page}&page_size={pageSize}&is_recommended=true&sort=latest&sort_order=desc` | Format-specific recommended lists |
| `searchManga(keyword, page=1, pageSize=15)` | GET | `/v1/manga/list?page={page}&page_size={pageSize}&q={keyword}` | Full-text search |
| `getExplore({...})` | GET | `/v1/manga/list?page={page}&page_size={pageSize}[&genre_include=<g>...][&status=<s>][&format=<f>]&sort={sort}&sort_order={order}[&q=<kw>]&genre_include_mode=or&genre_exclude_mode=or` | Explore screen combined filter query |

### Detail & chapters

| Function | Method | Full route (template) | Purpose |
|----------|--------|-----------------------|---------|
| `getDetail(manhwaId)` | GET | `/v1/manga/detail/{manhwaId}` | Full title metadata (Detail screen) |
| `getChapterList(manhwaId, page=1, pageSize=20, order="desc", search="")` | GET | `/v1/chapter/{manhwaId}/list?page={page}&page_size={pageSize}&sort_by=chapter_number&sort_order={order}[&search=<s>]` | Paginated chapter list |
| `getChapterDetail(chapterId)` | GET | `/v1/chapter/detail/{chapterId}` | Chapter image manifest (reader) |

### Taxonomy

| Function | Method | Full route | Purpose |
|----------|--------|-----------|---------|
| `getGenres()` | GET | `/v1/genre/list` | Genre list (Home genre section + Explore filter) |

### Notable query parameters explained

- `type=project` — restricts New Update to "project" titles.
- `category=explore-list-2` — server-side curated recommendation bucket.
- `is_update=true` / `is_recommended=true` — server flags for feeds.
- `sort` ∈ `latest | popularity | rating`; `sort_order` ∈ `asc | desc`.
- `status` ∈ `ongoing | completed | hiatus`.
- `format` ∈ `manhwa | manga | manhua | all`.
- `genre_include=<name>` — repeatable; combined with `genre_include_mode=or`.
- `q` — search keyword (URL-encoded).
- `sort_by=chapter_number` — chapter list ordering key.

### Chapter image URL construction (reader)

The reader does **not** get absolute image URLs. `getChapterDetail` returns:
```js
{ base_url, chapter: { path, data: [file1, file2, ...] }, chapter_number, prev_chapter_id, next_chapter_id, manga_id }
```
Each page image URL is assembled client-side:
```
`${chapterDetail.base_url}/${chapterDetail.chapter.path}/${fileName}`
```

> ⚠️ **Code note:** In `getManhwa/getManga/getManhua`, the code references a variable `format` that isn't in scope (it uses a bare `format === "all"` instead of a parameter), which would throw if those functions were called. They are currently unused by the screens.

---

## 5. Custom Hooks (State + Data Fetching)

**Files:** `src/hooks/home.js`, `detail.js`, `chapter.js`

Each hook wraps one concern and returns `{ data, loading, error, ...actions }`.

### `home.js`
| Hook | Returns | Behavior |
|------|---------|----------|
| `useUpdate(type="all")` | `newUpdates, loading, error, format, changeFormat, refresh` | Fetches new updates; `changeFormat` re-queries by format |
| `useGenres()` | `genres, loading, error, getGenres` | Loads genre list once on mount |
| `useRecommendations()` | `recommendations, loading, error` | Loads `category=explore-list-2` |
| `usePopularManhwa()` | `popularManhwa, loading, error` | Popular list |
| `useTop()` | `topManhwa, loading, error` | Top-rated list |
| `useComplete()` | `completedManhwa, loading, error` | Completed list |
| `useSearchManhwa()` | `searchResults, loading, loadingMore, keyword, setKeyword, loadMore` | **Debounced (500 ms)** search with infinite scroll |
| `useManhwaByType(type)` | `data, loading, loadingMore, loadMore, refresh, hasMore` | Powers **All Screen**; routes `type` → correct API call; paginated |
| `useExplore()` | `data, loading, loadingMore, filters, updateFilter, loadMore, hasMore` | **Debounced** combined filter query with infinite scroll |

**Key mechanics:**
- **Debounce:** `useSearchManhwa` and `useExplore` wrap fetches in a `setTimeout(…, 500)` cleared on every keystroke/filter change — so the API is hit only after the user pauses.
- **Infinite scroll:** hooks track `page`/`currentPage` + `hasMore` (true while a page returns ≥ `pageSize` items). `loadMore()` appends the next page to existing results.
- **Explore pagination** uses a `useRef` for the current page to avoid stale-closure bugs during rapid loads.

### `detail.js`
- `useManhwaDetail(manhwaId)` → `{ manhwaDetail, loading, error, refresh }`; refetches whenever `manhwaId` changes.
- `useChapterList(manhwaId)` → `{ chapters, loading, page, setPage, order, setOrder, search, setSearch, totalPage }`. A single `useCallback` re-runs the fetch whenever `page`, `order`, or `search` changes, and reads `meta.total_page` for pagination.

### `chapter.js`
- `useChapterDetail(chapterId)` → `{ chapterDetail, loading, error, refresh }`; refetches when `chapterId` changes (used for in-place next/prev chapter switching).

---

## 6. Navigation System

### Root stack — `AppNavigator.jsx`
`createNativeStackNavigator` with headers hidden, dark content background (`#121215`), **global animations disabled** (`animation: "none"`) for snappy transitions, and `freezeOnBlur: true` to stop rendering inactive screens.

| Route | Component | Notes |
|-------|-----------|-------|
| `Welcome` | WelcomeScreen | Splash, auto-advances |
| `Main` | TabNavigator | The 5-tab shell |
| `Detail` | DetailScreen | Params: `{ id }` |
| `Read` | ChapterScreen | Params: `{ chapterId }` |
| `Search` | SearchScreen | `animation: "slide_from_bottom"` |
| `All` | AllScreen | Params: `{ type }` |

### Bottom tabs — `TabNavigator.jsx`
Built on `createMaterialTopTabNavigator` but rendered **at the bottom** (`tabBarPosition="bottom"`) with a **fully custom `tabBar`**:

- **Animated slider:** a red glow pill interpolates its `translateX` from the pager `position` value so it glides smoothly under the active tab as you swipe.
- **Per-tab animation:** each `TabButton` interpolates the pager position to (a) lift the icon up ~10px, (b) slide the label up into place, and (c) cross-fade an outline icon → filled colored icon when active.
- **Haptics:** `Haptics.impactAsync(Light)` fires on every tab press.
- **Swipe:** `swipeEnabled: true` lets users swipe between tabs.
- Tabs: **Home, Explore, Bookmark(Library), History, Info**.

---

## 7. Screens — Features & How They Work

### 7.1 Welcome / Splash — `WelcomeScreen.jsx`
- Logo animates in with Reanimated `ZoomIn` + a looping pulse (`withRepeat`/`withSequence` opacity).
- Title and subtitle fade in with staggered delays (`FadeInUp`, `FadeInDown`).
- A `setTimeout` of **2500 ms** calls `navigation.replace('Main')` (replace = no back to splash). Timer is cleared on unmount.

### 7.2 Home — `Home/HomeScreen.jsx`
A `ScrollView` with a sticky absolute `HeaderSection` and these stacked sections, each its own component + hook:

| Section | Hook | "See All" target |
|---------|------|------------------|
| `HeaderSection` | — | Search button → `Search` route |
| `PopularSection` | `usePopularManhwa` | `All { type: "popular" }` |
| `RecommendationSection` | `useRecommendations` | `All { type: "recommendation" }` |
| `NewUpdateSection` | `useUpdate` | `All { type: "new-update" }` |
| `GenreSection` | `useGenres` | genre badges |
| `TopSection` | `useTop` | `All { type: "top" }` |
| `CompleteSection` | `useComplete` | `All { type: "complete" }` |

**PopularSection layout logic:** the first item becomes a large `FeaturedCard`; items 2–15 are chunked into **pairs** (`useMemo`) and rendered as stacked `MiniCard`s inside a horizontal `ScrollView` — producing a "1 big + grid of small" carousel. Skeletons show while loading.

Performance flags on the scroll view: `removeClippedSubviews`, `scrollEventThrottle={16}`, extra bottom padding for the floating tab bar.

### 7.3 Explore — `Explore/ExploreScreen.jsx`
- **Search input** bound to `filters.keyword` via `updateFilter("keyword", text)`; clears with the ✕ button.
- **Filter button** opens `FilterSheet`; shows a small badge dot when any genre/status filter is active.
- **Results:** 3-column `FlatList` of `ManhwaCard`s with staggered `fadeInUp` (delay based on index). Tapping a card → `Detail { id: manga_id }`.
- **Infinite scroll:** `onEndReached` → `loadMore()`; footer spinner while `loadingMore`.
- **States:** full-screen loading overlay ("Searching database…"), empty state ("No Results Found"), bottom gradient mask.
- All filtering is **debounced** in `useExplore`, so typing/toggling filters re-queries 500 ms after the last change.

### 7.4 Search — `Home/SearchScreen.jsx`
- Opened from the Home header (`slide_from_bottom`).
- Uses `useSearchManhwa` — live debounced search bound to `keyword`.
- Shows **12 skeleton cards** during the initial fetch, then a 3-column grid of results with staggered animations.
- Infinite scroll ("Searching more…"), empty state, error state.
- Hardware back (`BackHandler`) → `navigation.goBack()`.

### 7.5 All (category browse) — `All/AllScreen.jsx`
- Reusable list driven by `route.params.type` and `useManhwaByType(type)`.
- `titleMap` renders a friendly header (Updates / For You / Popular / Finished / Top Tier).
- 3-column grid of **memoized** `OptimizedCard`s; skeleton grid on first load.
- **Pull-to-refresh** (`onRefresh={refresh}`) + **infinite scroll** (`onEndReached={loadMore}`).
- Shows a `count+` badge once data arrives.

### 7.6 Detail — `Detail/DetailScreen.jsx` (+ `DetailSection`, `ChapterListSection`)
Loads two things in parallel: `useManhwaDetail(id)` and `useChapterList(id)`.

**DetailSection (hero + info):**
- Blurred full-bleed cover as background (`blurRadius={10}`) + black overlay + downward gradient blending into the body.
- Floating cover art with drop shadow (`fadeInUp`).
- **Rank badge** (`RANK #{rank}`).
- **Stats row:** Rating (`user_rate`), Views (`view_count/1_000_000` → `M`), Release year.
- **Credits chips** from `taxonomy.Artist / Author / Format`.
- **Genre chips** from `taxonomy.Genre`.
- **Synopsis** with `&quot;` → `"` cleanup and a fallback string.

**ChapterListSection:**
- **Sort toggle** flips `order` desc↔asc (Terbaru/Terlama).
- **Jump-to-chapter** numeric input bound to `search` (resets to page 1 on change).
- Each chapter card shows thumbnail, `Chapter {number}`, and a **relative time** computed by `getRelativeTime()` (Baru saja / X menit lalu / X jam lalu / localized `id-ID` date).
- **NEW badge** when the chapter released < 24h ago.
- **Numbered pagination** (windowed around the current page) with prev/next; total pages from `meta.total_page`.
- Tapping a chapter → `Read { chapterId }`.

**Floating action bar:** a bookmark button (haptic only, not yet persisted) + **"BACA SEKARANG"** which jumps to `manhwaDetail.latest_chapter_id`. Hardware back returns to `Main`.

### 7.7 Chapter Reader — `Chapter/ChapterScreen.jsx`
The immersive reader. State: `currentChapterId` (seeded from route param) + `showControls`.

- Fetches pages via `useChapterDetail(currentChapterId)`; title via `useManhwaDetail(chapterDetail.manga_id)`.
- Renders `chapterDetail.chapter.data` in a vertical `FlatList` of `MangaImageItem`s.
- **`MangaImageItem`** (memoized): renders each page full-width; on first load it reads the image's natural `width/height` and sets `aspectRatio`, so tall webtoon panels display at the correct height. `contentFit="contain"`, `cachePolicy="disk"`.
- **Tap to toggle UI:** tapping any image flips `showControls`. Top bar (back + title + chapter number) and bottom bar (prev/next) animate in/out (`fadeInDown`/`fadeInUp`).
- **Prev/Next chapter:** `handleChapterChange(newId)` sets `currentChapterId`, which re-runs the hook and loads the new chapter **in place** (no navigation push). Buttons disable at boundaries (`prev_chapter_id`/`next_chapter_id` null).
- FlatList is tuned for large images: `initialNumToRender={3}`, `maxToRenderPerBatch={3}`, `windowSize={5}`, `removeClippedSubviews`.

### 7.8 Bookmark / Library — `BookmarkScreen.jsx`
- Header with a live count badge; 2-column grid of saved `ManhwaCard`s with staggered animation.
- Polished empty state ("Your Library is Empty").
- **Current state:** `bookmarks` is a hard-coded empty array — **no persistence is implemented yet**, so it always shows the empty state.

### 7.9 History — `HistoryScreen.jsx`
- "Recent History" list of cards (cover, title, last chapter, HD badge, relative time, continue button).
- **Current state:** renders **dummy/placeholder data** (e.g. a Solo Leveling sample); reading history is not yet tracked/persisted.

### 7.10 Info — `Info/InfoScreen.jsx`
- Version badge with a live "stable build" indicator (`V.1.0.1 Stable Build`).
- **Accordion cards** (animated via `LayoutAnimation.easeInEaseOut`; only one open at a time) covering **Project Mission**, **Data & Privacy**, **Community Rules**, **Support Dev**.
- Android layout animation explicitly enabled via `UIManager.setLayoutAnimationEnabledExperimental(true)`.

---

## 8. Shared Components

| Component | Role / How it works |
|-----------|---------------------|
| `ManhwaCard` | Standard grid card. Shows cover (`expo-image`, `memory-disk` cache), a **country flag** SVG (`country_id` → kr/jp/cn), latest chapter badge, and formatted view count (`K`/`M`). **Custom `memo` comparator** re-renders only when `manga_id` or `latest_chapter_number` changes. |
| `FeaturesCard` (FeaturedCard) | Large hero card used as the first Popular item. |
| `MiniCard` | Compact card used for the paired Popular grid. |
| `FilterSheet` | Bottom-sheet `Modal`. Holds a **local copy** of filters, edits it via chips (Format/Status/Genres), then commits everything on **Apply** (`updateFilter` per key) or wipes via **Reset**. Genres are multi-select (toggle add/remove). |
| `GenreBadge` / `GenreBadgeSkeleton` | Genre pills + loading placeholders. |
| `ManhwaCardSkeleton`, `PopularSkeleton`, `DetailSectionSkeleton`, `ChapterListSectionSkeleton` | Loading placeholders matching each real layout. |

> Note: `Explore/GenreSceen.jsx` and `Chapter/ManhwaImage.jsx` exist but are currently **empty stubs**. `GenreSection.jsx` references a `navigation` variable that isn't passed in — its `onTouch*` swipe-locking handlers would error if triggered.

---

## 9. Design System & UX Patterns

- **Palette:** background `#0F0F12` / `#121215`, surfaces `#1A1A1F`, accent red `#EF4444`, muted zinc grays. Country/status colors used sparingly.
- **Typography:** heavy `font-black`, tight tracking, uppercase "eyebrow" labels with a short red rule — a consistent section-header motif across every screen.
- **Motifs:** rounded cards (`rounded-[28px]`+), edge gradient masks (`LinearGradient` transparent→bg) so lists fade under the tab bar, glow accents.
- **Micro-interactions:** haptics on taps, staggered list reveals, animated splash and tab bar, accordion transitions.
- **Copy:** primarily **Indonesian** (Baca Sekarang, Cari judul…, Terapkan Filter, relative dates in `id-ID`).

---

## 10. Performance Strategy

- **Image caching:** `expo-image` with `cachePolicy="memory-disk"` (cards) and `"disk"` (reader) plus fade `transition`.
- **List virtualization:** `FlatList` with `removeClippedSubviews`, tuned `initialNumToRender` / `maxToRenderPerBatch` / `windowSize` (especially conservative in the image-heavy reader).
- **Memoization:** `React.memo` on `ManhwaCard` (custom comparator), `PopularSection`, and All-screen cards; `useMemo` for Popular pairing; `useCallback` for fetchers.
- **Navigation:** global `animation: "none"` + `freezeOnBlur` to cut transition and background render cost.
- **Debouncing:** 500 ms on search and explore filters to minimize API calls.
- **Graceful failures:** the API client returns `null` on error so no fetch can crash the UI.

---

## 11. Known Limitations

- **Bookmarks are not persisted** — `BookmarkScreen` uses a hard-coded empty array; the Detail bookmark button only triggers haptics.
- **History is not tracked** — `HistoryScreen` shows placeholder data.
- **`getManhwa/getManga/getManhua`** reference an out-of-scope `format` variable and would throw if used (currently unused).
- **`GenreSection`** uses an undefined `navigation` in its touch handlers; **`GenreSceen.jsx`** and **`ManhwaImage.jsx`** are empty stubs.
- **Requires `EXPO_PUBLIC_API_BASE_URL`** to be set and reachable; without it, all lists are empty.
- Share / more-options actions on the Detail hero are commented out (not implemented).

---

## Quick Start (for reference)

```bash
# 1. Install
npm install

# 2. Configure the backend
echo "EXPO_PUBLIC_API_BASE_URL=https://<your-api-host>" > .env

# 3. Run
npm run start      # Expo dev server
npm run android    # build & run on Android
npm run ios        # build & run on iOS
```
