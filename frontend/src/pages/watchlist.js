// src/pages/watchlist.js
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import {
  Box,
  Container,
  Typography,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import { BookmarkBorder } from "@mui/icons-material";
import MediaCard from "@/components/common/MediaCard";
import { getWatchlist } from "@/redux/actions/watchlistActions";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

function WatchlistPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { watchlist, loading, error } = useSelector((state) => state.watchlist);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getWatchlist());
    }
  }, [dispatch, isAuthenticated]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#000",
        }}
      >
        <CircularProgress sx={{ color: "#ffd700" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#000",
        pt: 12,
        pb: 6,
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <BookmarkBorder sx={{ fontSize: 40, color: "#ffd700" }} />
            <Typography
              variant="h3"
              sx={{
                fontWeight: 600,
                color: "#fff",
                fontSize: { xs: "2rem", md: "2.5rem" },
              }}
            >
              My Watchlist
            </Typography>
          </Box>
          <Typography
            variant="body1"
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: "1.1rem",
            }}
          >
            {watchlist.length} {watchlist.length === 1 ? "item" : "items"} saved
          </Typography>
        </Box>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {/* Empty State */}
        {watchlist.length === 0 && !loading && (
          <Box
            sx={{
              textAlign: "center",
              py: 10,
            }}
          >
            <BookmarkBorder
              sx={{
                fontSize: 100,
                color: "rgba(255, 255, 255, 0.2)",
                mb: 3,
              }}
            />
            <Typography
              variant="h5"
              sx={{
                color: "#fff",
                mb: 2,
                fontWeight: 500,
              }}
            >
              Your watchlist is empty
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "rgba(255, 255, 255, 0.6)",
                mb: 4,
              }}
            >
              Start adding movies and series you want to watch later
            </Typography>
          </Box>
        )}

        {/* Watchlist Grid */}
        {watchlist.length > 0 && (
          <Grid container spacing={3}>
            {watchlist.map((media) => (
              <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={media._id}>
                <MediaCard media={media} showWatchlistButton={true} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}

export default function WatchlistPageWrapper() {
  return (
    <ProtectedRoute>
      <WatchlistPage />
    </ProtectedRoute>
  );
}
