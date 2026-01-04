// Step 0: Install Redux Toolkit and React-Redux ($ npm install @reduxjs/toolkit react-redux)
// Step 1: Create Slice & Name it
// Step 2: Set Initial State
// Step 3: Set up Actions
// Step 4: Export State
// Step 5: Add Reducer Slice to Store
// Step 6: Make sure Provider is wrapping around the entire App(using _app.js)
// Step 7: Call State using useDispatch
// Step 8: Select Reducer Slice using useSelector

// const { configureStore } = require("@reduxjs/toolkit");
import { themeReducer } from "./reducer/themeReducer";
import { mediaReducer } from "./reducer/mediaReducer";
import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "./reducer/authReducer";
import { watchlistReducer } from "./reducer/watchlistReducer";
import { watchHistoryReducer } from "./reducer/watchHistoryReducer";

export const store = configureStore({
  reducer: {
    activeTheme: themeReducer,
    media: mediaReducer,
    // moviesData: movieReducer
    auth: authReducer,
    watchlist: watchlistReducer,
    watchHistory: watchHistoryReducer,
  },
});
