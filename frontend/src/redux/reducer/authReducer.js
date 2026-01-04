// src/redux/reducer/authReducer.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  otpSent: false,
  otpVerified: false,
  isNewUser: false,
  email: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Set loading state
    setAuthLoading: (state, action) => {
      state.loading = action.payload;
      state.error = null;
    },

    // Set error
    setAuthError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    // Clear error
    clearAuthError: (state) => {
      state.error = null;
    },

    // OTP sent successfully
    otpSentSuccess: (state, action) => {
      state.otpSent = true;
      state.isNewUser = action.payload.isNewUser;
      state.email = action.payload.email;
      state.loading = false;
      state.error = null;
    },

    // OTP verified successfully
    otpVerifiedSuccess: (state, action) => {
      state.otpVerified = true;
      state.isNewUser = action.payload.isNewUser;
      state.email = action.payload.email;
      state.loading = false;
      state.error = null;

      // If existing user, set user data and token
      if (!action.payload.isNewUser) {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      }
    },

    // Login success (for existing users after OTP verification)
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      state.otpSent = false;
      state.otpVerified = false;
    },

    // Registration success (for new users)
    registerSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      state.otpSent = false;
      state.otpVerified = false;
      state.isNewUser = false;
    },

    // Update user profile
    updateUserSuccess: (state, action) => {
      state.user = action.payload.user;
      state.loading = false;
      state.error = null;
    },

    // Logout
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.otpSent = false;
      state.otpVerified = false;
      state.isNewUser = false;
      state.email = null;
    },

    // Reset OTP flow
    resetOTPFlow: (state) => {
      state.otpSent = false;
      state.otpVerified = false;
      state.isNewUser = false;
      state.email = null;
      state.error = null;
    },

    // Set user from localStorage (for page refresh)
    setUserFromStorage: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
  },
});

export const {
  setAuthLoading,
  setAuthError,
  clearAuthError,
  otpSentSuccess,
  otpVerifiedSuccess,
  loginSuccess,
  registerSuccess,
  updateUserSuccess,
  logout,
  resetOTPFlow,
  setUserFromStorage,
} = authSlice.actions;

export const authReducer = authSlice.reducer;
