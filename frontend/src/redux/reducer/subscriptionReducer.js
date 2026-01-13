// src/redux/reducer/subscriptionReducer.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  plans: [],
  currentSubscription: null,
  subscriptionHistory: [],
  loading: false,
  error: null,
};

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {
    // Set loading
    setSubscriptionLoading: (state, action) => {
      state.loading = action.payload;
      state.error = null;
    },

    // Set error
    setSubscriptionError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    // Clear error
    clearSubscriptionError: (state) => {
      state.error = null;
    },

    // Set plans
    setPlans: (state, action) => {
      state.plans = action.payload;
      state.loading = false;
      state.error = null;
    },

    // Set current subscription
    setCurrentSubscription: (state, action) => {
      state.currentSubscription = action.payload;
      state.loading = false;
      state.error = null;
    },

    // Set subscription history
    setSubscriptionHistory: (state, action) => {
      state.subscriptionHistory = action.payload;
      state.loading = false;
      state.error = null;
    },

    // Payment success
    paymentSuccess: (state, action) => {
      state.currentSubscription = action.payload;
      state.loading = false;
      state.error = null;
    },

    // Cancel subscription success
    cancelSubscriptionSuccess: (state) => {
      if (state.currentSubscription) {
        state.currentSubscription.status = "cancelled";
      }
      state.loading = false;
      state.error = null;
    },

    // Clear subscription (on logout)
    clearSubscription: (state) => {
      state.plans = [];
      state.currentSubscription = null;
      state.subscriptionHistory = [];
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setSubscriptionLoading,
  setSubscriptionError,
  clearSubscriptionError,
  setPlans,
  setCurrentSubscription,
  setSubscriptionHistory,
  paymentSuccess,
  cancelSubscriptionSuccess,
  clearSubscription,
} = subscriptionSlice.actions;

export const subscriptionReducer = subscriptionSlice.reducer;
