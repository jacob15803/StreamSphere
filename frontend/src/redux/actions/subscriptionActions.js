// src/redux/actions/subscriptionActions.js
import { subscriptionService } from "@/services/subscriptionService";
import { updateUserSuccess } from "../reducer/authReducer";
import {
  setSubscriptionLoading,
  setSubscriptionError,
  setPlans,
  setCurrentSubscription,
  setSubscriptionHistory,
  paymentSuccess,
  cancelSubscriptionSuccess,
} from "../reducer/subscriptionReducer";

// Get all plans
export const getPlans = () => async (dispatch) => {
  try {
    dispatch(setSubscriptionLoading(true));
    const data = await subscriptionService.getPlans();

    dispatch(setPlans(data.plans));

    return { success: true, data };
  } catch (error) {
    dispatch(setSubscriptionError(error.message));
    return { success: false, error: error.message };
  }
};

// Get subscription status
export const getSubscriptionStatus = () => async (dispatch) => {
  try {
    dispatch(setSubscriptionLoading(true));
    const data = await subscriptionService.getSubscriptionStatus();

    dispatch(setCurrentSubscription(data.subscription));

    return { success: true, data };
  } catch (error) {
    dispatch(setSubscriptionError(error.message));
    return { success: false, error: error.message };
  }
};

// Create order
export const createSubscriptionOrder = (planId) => async (dispatch) => {
  try {
    dispatch(setSubscriptionLoading(true));
    const data = await subscriptionService.createOrder(planId);

    dispatch(setSubscriptionLoading(false));

    return { success: true, data };
  } catch (error) {
    dispatch(setSubscriptionError(error.message));
    return { success: false, error: error.message };
  }
};

// Verify payment
export const verifySubscriptionPayment = (paymentData) => async (dispatch) => {
  try {
    dispatch(setSubscriptionLoading(true));
    const data = await subscriptionService.verifyPayment(paymentData);

    dispatch(paymentSuccess(data.subscription));

    return { success: true, data };
  } catch (error) {
    dispatch(setSubscriptionError(error.message));
    return { success: false, error: error.message };
  }
};

// Cancel subscription
export const cancelSubscription = () => async (dispatch) => {
  try {
    dispatch(setSubscriptionLoading(true));
    const data = await subscriptionService.cancelSubscription();

    dispatch(cancelSubscriptionSuccess());

    return { success: true, data };
  } catch (error) {
    dispatch(setSubscriptionError(error.message));
    return { success: false, error: error.message };
  }
};

// Get subscription history
export const getSubscriptionHistory = () => async (dispatch) => {
  try {
    dispatch(setSubscriptionLoading(true));
    const data = await subscriptionService.getSubscriptionHistory();

    dispatch(setSubscriptionHistory(data.subscriptions));

    return { success: true, data };
  } catch (error) {
    dispatch(setSubscriptionError(error.message));
    return { success: false, error: error.message };
  }
};
