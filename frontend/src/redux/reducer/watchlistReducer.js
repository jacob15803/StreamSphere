// src/redux/reducer/watchlistReducer.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  watchlist: [],
  watchlistCount: 0,
  loading: false,
  error: null,
};

const watchlistSlice = createSlice({
  name: "watchlist",
  initialState,
  reducers: {
    // Set loading
    setWatchlistLoading: (state, action) => {
      state.loading = action.payload;
      state.error = null;
    },

    // Set error
    setWatchlistError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    // Clear error
    clearWatchlistError: (state) => {
      state.error = null;
    },

    // Set watchlist
    setWatchlist: (state, action) => {
      state.watchlist = action.payload.watchlist;
      state.watchlistCount = action.payload.count;
      state.loading = false;
      state.error = null;
    },

    // Add to watchlist
    addToWatchlistSuccess: (state, action) => {
      state.watchlistCount = action.payload.watchlistCount;
      state.loading = false;
      state.error = null;
    },

    // Remove from watchlist
    removeFromWatchlistSuccess: (state, action) => {
      state.watchlist = state.watchlist.filter(
        (item) => item._id !== action.payload.mediaId
      );
      state.watchlistCount = action.payload.watchlistCount;
      state.loading = false;
      state.error = null;
    },

    // Clear watchlist (on logout)
    clearWatchlist: (state) => {
      state.watchlist = [];
      state.watchlistCount = 0;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setWatchlistLoading,
  setWatchlistError,
  clearWatchlistError,
  setWatchlist,
  addToWatchlistSuccess,
  removeFromWatchlistSuccess,
  clearWatchlist,
} = watchlistSlice.actions;

export const watchlistReducer = watchlistSlice.reducer;
