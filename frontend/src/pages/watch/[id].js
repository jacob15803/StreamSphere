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
  Stack,
} from "@mui/material";
import { PlayArrow, Login, Close, Stars, Download } from "@mui/icons-material";
import VideoPlayer from "@/components/player/VideoPlayer";
import AuthModal from "@/components/auth/AuthModal";
import { mediaService } from "@/services/mediaService";
import { updateWatchHistory } from "@/redux/actions/watchHistoryActions";
import { authUtils } from "@/services/authService";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

function WatchPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const {
    id,
    season: querySeason,
    episode: queryEpisode,
    time: queryTime,
  } = router.query;

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { currentSubscription } = useSelector((state) => state.subscription);

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

  // Check premium status from multiple sources
  const isPremium =
    currentSubscription?.isPremium ||
    (user?.subscription?.plan === "premium" &&
      user?.subscription?.status === "active") ||
    false;
  const [isTrailerOnly, setIsTrailerOnly] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Fetch media details
  useEffect(() => {
    if (!id) return;

    const fetchMedia = async () => {
      try {
        setLoading(true);
        setError(null);

        const mediaData = await mediaService.getSingleMedia(id);
        if (!mediaData.success) {
          throw new Error("Media not found");
        }

        setMedia(mediaData.data);

        // CHECK 1: If user is NOT logged in - SHOW TRAILER
        if (!isAuthenticated) {
          setIsTrailerOnly(true);
          setShowOverlay(true);
          await loadTrailer(id);
          setLoading(false);
          return;
        }

        // CHECK 2: If user is logged in but NOT premium - SHOW TRAILER
        if (isAuthenticated && !isPremium) {
          setIsTrailerOnly(true);
          setShowOverlay(true);
          await loadTrailer(id);
          setLoading(false);
          return;
        }

        // CHECK 3: User is logged in AND has premium - LOAD FULL CONTENT
        if (isAuthenticated && isPremium) {
          if (mediaData.data.type === "series") {
            const episodesData = await mediaService.getEpisodes(id);
            if (episodesData.success) {
              const uniqueSeasons = [
                ...new Set(episodesData.data.map((ep) => ep.seasonNumber)),
              ].sort((a, b) => a - b);
              setSeasons(uniqueSeasons);

              let episodeToPlay = null;
              let seasonToSelect = 1;

              // Priority 1: Query params (from continue watching click)
              if (querySeason && queryEpisode) {
                seasonToSelect = parseInt(querySeason);
                episodeToPlay = episodesData.data.find(
                  (ep) =>
                    ep.seasonNumber === parseInt(querySeason) &&
                    ep.episodeNumber === parseInt(queryEpisode),
                );

                if (queryTime) {
                  setInitialTime(parseFloat(queryTime));
                }
              }

              // Priority 2: First episode of first season
              if (!episodeToPlay) {
                seasonToSelect = uniqueSeasons[0] || 1;
                const seasonEpisodes = episodesData.data.filter(
                  (ep) => ep.seasonNumber === seasonToSelect,
                );
                episodeToPlay = seasonEpisodes[0];
              }

              setSelectedSeason(seasonToSelect);
              setEpisodes(
                episodesData.data.filter(
                  (ep) => ep.seasonNumber === seasonToSelect,
                ),
              );

              if (episodeToPlay) {
                setSelectedEpisode(episodeToPlay);
                await loadEpisodeVideo(id, episodeToPlay._id);
              }
            }
          } else {
            await loadMovieVideo(id);
          }

          if (!querySeason && !queryEpisode) {
            await checkContinueWatching(id);
          }
        }
      } catch (err) {
        console.error("Error fetching media:", err);
        setError(err.message || "Failed to load media");
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [id, isAuthenticated, isPremium, querySeason, queryEpisode, queryTime]);

  const loadTrailer = async (mediaId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/video/public-trailer/${mediaId}`,
      );
      const data = await response.json();

      if (data.success && data.trailerUrl) {
        setVideoUrl(data.trailerUrl);
      } else {
        throw new Error(data.message || "Trailer not available");
      }
    } catch (err) {
      console.error("Error loading trailer:", err);
      setError("Failed to load trailer. " + err.message);
    }
  };

  const loadMovieVideo = async (mediaId) => {
    try {
      const token = authUtils.getToken();
      const response = await fetch(
        `${API_BASE_URL}/api/v1/video/signed-url/${mediaId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();

      if (data.success && data.videoUrl) {
        setVideoUrl(data.videoUrl);
      } else {
        throw new Error("Video URL not available");
      }
    } catch (err) {
      console.error("Error loading movie video:", err);
      await loadTrailer(mediaId);
      setIsTrailerOnly(true);
    }
  };

  const loadEpisodeVideo = async (mediaId, episodeId) => {
    try {
      const token = authUtils.getToken();
      const response = await fetch(
        `${API_BASE_URL}/api/v1/video/episode-signed-url/${mediaId}/${episodeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();

      if (data.success && data.episode.videoUrl) {
        setVideoUrl(data.episode.videoUrl);
      } else {
        throw new Error("Episode video URL not available");
      }
    } catch (err) {
      console.error("Error loading episode video:", err);
      await loadTrailer(mediaId);
      setIsTrailerOnly(true);
    }
  };

  const checkContinueWatching = async (mediaId) => {
    if (!isAuthenticated || !isPremium) return;

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
          (item) => item.media._id === mediaId,
        );
        if (item && item.lastWatchedTime > 0) {
          setInitialTime(item.lastWatchedTime);
        }
      }
    } catch (err) {
      console.error("Error checking continue watching:", err);
    }
  };

  const handleSeasonChange = async (event, newSeason) => {
    if (!isPremium) {
      router.push("/subscription");
      return;
    }

    setSelectedSeason(newSeason);
    try {
      const episodesData = await mediaService.getEpisodes(id);
      if (episodesData.success) {
        const seasonEpisodes = episodesData.data.filter(
          (ep) => ep.seasonNumber === newSeason,
        );
        setEpisodes(seasonEpisodes);
        if (seasonEpisodes.length > 0) {
          const firstEp = seasonEpisodes[0];
          setSelectedEpisode(firstEp);
          await loadEpisodeVideo(id, firstEp._id);
        }
      }
    } catch (err) {
      console.error("Error loading season episodes:", err);
    }
  };

  const handleEpisodeSelect = async (episode) => {
    if (!isPremium) {
      router.push("/subscription");
      return;
    }

    setSelectedEpisode(episode);
    await loadEpisodeVideo(id, episode._id);
    setInitialTime(0);
  };

  const handleProgress = async (currentTime, duration) => {
    if (!media || !id || !duration || !isAuthenticated || !isPremium) return;

    try {
      const progressPercent = Math.floor((currentTime / duration) * 100);

      await dispatch(
        updateWatchHistory({
          mediaId: id,
          seasonNumber: selectedEpisode?.seasonNumber || null,
          episodeNumber: selectedEpisode?.episodeNumber || null,
          progress: progressPercent,
          lastWatchedTime: currentTime,
          completed: progressPercent >= 95,
        }),
      );
    } catch (err) {
      console.error("Error saving progress:", err);
    }
  };

  const handleVideoEnd = () => {
    if (!isAuthenticated || !isPremium) return;

    if (media && id) {
      dispatch(
        updateWatchHistory({
          mediaId: id,
          seasonNumber: selectedEpisode?.seasonNumber || null,
          episodeNumber: selectedEpisode?.episodeNumber || null,
          progress: 100,
          completed: true,
        }),
      );
    }

    if (media?.type === "series" && selectedEpisode) {
      const currentIndex = episodes.findIndex(
        (ep) => ep._id === selectedEpisode._id,
      );
      if (currentIndex < episodes.length - 1) {
        handleEpisodeSelect(episodes[currentIndex + 1]);
      }
    }
  };

  const handleActionClick = () => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
    } else {
      router.push("/subscription");
    }
  };

  const handleCloseAuthModal = () => {
    setAuthModalOpen(false);
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
    <>
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
              autoPlay={isPremium}
              shouldTrackProgress={isPremium && !isTrailerOnly}
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

          {/* Overlay for non-premium users */}
          {isTrailerOnly && showOverlay && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 80,
                background: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                zIndex: 5,
                pointerEvents: "none",
              }}
            >
              <Box
                sx={{
                  pointerEvents: "auto",
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
                <IconButton
                  onClick={() => setShowOverlay(false)}
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
                  {!isAuthenticated ? "This is a Trailer" : "Premium Content"}
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
                  {!isAuthenticated
                    ? `Login to watch the full ${
                        media.type === "series" ? "series" : "movie"
                      }`
                    : `Upgrade to Premium to watch the full ${
                        media.type === "series" ? "series" : "movie"
                      }`}
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={!isAuthenticated ? <Login /> : <Stars />}
                  onClick={handleActionClick}
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
                  {!isAuthenticated ? "Login to Watch" : "Upgrade to Premium"}
                </Button>
              </Box>
            </Box>
          )}
        </Box>

        {/* Media Information */}
        <Container maxWidth="xl" sx={{ py: 4 }}>
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
              {media.type === "series" && selectedEpisode && isPremium && (
                <Typography
                  component="span"
                  sx={{ color: "#ffd700", ml: 2, fontSize: "1.2rem" }}
                >
                  S{selectedEpisode.seasonNumber}:E
                  {selectedEpisode.episodeNumber} - {selectedEpisode.title}
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

            {/* FIXED: Only show for non-premium users */}
            {isTrailerOnly && !isPremium && (
              <Box sx={{ mt: 3 }}>
                <Alert
                  severity="info"
                  sx={{
                    backgroundColor: "rgba(255, 215, 0, 0.1)",
                    color: "#ffd700",
                    border: "1px solid #ffd700",
                  }}
                >
                  {!isAuthenticated
                    ? "Login to access all episodes and track your watch history"
                    : "Upgrade to Premium to access full episodes and exclusive content"}
                </Alert>
              </Box>
            )}
          </Box>

          {/* Episodes - IMPROVED LAYOUT */}
          {media.type === "series" && seasons.length > 0 && isPremium && (
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

              <Box
                sx={{
                  borderBottom: 1,
                  borderColor: "rgba(255, 255, 255, 0.1)",
                  mb: 3,
                }}
              >
                <Tabs
                  value={selectedSeason}
                  onChange={handleSeasonChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    "& .MuiTab-root": {
                      color: "rgba(255, 255, 255, 0.6)",
                      fontSize: "1rem",
                      fontWeight: 500,
                      minWidth: 120,
                      "&.Mui-selected": {
                        color: "#ffd700",
                      },
                    },
                    "& .MuiTabs-indicator": {
                      backgroundColor: "#ffd700",
                      height: 3,
                    },
                    "& .MuiTabs-scrollButtons": {
                      color: "#fff",
                    },
                  }}
                >
                  {seasons.map((season) => (
                    <Tab
                      key={season}
                      label={`Season ${season}`}
                      value={season}
                    />
                  ))}
                </Tabs>
              </Box>

              {/* Horizontal Scrollable Episode List */}
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  overflowX: "auto",
                  pb: 2,
                  "&::-webkit-scrollbar": {
                    height: 8,
                  },
                  "&::-webkit-scrollbar-track": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    borderRadius: 4,
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "#ffd700",
                    borderRadius: 4,
                  },
                }}
              >
                {episodes.map((episode) => (
                  <Card
                    key={episode._id}
                    onClick={() => handleEpisodeSelect(episode)}
                    sx={{
                      minWidth: 280,
                      maxWidth: 280,
                      backgroundColor: "#1a1a1a",
                      cursor: "pointer",
                      border:
                        selectedEpisode?._id === episode._id
                          ? "2px solid #ffd700"
                          : "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: 2,
                      transition: "all 0.3s ease",
                      flexShrink: 0,
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.5)",
                        borderColor: "#ffd700",
                      },
                    }}
                  >
                    <Box sx={{ position: "relative", paddingTop: "56.25%" }}>
                      <CardMedia
                        component="img"
                        image={episode.thumbnailUrl || media.posterUrl}
                        alt={episode.title}
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          opacity: 0.9,
                          transition: "opacity 0.3s ease",
                          "&:hover": {
                            opacity: 1,
                          },
                        }}
                      >
                        <PlayArrow
                          sx={{
                            fontSize: 48,
                            color: "#fff",
                            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
                          }}
                        />
                      </Box>
                    </Box>
                    <CardContent sx={{ p: 2 }}>
                      <Stack spacing={0.5}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#ffd700",
                            fontWeight: 600,
                            fontSize: "0.75rem",
                          }}
                        >
                          S{episode.seasonNumber} E{episode.episodeNumber}
                        </Typography>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            color: "#fff",
                            fontWeight: 600,
                            fontSize: "0.95rem",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
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
                            lineHeight: 1.4,
                            fontSize: "0.75rem",
                            minHeight: "2.1em",
                          }}
                        >
                          {episode.description}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "rgba(255, 255, 255, 0.5)",
                            fontSize: "0.7rem",
                          }}
                        >
                          {episode.duration} min
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          )}

          {/* Blurred episodes for non-premium */}
          {media.type === "series" && !isPremium && (
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
                  startIcon={!isAuthenticated ? <Login /> : <Stars />}
                  onClick={handleActionClick}
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
                  {!isAuthenticated
                    ? "Login to View Episodes"
                    : "Upgrade to View Episodes"}
                </Button>
              </Box>
            </Box>
          )}
        </Container>
      </Box>

      <AuthModal open={authModalOpen} onClose={handleCloseAuthModal} />
    </>
  );
}

export default WatchPage;
