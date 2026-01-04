// src/services/watchHistoryService.js

// Get token from localStorage
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("streamsphere_auth_token");
  }
  return null;
};

// API Request Helper
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(endpoint, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  } catch (error) {
    console.error("API Request Error:", error);
    throw error;
  }
};

export const watchHistoryService = {
  // Get watch history with pagination
  getWatchHistory: async (page = 1, limit = 50) => {
    try {
      const data = await apiRequest(
        `/api/watch-history?page=${page}&limit=${limit}`
      );
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Add or update watch history
  updateWatchHistory: async (historyData) => {
    try {
      const data = await apiRequest("/api/watch-history", {
        method: "POST",
        body: JSON.stringify(historyData),
      });
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Get continue watching list
  getContinueWatching: async () => {
    try {
      const data = await apiRequest("/api/continue-watching");
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Remove from watch history
  removeFromHistory: async (
    mediaId,
    seasonNumber = null,
    episodeNumber = null
  ) => {
    try {
      let url = `/api/watch-history/${mediaId}`;

      if (seasonNumber && episodeNumber) {
        url += `?seasonNumber=${seasonNumber}&episodeNumber=${episodeNumber}`;
      }

      const data = await apiRequest(url, {
        method: "DELETE",
      });
      return data;
    } catch (error) {
      throw error;
    }
  },
};
