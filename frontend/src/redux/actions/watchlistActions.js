// src/redux/actions/watchlistActions.js
import { watchlistService } from "@/services/watchlistService";
import {
  setWatchlistLoading,
  setWatchlistError,
  setWatchlist,
  addToWatchlistSuccess,
  removeFromWatchlistSuccess,
} from "../reducer/watchlistReducer";

// Get watchlist
export const getWatchlist = () => async (dispatch) => {
  try {
    dispatch(setWatchlistLoading(true));
    const data = await watchlistService.getWatchlist();

    dispatch(
      setWatchlist({
        watchlist: data.watchlist,
        count: data.count,
      })
    );

    return { success: true, data };
  } catch (error) {
    dispatch(setWatchlistError(error.message));
    return { success: false, error: error.message };
  }
};

// Add to watchlist
export const addToWatchlist = (mediaId) => async (dispatch) => {
  try {
    dispatch(setWatchlistLoading(true));
    const data = await watchlistService.addToWatchlist(mediaId);

    dispatch(
      addToWatchlistSuccess({
        watchlistCount: data.watchlistCount,
      })
    );

    // Refresh watchlist
    dispatch(getWatchlist());

    return { success: true, data };
  } catch (error) {
    dispatch(setWatchlistError(error.message));
    return { success: false, error: error.message };
  }
};

// Remove from watchlist
export const removeFromWatchlist = (mediaId) => async (dispatch) => {
  try {
    dispatch(setWatchlistLoading(true));
    const data = await watchlistService.removeFromWatchlist(mediaId);

    dispatch(
      removeFromWatchlistSuccess({
        mediaId,
        watchlistCount: data.watchlistCount,
      })
    );

    return { success: true, data };
  } catch (error) {
    dispatch(setWatchlistError(error.message));
    return { success: false, error: error.message };
  }
};

// Check if in watchlist
export const checkInWatchlist = (mediaId) => async () => {
  try {
    const data = await watchlistService.checkInWatchlist(mediaId);
    return { success: true, inWatchlist: data.inWatchlist };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
