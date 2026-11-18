import { authHeader } from "./auth";

// Shinigami moved its API from api.shngm.io (list/chapter routes now 502)
// to api.shinigami.io; the version prefix is part of the base.
const API_BASE_URL = 'https://api.shinigami.io/v1';

const fetchData = async (endpoint: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    return null;
  }
};

/**
 * The list endpoints page with `offset` + `limit` now (`page`/`page_size` are
 * ignored) and only report `meta.has_next`, no totals. Callers keep thinking
 * in pages; `meta.page` / `meta.has_next` come back for the paginators.
 */
const fetchList = async (path: string, params: Record<string, any>, page = 1, pageSize = 24) => {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    for (const item of Array.isArray(v) ? v : [v]) qs.append(k, String(item));
  }
  qs.set("limit", String(pageSize));
  qs.set("offset", String((page - 1) * pageSize));
  const res = await fetchData(`${path}?${qs}`);
  if (!res) return null;
  return { ...res, meta: { ...res.meta, page, page_size: pageSize, has_next: !!res.meta?.has_next } };
};

/**
 * Chapter lists are cursor-based now (`next_cursor`, no totals), which can't
 * jump to page N. A series is at most a few thousand chapters, so the whole
 * list is loaded once per manga + direction and paged / searched locally —
 * that also brings back exact `total_page` / `total_record`.
 */
const chapterListCache = new Map<string, Promise<any[] | null>>();

const loadAllChapters = (mangaId: string, order: string) => {
  const key = `${mangaId}:${order}`;
  const cached = chapterListCache.get(key);
  if (cached) return cached;
  const req = (async () => {
    const all: any[] = [];
    let cursor = "";
    for (let i = 0; i < 20; i++) {
      const res = await fetchData(
        `/chapter/${mangaId}/list?limit=2000&sort_by=chapter_number&sort_order=${order}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`
      );
      if (!res) throw new Error("chapter-list");
      all.push(...(res.data ?? []));
      cursor = res.meta?.next_cursor ?? "";
      if (!res.meta?.has_next || !cursor) break;
    }
    return all;
  })().catch(() => {
    // don't cache failures, or the list stays empty for the whole session
    chapterListCache.delete(key);
    return null;
  });
  chapterListCache.set(key, req);
  // keep chapter lists fresh for new releases
  setTimeout(() => chapterListCache.delete(key), 5 * 60 * 1000);
  return req;
};

/**
 * Authenticated POST to the Shinigami API. Returns the parsed body on success,
 * or throws so callers can roll back an optimistic UI update. The Bearer token
 * comes from the imported session (see `src/utils/auth.ts`).
 */
const postAuth = async (endpoint: string, body: unknown) => {
  const auth = authHeader();
  if (!auth.Authorization) throw new Error("not-authenticated");
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...auth },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`POST ${endpoint} -> ${response.status}`);
  return response.json().catch(() => ({}));
};

/**
 * In-flight/resolved first-chapter lookups, keyed by manga id.
 *
 * List endpoints only carry `latest_chapter_*`, so "start from the beginning"
 * always costs an extra request. Several surfaces ask for the same series (the
 * home hero as it cycles, the detail CTA), and the hero re-asks every time a
 * slide comes back around — caching the promise makes all of that one request.
 */
const firstChapterCache = new Map<string, Promise<any>>();

export const apiService = {
  getNewUpdate: (page = 1, pageSize = 30, format = "all") =>
    fetchList("/manga/list", { format: format !== "all" ? format : "", type: "project", is_update: true, sort: "latest", sort_order: "desc" }, page, pageSize),

  getPopular: (page = 1, pageSize = 24) =>
    fetchList("/manga/list", { sort: "popularity", sort_order: "desc" }, page, pageSize),

  getTop: (page = 1, pageSize = 24) =>
    fetchList("/manga/list", { sort: "rating", sort_order: "desc" }, page, pageSize),

  getRecommend: (page = 1, pageSize = 8) =>
    fetchList("/manga/list", { category: "explore-list-2" }, page, pageSize),

  getCompleted: (page = 1, pageSize = 24) =>
    fetchList("/manga/list", { status: "completed", sort: "latest", sort_order: "desc" }, page, pageSize),

  getManhwa: (page = 1, pageSize = 10) =>
    fetchList("/manga/list", { format: "manhwa", is_recommended: true, sort: "latest", sort_order: "desc" }, page, pageSize),

  getManga: (page = 1, pageSize = 10) =>
    fetchList("/manga/list", { format: "manga", is_recommended: true, sort: "latest", sort_order: "desc" }, page, pageSize),

  getManhua: (page = 1, pageSize = 10) =>
    fetchList("/manga/list", { format: "manhua", is_recommended: true, sort: "latest", sort_order: "desc" }, page, pageSize),

  getDetail: (manhwaId: string) => fetchData(`/manga/detail/${manhwaId}`),

  getChapterList: (
    manhwaId: string,
    page = 1,
    pageSize = 24,
    order = "desc",
    search = ""
  ) =>
    loadAllChapters(manhwaId, order === "asc" ? "asc" : "desc").then((all) => {
      if (!all) return null;
      const q = String(search ?? "").trim().toLowerCase();
      const rows = q
        ? all.filter((c) => String(c.chapter_number).includes(q) || String(c.chapter_title ?? "").toLowerCase().includes(q))
        : all;
      return {
        retcode: 0,
        data: rows.slice((page - 1) * pageSize, page * pageSize),
        meta: {
          page,
          page_size: pageSize,
          total_record: rows.length,
          total_page: Math.max(1, Math.ceil(rows.length / pageSize)),
          has_next: page * pageSize < rows.length,
        },
      };
    }),

  getChapterDetail: (chapterId: string) =>
    fetchData(`/chapter/detail/${chapterId}`),

  /** Chapter 1 of a series — the target of every "Mulai Baca" button. */
  getFirstChapter: (manhwaId: string): Promise<any> => {
    const cached = firstChapterCache.get(manhwaId);
    if (cached) return cached;
    const req = fetchData(
      `/chapter/${manhwaId}/list?limit=1&sort_by=chapter_number&sort_order=asc`
    )
      .then((r) => r?.data?.[0] ?? null)
      // a failed lookup must not be cached, or the button stays broken for the
      // rest of the session
      .catch(() => {
        firstChapterCache.delete(manhwaId);
        return null;
      });
    firstChapterCache.set(manhwaId, req);
    return req;
  },

  searchManga: (keyword: string, page = 1, pageSize = 8) =>
    fetchList("/manga/list", { q: keyword }, page, pageSize),

  // /genre/list is gone; genres are a taxonomy type now
  getGenres: () => fetchData("/taxonomy/list?type=genre&limit=100"),

  /** Authenticated user's profile. Only `user_id` is required by the API. */
  getUserProfile: (userId: string) =>
    fetchData(`/user/profile?user_id=${encodeURIComponent(userId)}`),

  getExplore: ({
    page = 1,
    pageSize = 24,
    genres = [],
    status = "",
    sort = "latest",
    format = "",
    sortOrder = "desc",
    keyword = "",
  }: {
    page?: number;
    pageSize?: number;
    genres?: string[];
    status?: string;
    sort?: string;
    format?: string;
    sortOrder?: string;
    keyword?: string;
  }) => {
    return fetchList(
      "/manga/list",
      {
        genre_include: genres,
        genre_include_mode: genres.length ? "or" : "",
        status,
        format: format !== "all" ? format : "",
        sort,
        sort_order: sortOrder,
        q: keyword,
      },
      page,
      pageSize
    );
  },

  // ── Bookmarks (per-account, server-side) ──────────────────────────────
  // The account's bookmark list. Each item is a full manga object (title,
  // covers, latest chapter…), so the bookmark page needs no per-id lookups.
  // Requires an imported session; throws otherwise.
  getBookmarks: async (page = 1, pageSize = 100) => {
    const auth = authHeader();
    if (!auth.Authorization) throw new Error("not-authenticated");
    const res = await fetch(
      `${API_BASE_URL}/bookmark/list?limit=${pageSize}&offset=${(page - 1) * pageSize}`,
      { headers: auth }
    );
    if (!res.ok) throw new Error(`bookmark/list -> ${res.status}`);
    return res.json();
  },

  // Note the asymmetric payloads the upstream expects: add takes a single
  // `manga_id`, remove takes a `manga_id_list` array.
  addBookmark: (mangaId: string) =>
    postAuth("/bookmark/add", { manga_id: mangaId }),

  removeBookmark: (mangaId: string) =>
    postAuth("/bookmark/remove", { manga_id_list: [mangaId] }),

  // ── Reading history (per-account, server-side) ────────────────────────
  // History is grouped per manga on the upstream: this lists the manga you
  // have history for (manga-level objects, no read-position). Requires auth.
  getHistory: async (page = 1, pageSize = 50) => {
    const auth = authHeader();
    if (!auth.Authorization) throw new Error("not-authenticated");
    const res = await fetch(
      // was /history/list/manga (404 now)
      `${API_BASE_URL}/history/list?limit=${pageSize}&offset=${(page - 1) * pageSize}&sort_by=updated_at&sort_order=desc`,
      { headers: auth }
    );
    if (!res.ok) throw new Error(`history/list -> ${res.status}`);
    return res.json();
  },

  // The chapters read within one manga: `{ chapter_id, chapter_number,
  // page_number, updated_at }`, newest first — data[0] is "continue from here".
  getHistoryChapters: async (mangaId: string) => {
    const auth = authHeader();
    if (!auth.Authorization) throw new Error("not-authenticated");
    const res = await fetch(
      // was /history/list/chapter/:id
      `${API_BASE_URL}/chapter/${mangaId}/history?sort_by=updated_at&sort_order=desc`,
      { headers: auth }
    );
    if (!res.ok) throw new Error(`chapter/history -> ${res.status}`);
    return res.json();
  },

  // Record (upsert) reading progress for a chapter. Throws if not signed in.
  addHistory: (mangaId: string, chapterId: string, pageNumber = 1) =>
    postAuth("/history/add", {
      manga_id: mangaId,
      chapter_id: chapterId,
      page_number: pageNumber,
    }),

  // Clear ALL history. The upstream only supports clear-all: a populated
  // `manga_id_list` still wipes everything (verified), so there is no per-manga
  // removal — callers always send an empty list.
  removeHistory: () => postAuth("/history/remove", { manga_id_list: [] }),
};
