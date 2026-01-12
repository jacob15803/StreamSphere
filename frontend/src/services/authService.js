// src/services/authService.js

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

// Token Management Utilities
export const authUtils = {
  setToken: (token) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("streamsphere_auth_token", token);
    }
  },

  getToken: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("streamsphere_auth_token");
    }
    return null;
  },

  removeToken: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("streamsphere_auth_token");
    }
  },

  setUser: (user) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("streamsphere_user_data", JSON.stringify(user));
    }
  },

  getUser: () => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("streamsphere_user_data");
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  },

  removeUser: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("streamsphere_user_data");
    }
  },

  isAuthenticated: () => {
    return !!authUtils.getToken();
  },

  clearAuth: () => {
    authUtils.removeToken();
    authUtils.removeUser();
  },
};

// API Request Helper - FIXED VERSION
const apiRequest = async (endpoint, options = {}) => {
  const token = authUtils.getToken();

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    // Handle 401 Unauthorized - session expired
    if (response.status === 401) {
      authUtils.clearAuth();
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
      throw new Error("Session expired. Please login again.");
    }

    // For non-OK responses, throw error with message but don't log to console
    // This prevents Next.js from showing runtime errors
    if (!response.ok) {
      const error = new Error(data.message || "Something went wrong");
      error.statusCode = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    // Don't log the error to console to prevent Next.js runtime error overlay
    // Just re-throw it so the action can handle it
    throw error;
  }
};

// Auth Service
export const authService = {
  // Send OTP to email
  sendOTP: async (email) => {
    try {
      const data = await apiRequest("/api/auth/send-otp", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Verify OTP
  verifyOTP: async (email, otp) => {
    try {
      const data = await apiRequest("/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
      });

      // If existing user, save token and user data
      if (!data.isNewUser && data.token) {
        authUtils.setToken(data.token);
        authUtils.setUser(data.user);
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Complete registration for new user
  register: async (userData) => {
    try {
      const data = await apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
      });

      // Save token and user data
      if (data.token) {
        authUtils.setToken(data.token);
        authUtils.setUser(data.user);
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Get current user profile
  getCurrentUser: async () => {
    try {
      const data = await apiRequest("/api/auth/me");

      if (data.user) {
        authUtils.setUser(data.user);
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      const data = await apiRequest("/api/auth/profile", {
        method: "PUT",
        body: JSON.stringify(userData),
      });

      if (data.user) {
        authUtils.setUser(data.user);
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Logout
  logout: () => {
    authUtils.clearAuth();
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  },
};
