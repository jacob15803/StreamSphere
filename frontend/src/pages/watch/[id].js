// src/pages/watch/[id].js - UPDATED VERSION
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  IconButton,
} from "@mui/material";
import { PlayArrow, Login, Close } from "@mui/icons-material";
import VideoPlayer from "@/components/player/VideoPlayer";
import { mediaService } from "@/services/mediaService";
import { updateWatchHistory } from "@/redux/actions/watchHistoryActions";
import { authUtils } from "@/services/authService";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

function WatchPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { id } = router.query;

  // ✅ Get auth state to check if user is logged in
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Media state
  const [media, setMedia] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Series state
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [episodes, setEpisodes] = useState([]);

  // Continue watching state
  const [initialTime, setInitialTime] = useState(0);

  // ✅ Track if we're showing trailer only (for non-logged-in users)
  const [isTrailerOnly, setIsTrailerOnly] = useState(false);
  const [showLoginOverlay, setShowLoginOverlay] = useState(true); // Add state to control overlay visibility

  // Fetch media details
  useEffect(() => {
    if (!id) return;

    const fetchMedia = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get media details
        const mediaData = await mediaService.getSingleMedia(id);
        if (!mediaData.success) {
          throw new Error("Media not found");
        }

        setMedia(mediaData.data);

        // ✅ IF USER IS NOT LOGGED IN - SHOW TRAILER ONLY
        if (!isAuthenticated) {
          setIsTrailerOnly(true);
          await loadTrailer(id);
          setLoading(false);
          return;
        }

        // ✅ IF USER IS LOGGED IN - LOAD FULL CONTENT
        if (mediaData.data.type === "series") {
          const episodesData = await mediaService.getEpisodes(id);
          if (episodesData.success) {
            // Get unique seasons
            const uniqueSeasons = [
              ...new Set(episodesData.data.map((ep) => ep.seasonNumber)),
            ].sort((a, b) => a - b);
            setSeasons(uniqueSeasons);

            // Set episodes for first season
            const season1Episodes = episodesData.data.filter(
              (ep) => ep.seasonNumber === 1
            );
            setEpisodes(season1Episodes);

            // Auto-select first episode
            if (season1Episodes.length > 0) {
              setSelectedEpisode(season1Episodes[0]);
              await loadEpisodeVideo(id, season1Episodes[0]._id);
            }
          }
        } else {
          // For movies, load video directly
          await loadMovieVideo(id);
        }

        // Check for continue watching progress
        await checkContinueWatching(id);
      } catch (err) {
        console.error("Error fetching media:", err);
        setError(err.message || "Failed to load media");
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [id, isAuthenticated]);

  // ✅ NEW FUNCTION: Load trailer (for non-logged-in users)
  const loadTrailer = async (mediaId) => {
    try {
      // Use public trailer endpoint (no authentication required)
      const response = await fetch(
        `${API_BASE_URL}/api/v1/video/public-trailer/${mediaId}`
      );
      const data = await response.json();

      if (data.success && data.trailerUrl) {
        console.log("Trailer loaded successfully");
        setVideoUrl(data.trailerUrl);
      } else {
        throw new Error(data.message || "Trailer not available");
      }
    } catch (err) {
      console.error("Error loading trailer:", err);
      setError("Failed to load trailer. " + err.message);
    }
  };

  // Load movie video URL
  const loadMovieVideo = async (mediaId) => {
    try {
      const token = authUtils.getToken();
      const response = await fetch(
        `${API_BASE_URL}/api/v1/video/signed-url/${mediaId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      if (data.success && data.videoUrl) {
        setVideoUrl(data.videoUrl);
      } else {
        throw new Error("Video URL not available");
      }
    } catch (err) {
      console.error("Error loading movie video:", err);
      setError("Failed to load video");
    }
  };

  // Load episode video URL
  const loadEpisodeVideo = async (mediaId, episodeId) => {
    try {
      const token = authUtils.getToken();
      const response = await fetch(
        `${API_BASE_URL}/api/v1/video/episode-signed-url/${mediaId}/${episodeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      if (data.success && data.episode.videoUrl) {
        setVideoUrl(data.episode.videoUrl);
      } else {
        throw new Error("Episode video URL not available");
      }
    } catch (err) {
      console.error("Error loading episode video:", err);
      setError("Failed to load episode video");
    }
  };

  // Check continue watching progress
  const checkContinueWatching = async (mediaId) => {
    if (!isAuthenticated) return;

    try {
      const token = authUtils.getToken();
      const response = await fetch(`${API_BASE_URL}/api/continue-watching`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success && data.continueWatching) {
        const item = data.continueWatching.find(
          (item) => item.media._id === mediaId
        );
        if (item && item.progress > 0) {
          setInitialTime(item.progress);
        }
      }
    } catch (err) {
      console.error("Error checking continue watching:", err);
    }
  };

  // Handle season change
  const handleSeasonChange = async (event, newSeason) => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setSelectedSeason(newSeason);
    try {
      const episodesData = await mediaService.getEpisodes(id, newSeason);
      if (episodesData.success) {
        setEpisodes(episodesData.data.episodes);
        if (episodesData.data.episodes.length > 0) {
          const firstEp = episodesData.data.episodes[0];
          setSelectedEpisode(firstEp);
          await loadEpisodeVideo(id, firstEp._id);
        }
      }
    } catch (err) {
      console.error("Error loading season episodes:", err);
    }
  };

  // Handle episode selection
  const handleEpisodeSelect = async (episode) => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setSelectedEpisode(episode);
    await loadEpisodeVideo(id, episode._id);
    setInitialTime(0);
  };

  // Handle progress tracking
  const handleProgress = async (currentTime, duration) => {
    if (!media || !id || !duration || !isAuthenticated) return;

    try {
      const progressPercent = Math.floor((currentTime / duration) * 100);

      await dispatch(
        updateWatchHistory({
          mediaId: id,
          seasonNumber: selectedEpisode?.seasonNumber || null,
          episodeNumber: selectedEpisode?.episodeNumber || null,
          progress: progressPercent,
          completed: progressPercent >= 95,
        })
      );
    } catch (err) {
      console.error("Error saving progress:", err);
    }
  };

  // Handle video end
  const handleVideoEnd = () => {
    if (!isAuthenticated) return;

    // Mark as completed
    if (media && id) {
      dispatch(
        updateWatchHistory({
          mediaId: id,
          seasonNumber: selectedEpisode?.seasonNumber || null,
          episodeNumber: selectedEpisode?.episodeNumber || null,
          progress: 100,
          completed: true,
        })
      );
    }

    // Auto-play next episode for series
    if (media?.type === "series" && selectedEpisode) {
      const currentIndex = episodes.findIndex(
        (ep) => ep._id === selectedEpisode._id
      );
      if (currentIndex < episodes.length - 1) {
        handleEpisodeSelect(episodes[currentIndex + 1]);
      }
    }
  };

  // ✅ Handle login button click
  const handleLoginClick = () => {
    router.push("/login");
  };

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

  if (error || !media) {
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
        <Container maxWidth="sm">
          <Alert severity="error">{error || "Media not found"}</Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#000",
        pt: 8,
      }}
    >
      {/* Video Player */}
      <Box
        sx={{
          width: "100%",
          height: { xs: "50vh", md: "80vh" },
          backgroundColor: "#000",
          position: "relative",
        }}
      >
        {videoUrl ? (
          <VideoPlayer
            videoUrl={videoUrl}
            posterUrl={media.posterUrl}
            onProgress={handleProgress}
            initialTime={initialTime}
            onEnded={handleVideoEnd}
            autoPlay={isAuthenticated}
          />
        ) : (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography sx={{ color: "#fff" }}>Loading video...</Typography>
          </Box>
        )}

        {/* ✅ LOGIN OVERLAY for non-authenticated users - Only covers center, not controls */}
        {!isAuthenticated && showLoginOverlay && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 80, // Leave space for video controls
              background: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              zIndex: 5, // Lower z-index so controls are accessible
              pointerEvents: "none", // Allow clicks to pass through
            }}
          >
            <Box
              sx={{
                pointerEvents: "auto", // Only the button area should capture clicks
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                backgroundColor: "rgba(0, 0, 0, 0.9)",
                padding: 4,
                borderRadius: 2,
                backdropFilter: "blur(10px)",
                position: "relative",
                minWidth: { xs: "90%", sm: "500px" },
              }}
            >
              {/* Close Button */}
              <IconButton
                onClick={() => setShowLoginOverlay(false)}
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  color: "rgba(255, 255, 255, 0.7)",
                  "&:hover": {
                    color: "#fff",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                <Close />
              </IconButton>

              <Typography
                variant="h4"
                sx={{
                  color: "#fff",
                  fontWeight: 600,
                  textAlign: "center",
                  px: 2,
                }}
              >
                {isTrailerOnly ? "This is a Trailer" : "Login Required"}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: "rgba(255, 255, 255, 0.8)",
                  textAlign: "center",
                  px: 2,
                  mb: 2,
                }}
              >
                Login to watch the full{" "}
                {media.type === "series" ? "series" : "movie"}
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<Login />}
                onClick={handleLoginClick}
                sx={{
                  backgroundColor: "#ffd700",
                  color: "#000",
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                  "&:hover": {
                    backgroundColor: "#ffed4e",
                    transform: "scale(1.05)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Login to Watch
              </Button>
            </Box>
          </Box>
        )}
      </Box>

      {/* Media Information */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Title and Details */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              color: "#fff",
              fontWeight: 600,
              mb: 2,
            }}
          >
            {media.name}
            {media.type === "series" && selectedEpisode && isAuthenticated && (
              <Typography
                component="span"
                sx={{ color: "#ffd700", ml: 2, fontSize: "1.2rem" }}
              >
                S{selectedEpisode.seasonNumber}:E{selectedEpisode.episodeNumber}{" "}
                - {selectedEpisode.title}
              </Typography>
            )}
          </Typography>

          <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
            <Typography sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
              {new Date(media.releaseDate).getFullYear()}
            </Typography>
            {media.duration && (
              <Typography sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                {media.duration} min
              </Typography>
            )}
            {media.rating && (
              <Typography sx={{ color: "#ffd700" }}>
                ★ {media.rating}
              </Typography>
            )}
          </Box>

          <Typography
            sx={{
              color: "rgba(255, 255, 255, 0.9)",
              fontSize: "1rem",
              lineHeight: 1.6,
              mb: 2,
            }}
          >
            {media.description}
          </Typography>

          {media.genres && media.genres.length > 0 && (
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {media.genres.map((genre, index) => (
                <Box
                  key={index}
                  sx={{
                    px: 2,
                    py: 0.5,
                    bgcolor: "rgba(255, 215, 0, 0.2)",
                    borderRadius: 1,
                    color: "#ffd700",
                    fontSize: "0.875rem",
                  }}
                >
                  {genre}
                </Box>
              ))}
            </Box>
          )}

          {/* ✅ Show login prompt if not authenticated */}
          {!isAuthenticated && (
            <Box sx={{ mt: 3 }}>
              <Alert
                severity="info"
                sx={{
                  backgroundColor: "rgba(255, 215, 0, 0.1)",
                  color: "#ffd700",
                  border: "1px solid #ffd700",
                }}
              >
                Login to access all episodes and track your watch history
              </Alert>
            </Box>
          )}
        </Box>

        {/* Episodes (for series) - Only show if authenticated */}
        {media.type === "series" && seasons.length > 0 && isAuthenticated && (
          <Box>
            <Typography
              variant="h5"
              sx={{
                color: "#fff",
                fontWeight: 600,
                mb: 3,
              }}
            >
              Episodes
            </Typography>

            {/* Season Tabs */}
            <Tabs
              value={selectedSeason}
              onChange={handleSeasonChange}
              sx={{
                mb: 3,
                "& .MuiTab-root": {
                  color: "rgba(255, 255, 255, 0.6)",
                  "&.Mui-selected": {
                    color: "#ffd700",
                  },
                },
                "& .MuiTabs-indicator": {
                  backgroundColor: "#ffd700",
                },
              }}
            >
              {seasons.map((season) => (
                <Tab key={season} label={`Season ${season}`} value={season} />
              ))}
            </Tabs>

            {/* Episode Grid */}
            <Grid container spacing={2}>
              {episodes.map((episode) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={episode._id}>
                  <Card
                    onClick={() => handleEpisodeSelect(episode)}
                    sx={{
                      backgroundColor: "#1a1a1a",
                      cursor: "pointer",
                      border:
                        selectedEpisode?._id === episode._id
                          ? "2px solid #ffd700"
                          : "1px solid rgba(255, 255, 255, 0.1)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.5)",
                      },
                    }}
                  >
                    <Box sx={{ position: "relative" }}>
                      <CardMedia
                        component="img"
                        height="140"
                        image={episode.thumbnailUrl || media.posterUrl}
                        alt={episode.title}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                        }}
                      >
                        <PlayArrow
                          sx={{
                            fontSize: 50,
                            color: "#fff",
                            opacity: 0.8,
                          }}
                        />
                      </Box>
                    </Box>
                    <CardContent>
                      <Typography
                        variant="body2"
                        sx={{ color: "#ffd700", mb: 0.5 }}
                      >
                        Episode {episode.episodeNumber}
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: "#fff",
                          fontWeight: 600,
                          mb: 1,
                        }}
                      >
                        {episode.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "rgba(255, 255, 255, 0.7)",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {episode.description}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "rgba(255, 255, 255, 0.5)",
                          display: "block",
                          mt: 1,
                        }}
                      >
                        {episode.duration} min
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* ✅ Show blurred episodes section for non-authenticated users */}
        {media.type === "series" && !isAuthenticated && (
          <Box
            sx={{
              position: "relative",
              mt: 4,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                color: "#fff",
                fontWeight: 600,
                mb: 3,
              }}
            >
              Episodes
            </Typography>

            <Box
              sx={{
                filter: "blur(8px)",
                pointerEvents: "none",
                opacity: 0.4,
              }}
            >
              <Grid container spacing={2}>
                {[1, 2, 3, 4].map((i) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                    <Card sx={{ backgroundColor: "#1a1a1a", height: 200 }}>
                      <CardMedia
                        component="div"
                        height="140"
                        sx={{ backgroundColor: "#333" }}
                      />
                      <CardContent>
                        <Typography sx={{ color: "#fff" }}>
                          Episode {i}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
              }}
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<Login />}
                onClick={handleLoginClick}
                sx={{
                  backgroundColor: "#ffd700",
                  color: "#000",
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  "&:hover": {
                    backgroundColor: "#ffed4e",
                  },
                }}
              >
                Login to View Episodes
              </Button>
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
}

// ✅ REMOVE ProtectedRoute wrapper - we handle auth inside the component
export default WatchPage;
