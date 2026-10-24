import { authHeader } from "./auth";

const API_BASE_URL = 'https://api.shngm.io';

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
    fetchData(
      `/v1/manga/list?${format !== "all" ? `format=${format}&` : ""}type=project&page=${page}&page_size=${pageSize}&is_update=true&sort=latest&sort_order=desc`
    ),

  getPopular: (page = 1, pageSize = 24) =>
    fetchData(
      `/v1/manga/list?page=${page}&page_size=${pageSize}&genre_include_mode=or&genre_exclude_mode=or&sort=popularity&sort_order=desc`
    ),

  getTop: (page = 1, pageSize = 24) =>
    fetchData(
      `/v1/manga/list?page=${page}&page_size=${pageSize}&genre_include_mode=or&genre_exclude_mode=or&sort=rating&sort_order=desc`
    ),

  getRecommend: (page = 1, pageSize = 8) =>
    fetchData(
      `/v1/manga/list?page=${page}&page_size=${pageSize}&category=explore-list-2`
    ),

  getCompleted: (page = 1, pageSize = 24) =>
    fetchData(
      `/v1/manga/list?page=${page}&page_size=${pageSize}&genre_include_mode=or&genre_exclude_mode=or&status=completed&sort=latest&sort_order=desc`
    ),

  getManhwa: (page = 1, pageSize = 10) =>
    fetchData(
      `/v1/manga/list?format=manhwa&page=${page}&page_size=${pageSize}&is_recommended=true&sort=latest&sort_order=desc`
    ),

  getManga: (page = 1, pageSize = 10) =>
    fetchData(
      `/v1/manga/list?format=manga&page=${page}&page_size=${pageSize}&is_recommended=true&sort=latest&sort_order=desc`
    ),

  getManhua: (page = 1, pageSize = 10) =>
    fetchData(
      `/v1/manga/list?format=manhua&page=${page}&page_size=${pageSize}&is_recommended=true&sort=latest&sort_order=desc`
    ),

  getDetail: (manhwaId: string) => fetchData(`/v1/manga/detail/${manhwaId}`),

  getChapterList: (
    manhwaId: string,
    page = 1,
    pageSize = 24,
    order = "desc",
    search = ""
  ) =>
    fetchData(
      `/v1/chapter/${manhwaId}/list?page=${page}&page_size=${pageSize}&sort_by=chapter_number&sort_order=${order}${search ? `&search=${search}` : ""}`
    ),

  getChapterDetail: (chapterId: string) =>
    fetchData(`/v1/chapter/detail/${chapterId}`),

  /** Chapter 1 of a series — the target of every "Mulai Baca" button. */
  getFirstChapter: (manhwaId: string): Promise<any> => {
    const cached = firstChapterCache.get(manhwaId);
    if (cached) return cached;
    const req = fetchData(
      `/v1/chapter/${manhwaId}/list?page=1&page_size=1&sort_by=chapter_number&sort_order=asc`
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
    fetchData(`/v1/manga/list?page=${page}&page_size=${pageSize}&q=${keyword}`),

  getGenres: () => fetchData("/v1/genre/list"),

  /** Authenticated user's profile. Only `user_id` is required by the API. */
  getUserProfile: (userId: string) =>
    fetchData(`/v1/user/profile?user_id=${encodeURIComponent(userId)}`),

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
    const genreParams =
      genres.length > 0
        ? genres.map((g) => `genre_include=${encodeURIComponent(g)}`).join("&")
        : "";

    let url = `/v1/manga/list?page=${page}&page_size=${pageSize}`;
    if (genreParams) url += `&${genreParams}`;
    if (status) url += `&status=${status}`;
    if (format && format !== "all") url += `&format=${format}`;
    if (sort) url += `&sort=${sort}`;
    url += `&sort_order=${sortOrder}`;
    if (keyword) url += `&q=${encodeURIComponent(keyword)}`;
    url += `&genre_include_mode=or&genre_exclude_mode=or`;

    return fetchData(url);
  },

  // ── Bookmarks (per-account, server-side) ──────────────────────────────
  // The account's bookmark list. Each item is a full manga object (title,
  // covers, latest chapter…), so the bookmark page needs no per-id lookups.
  // Requires an imported session; throws otherwise.
  getBookmarks: async (page = 1, pageSize = 100) => {
    const auth = authHeader();
    if (!auth.Authorization) throw new Error("not-authenticated");
    const res = await fetch(
      `${API_BASE_URL}/v1/bookmark/list?page=${page}&page_size=${pageSize}`,
      { headers: auth }
    );
    if (!res.ok) throw new Error(`bookmark/list -> ${res.status}`);
    return res.json();
  },

  // Note the asymmetric payloads the upstream expects: add takes a single
  // `manga_id`, remove takes a `manga_id_list` array.
  addBookmark: (mangaId: string) =>
    postAuth("/v1/bookmark/add", { manga_id: mangaId }),

  removeBookmark: (mangaId: string) =>
    postAuth("/v1/bookmark/remove", { manga_id_list: [mangaId] }),

  // ── Reading history (per-account, server-side) ────────────────────────
  // History is grouped per manga on the upstream: this lists the manga you
  // have history for (manga-level objects, no read-position). Requires auth.
  getHistory: async (page = 1, pageSize = 50) => {
    const auth = authHeader();
    if (!auth.Authorization) throw new Error("not-authenticated");
    const res = await fetch(
      `${API_BASE_URL}/v1/history/list/manga?page=${page}&page_size=${pageSize}&sort_by=updated_at&sort_order=desc`,
      { headers: auth }
    );
    if (!res.ok) throw new Error(`history/list/manga -> ${res.status}`);
    return res.json();
  },

  // The chapters read within one manga: `{ chapter_id, chapter_number,
  // page_number, updated_at }`, newest first — data[0] is "continue from here".
  getHistoryChapters: async (mangaId: string) => {
    const auth = authHeader();
    if (!auth.Authorization) throw new Error("not-authenticated");
    const res = await fetch(
      `${API_BASE_URL}/v1/history/list/chapter/${mangaId}?sort_by=updated_at&sort_order=desc`,
      { headers: auth }
    );
    if (!res.ok) throw new Error(`history/list/chapter -> ${res.status}`);
    return res.json();
  },

  // Record (upsert) reading progress for a chapter. Throws if not signed in.
  addHistory: (mangaId: string, chapterId: string, pageNumber = 1) =>
    postAuth("/v1/history/add", {
      manga_id: mangaId,
      chapter_id: chapterId,
      page_number: pageNumber,
    }),

  // Clear ALL history. The upstream only supports clear-all: a populated
  // `manga_id_list` still wipes everything (verified), so there is no per-manga
  // removal — callers always send an empty list.
  removeHistory: () => postAuth("/v1/history/remove", { manga_id_list: [] }),
};
