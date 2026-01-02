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
    dispatch(setAuthError(error.message));
    return { success: false, error: error.message };
  }
};

// Verify OTP
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
    dispatch(setAuthError(error.message));
    return { success: false, error: error.message };
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
    dispatch(setAuthError(error.message));
    return { success: false, error: error.message };
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
    dispatch(setAuthError(error.message));
    return { success: false, error: error.message };
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
    dispatch(setAuthError(error.message));
    return { success: false, error: error.message };
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
