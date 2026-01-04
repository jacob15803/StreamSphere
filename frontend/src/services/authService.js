// src/services/authService.js

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

// API Request Helper
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
    const response = await fetch(endpoint, config);
    const data = await response.json();

    if (response.status === 401) {
      authUtils.clearAuth();
      window.location.href = "/";
      throw new Error("Session expired. Please login again.");
    }

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  } catch (error) {
    console.error("API Request Error:", error);
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
