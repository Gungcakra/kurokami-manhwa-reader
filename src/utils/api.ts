import axios from "axios";

const API_BASE_URL = import.meta.env.API;

// 🔹 Fetch List Manhwa
export const fetchNewManhwa = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/manhwa-new`);
    return response.data;
  } catch (error) {
    console.error("Error fetching new manhwa:", error);
    return [];
  }
};

export const fetchPopularManhwa = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/manhwa-popular`);
    return response.data;
  } catch (error) {
    console.error("Error fetching popular manhwa:", error);
    return [];
  }
};

export const fetchTopManhwa = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/manhwa-top`);
    return response.data;
  } catch (error) {
    console.error("Error fetching top manhwa:", error);
    return [];
  }
};

export const fetchOngoingManhwa = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/manhwa-ongoing`);
    return response.data;
  } catch (error) {
    console.error("Error fetching ongoing manhwa:", error);
    return [];
  }
};

export const fetchRecommendedManhwa = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/manhwa-recommendation`);
    return response.data;
  } catch (error) {
    console.error("Error fetching recommended manhwa:", error);
    return [];
  }
};

// 🔹 Fetch Detail Manhwa
export const fetchManhwaDetail = async (manhwaId: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/manhwa-detail/${manhwaId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching details for manhwa ${manhwaId}:`, error);
    return null;
  }
};

// 🔹 Fetch Detail Chapter
export const fetchChapterDetail = async (chapterId: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/chapter/${chapterId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching details for chapter ${chapterId}:`, error);
    return null;
  }
};

// 🔹 Fetch Genre List
export const fetchGenres = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/genres`);
    return response.data;
  } catch (error) {
    console.error("Error fetching genres:", error);
    return [];
  }
};

// 🔹 Fetch Manhwa by Genre
export const fetchManhwaByGenre = async (genreId: string, pageNumber: number = 1) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/genre/${genreId}/page/${pageNumber}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching manhwa for genre ${genreId} on page ${pageNumber}:`, error);
    return [];
  }
};

// 🔹 Search Manhwa
export const searchManhwa = async (searchQuery: string, pageNumber: number = 1) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/search/${searchQuery}/page/${pageNumber}`);
    return response.data;
  } catch (error) {
    console.error(`Error searching manhwa for query ${searchQuery} on page ${pageNumber}:`, error);
    return [];
  }
};
