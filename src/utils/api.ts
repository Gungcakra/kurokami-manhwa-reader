const API_BASE_URL = import.meta.env.PUBLIC_API_URL;

// 🔹 FETCH FROM SHINIGAMI
export const fetchNewShinigami = async () => {
  try {
    const response = await fetch("https://api.shngm.io/v1/manga/list?type=project&page=1&page_size=30&is_update=true&sort=latest&sort_order=desc");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching home:", error);
    return [];
  }
};

export const fetchDetailShinigami = async (manhwaId: string) => {
  try {
    const response = await fetch(`https://api.shngm.io/v1/manga/detail/${manhwaId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching home:", error);
    return [];
  }
};

export const fetchChapterListDetailShinigami = async (manhwaId: string) => {
  try {
    const response = await fetch(`https://api.shngm.io/v1/chapter/${manhwaId}/list?page=1&page_size=24&sort_by=chapter_number&sort_order=desc`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching home:", error);
    return [];
  }
};
// 🔹 Fetch List Manhwa
export const fetchHome = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/home`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching home:", error);
    return [];
  }
};

export const fetchNewManhwa = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/manhwa-new`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching new manhwa:", error);
    return [];
  }
};

export const fetchPopularManhwa = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/manhwa-popular`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching popular manhwa:", error);
    return [];
  }
};

export const fetchTopManhwa = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/manhwa-top`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching top manhwa:", error);
    return [];
  }
};

export const fetchOngoingManhwa = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/manhwa-ongoing`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching ongoing manhwa:", error);
    return [];
  }
};

export const fetchRecommendedManhwa = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/manhwa-recommendation`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching recommended manhwa:", error);
    return [];
  }
};

// 🔹 Fetch Detail Manhwa
export const fetchManhwaDetail = async (manhwaId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/manhwa-detail/${manhwaId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching details for manhwa ${manhwaId}:`, error);
    return null;
  }
};

// 🔹 Fetch Detail Chapter
export const fetchChapterDetail = async (chapterId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chapter/${chapterId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching details for chapter ${chapterId}:`, error);
    return null;
  }
};

// 🔹 Fetch Genre List
export const fetchGenres = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/genres`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching genres:", error);
    return [];
  }
};

// 🔹 Fetch Manhwa by Genre
export const fetchManhwaByGenre = async (genreId: string, pageNumber: number = 1) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/genre/${genreId}/page/${pageNumber}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching manhwa for genre ${genreId} on page ${pageNumber}:`, error);
    return [];
  }
};

// 🔹 Search Manhwa
export const searchManhwa = async (searchQuery: string, pageNumber: number = 1) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/search/${searchQuery}/page/${pageNumber}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error searching manhwa for query ${searchQuery} on page ${pageNumber}:`, error);
    return [];
  }
};
