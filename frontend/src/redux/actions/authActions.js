// src/redux/actions/authActions.js
import { authService, authUtils } from "@/services/authService";
import {
  setAuthLoading,
  setAuthError,
  otpSentSuccess,
  otpVerifiedSuccess,
  loginSuccess,
  registerSuccess,
  updateUserSuccess,
  logout as logoutAction,
  setUserFromStorage,
} from "../reducer/authReducer";

// Send OTP
export const sendOTP = (email) => async (dispatch) => {
  try {
    dispatch(setAuthLoading(true));
    const data = await authService.sendOTP(email);

    dispatch(
      otpSentSuccess({
        isNewUser: data.isNewUser,
        email: data.email,
      })
    );

    return { success: true, data };
  } catch (error) {
    const errorMessage =
      error.message || "Failed to send OTP. Please try again.";
    dispatch(setAuthError(errorMessage));
    return { success: false, error: errorMessage };
  }
};

// Verify OTP - FIXED VERSION
export const verifyOTP = (email, otp) => async (dispatch) => {
  try {
    dispatch(setAuthLoading(true));
    const data = await authService.verifyOTP(email, otp);

    dispatch(
      otpVerifiedSuccess({
        isNewUser: data.isNewUser,
        email: data.email,
        user: data.user,
        token: data.token,
      })
    );

    return { success: true, data };
  } catch (error) {
    // Extract the error message from the error object
    const errorMessage =
      error.message || "Failed to verify OTP. Please try again.";

    // Dispatch the error to Redux state (this will show in the UI)
    dispatch(setAuthError(errorMessage));

    // Return the error without logging to prevent Next.js runtime error
    return { success: false, error: errorMessage };
  }
};

// Register new user
export const register = (userData) => async (dispatch) => {
  try {
    dispatch(setAuthLoading(true));
    const data = await authService.register(userData);

    dispatch(
      registerSuccess({
        user: data.user,
        token: data.token,
      })
    );

    return { success: true, data };
  } catch (error) {
    const errorMessage =
      error.message || "Registration failed. Please try again.";
    dispatch(setAuthError(errorMessage));
    return { success: false, error: errorMessage };
  }
};

// Get current user
export const getCurrentUser = () => async (dispatch) => {
  try {
    dispatch(setAuthLoading(true));
    const data = await authService.getCurrentUser();

    dispatch(
      updateUserSuccess({
        user: data.user,
      })
    );

    return { success: true, data };
  } catch (error) {
    const errorMessage = error.message || "Failed to fetch user data.";
    dispatch(setAuthError(errorMessage));
    return { success: false, error: errorMessage };
  }
};

// Update user profile
export const updateProfile = (userData) => async (dispatch) => {
  try {
    dispatch(setAuthLoading(true));
    const data = await authService.updateProfile(userData);

    dispatch(
      updateUserSuccess({
        user: data.user,
      })
    );

    return { success: true, data };
  } catch (error) {
    const errorMessage = error.message || "Failed to update profile.";
    dispatch(setAuthError(errorMessage));
    return { success: false, error: errorMessage };
  }
};

// Logout
export const logout = () => (dispatch) => {
  authService.logout();
  dispatch(logoutAction());
};

// Load user from localStorage on app load
export const loadUserFromStorage = () => (dispatch) => {
  const token = authUtils.getToken();
  const user = authUtils.getUser();

  if (token && user) {
    dispatch(setUserFromStorage({ user, token }));
  }
};
