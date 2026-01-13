// src/services/subscriptionService.js

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

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
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
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

export const subscriptionService = {
  // Get all subscription plans
  getPlans: async () => {
    try {
      const data = await apiRequest("/api/subscription/plans");
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Get user's current subscription status
  getSubscriptionStatus: async () => {
    try {
      const data = await apiRequest("/api/subscription/status");
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Create subscription order (Razorpay)
  createOrder: async (planId) => {
    try {
      const data = await apiRequest("/api/subscription/create-order", {
        method: "POST",
        body: JSON.stringify({ planId }),
      });
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Verify payment after Razorpay success
  verifyPayment: async (paymentData) => {
    try {
      const data = await apiRequest("/api/subscription/verify-payment", {
        method: "POST",
        body: JSON.stringify(paymentData),
      });
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Cancel subscription
  cancelSubscription: async () => {
    try {
      const data = await apiRequest("/api/subscription/cancel", {
        method: "POST",
      });
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Get subscription history
  getSubscriptionHistory: async () => {
    try {
      const data = await apiRequest("/api/subscription/history");
      return data;
    } catch (error) {
      throw error;
    }
  },
};
