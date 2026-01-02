// src/services/watchlistService.js

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

export const watchlistService = {
  // Get user's watchlist
  getWatchlist: async () => {
    try {
      const data = await apiRequest("/api/watchlist");
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Add media to watchlist
  addToWatchlist: async (mediaId) => {
    try {
      const data = await apiRequest(`/api/watchlist/${mediaId}`, {
        method: "POST",
      });
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Remove media from watchlist
  removeFromWatchlist: async (mediaId) => {
    try {
      const data = await apiRequest(`/api/watchlist/${mediaId}`, {
        method: "DELETE",
      });
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Check if media is in watchlist
  checkInWatchlist: async (mediaId) => {
    try {
      const data = await apiRequest(`/api/watchlist/check/${mediaId}`);
      return data;
    } catch (error) {
      throw error;
    }
  },
};
