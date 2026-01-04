// src/components/common/MediaCard.js
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { Bookmark, BookmarkBorder } from "@mui/icons-material";
import {
  addToWatchlist,
  removeFromWatchlist,
  checkInWatchlist,
} from "@/redux/actions/watchlistActions";

export default function MediaCard({ media, showWatchlistButton = true }) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if media is in watchlist when component mounts
    if (isAuthenticated && showWatchlistButton) {
      checkWatchlistStatus();
    }
  }, [isAuthenticated, media._id]);

  const checkWatchlistStatus = async () => {
    const result = await dispatch(checkInWatchlist(media._id));
    if (result.success) {
      setInWatchlist(result.inWatchlist);
    }
  };

  const handleWatchlistToggle = async (e) => {
    e.stopPropagation(); // Prevent card click event

    if (!isAuthenticated) {
      // TODO: Open auth modal
      return;
    }

    setLoading(true);

    if (inWatchlist) {
      const result = await dispatch(removeFromWatchlist(media._id));
      if (result.success) {
        setInWatchlist(false);
      }
    } else {
      const result = await dispatch(addToWatchlist(media._id));
      if (result.success) {
        setInWatchlist(true);
      }
    }

    setLoading(false);
  };

  return (
    <Card
      sx={{
        minWidth: 200,
        maxWidth: 200,
        borderRadius: 2,
        cursor: "pointer",
        transition: "all 0.3s ease",
        backgroundColor: "#1a1a1a",
        color: "#fff",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        position: "relative",
        overflow: "hidden",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: "0 12px 24px rgba(0, 0, 0, 0.5)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        },
        "&:hover .card-overlay": {
          opacity: 1,
        },
        "&:hover .watchlist-button": {
          opacity: 1,
        },
      }}
    >
      {/* Poster Image */}
      <CardMedia
        component="img"
        height="240"
        image={media.posterUrl}
        alt={media.name}
        sx={{
          objectFit: "cover",
        }}
      />

      {/* Watchlist Button */}
      {showWatchlistButton && isAuthenticated && (
        <Tooltip
          title={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
        >
          <IconButton
            className="watchlist-button"
            onClick={handleWatchlistToggle}
            disabled={loading}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              color: inWatchlist ? "#ffd700" : "#fff",
              opacity: 0,
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.9)",
                transform: "scale(1.1)",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={20} sx={{ color: "#fff" }} />
            ) : inWatchlist ? (
              <Bookmark />
            ) : (
              <BookmarkBorder />
            )}
          </IconButton>
        </Tooltip>
      )}

      {/* Overlay Content - Shows on Hover */}
      <CardContent
        className="card-overlay"
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 70%, transparent 100%)",
          opacity: 0,
          transition: "opacity 0.3s ease",
        }}
      >
        {/* Title */}
        <Typography
          variant="h6"
          component="div"
          sx={{
            fontWeight: 700,
            fontSize: "0.9rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            mb: 0.5,
            color: "#fff",
            lineHeight: 1.3,
          }}
        >
          {media.name}
        </Typography>

        {/* Rating */}
        {media.rating && (
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.75rem",
              color: "#ffd700",
              mb: 0.5,
            }}
          >
            ⭐ {media.rating}
          </Typography>
        )}

        {/* Genres */}
        <Typography
          variant="body2"
          sx={{
            fontSize: "0.75rem",
            color: "rgba(255, 255, 255, 0.7)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {media.genres?.join(", ")}
        </Typography>
      </CardContent>
    </Card>
  );
}
