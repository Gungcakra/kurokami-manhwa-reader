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

  searchManga: (keyword: string, page = 1, pageSize = 8) =>
    fetchData(`/v1/manga/list?page=${page}&page_size=${pageSize}&q=${keyword}`),

  getGenres: () => fetchData("/v1/genre/list"),

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
};
