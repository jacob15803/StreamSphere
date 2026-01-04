const { User } = require("../models/User");
const { Media } = require("../models/Media");
const { protect } = require("../middleware/authMiddleware");

module.exports = (app) => {
  // ============================================
  // WATCHLIST ENDPOINTS
  // ============================================

  // @route   GET /api/watchlist
  // @desc    Get user's watchlist with full media details
  // @access  Private
  app.get("/api/watchlist", protect, async (req, res) => {
    try {
      const user = await User.findById(req.user._id).populate({
        path: "watchlist.mediaId",
        select:
          "name type description rating genres releaseDate posterUrl trailerUrl duration director cast country ageRating episodes",
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Filter out any null mediaId (in case media was deleted)
      const watchlist = user.watchlist
        .filter((item) => item.mediaId)
        .map((item) => {
          const mediaObj = item.mediaId.toObject();
          return {
            ...mediaObj,
            addedAt: item.addedAt,
          };
        });

      res.status(200).json({
        success: true,
        count: watchlist.length,
        watchlist,
      });
    } catch (error) {
      console.error("Get watchlist error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch watchlist",
      });
    }
  });

  // @route   POST /api/watchlist/:mediaId
  // @desc    Add media to watchlist
  // @access  Private
  app.post("/api/watchlist/:mediaId", protect, async (req, res) => {
    try {
      const { mediaId } = req.params;

      // Check if media exists
      const media = await Media.findById(mediaId);
      if (!media) {
        return res.status(404).json({
          success: false,
          message: "Media not found",
        });
      }

      // Check if already in watchlist
      const user = await User.findById(req.user._id);
      const alreadyExists = user.watchlist.some(
        (item) => item.mediaId.toString() === mediaId
      );

      if (alreadyExists) {
        return res.status(400).json({
          success: false,
          message: "Media already in watchlist",
        });
      }

      // Add to watchlist
      await user.addToWatchlist(mediaId);

      res.status(200).json({
        success: true,
        message: "Added to watchlist successfully",
        watchlistCount: user.watchlist.length + 1,
      });
    } catch (error) {
      console.error("Add to watchlist error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add to watchlist",
      });
    }
  });

  // @route   DELETE /api/watchlist/:mediaId
  // @desc    Remove media from watchlist
  // @access  Private
  app.delete("/api/watchlist/:mediaId", protect, async (req, res) => {
    try {
      const { mediaId } = req.params;

      const user = await User.findById(req.user._id);

      // Check if in watchlist
      const inWatchlist = user.watchlist.some(
        (item) => item.mediaId.toString() === mediaId
      );

      if (!inWatchlist) {
        return res.status(404).json({
          success: false,
          message: "Media not found in watchlist",
        });
      }

      // Remove from watchlist
      await user.removeFromWatchlist(mediaId);

      res.status(200).json({
        success: true,
        message: "Removed from watchlist successfully",
        watchlistCount: user.watchlist.length - 1,
      });
    } catch (error) {
      console.error("Remove from watchlist error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to remove from watchlist",
      });
    }
  });

  // @route   GET /api/watchlist/check/:mediaId
  // @desc    Check if media is in user's watchlist
  // @access  Private
  app.get("/api/watchlist/check/:mediaId", protect, async (req, res) => {
    try {
      const { mediaId } = req.params;

      const user = await User.findById(req.user._id);
      const inWatchlist = user.watchlist.some(
        (item) => item.mediaId.toString() === mediaId
      );

      res.status(200).json({
        success: true,
        inWatchlist,
      });
    } catch (error) {
      console.error("Check watchlist error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to check watchlist",
      });
    }
  });

  // ============================================
  // WATCH HISTORY ENDPOINTS
  // ============================================

  // @route   GET /api/watch-history
  // @desc    Get user's complete watch history
  // @access  Private
  app.get("/api/watch-history", protect, async (req, res) => {
    try {
      const { limit = 50, page = 1 } = req.query;

      const user = await User.findById(req.user._id).populate({
        path: "watchHistory.mediaId",
        select: "name type posterUrl rating genres duration episodes",
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Filter out any null mediaId and format response
      let watchHistory = user.watchHistory
        .filter((item) => item.mediaId)
        .sort((a, b) => b.lastWatchedAt - a.lastWatchedAt);

      // Pagination
      const total = watchHistory.length;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      watchHistory = watchHistory.slice(startIndex, endIndex);

      // Format the response with episode details if available
      const formattedHistory = watchHistory.map((item) => {
        const historyItem = {
          media: {
            _id: item.mediaId._id,
            name: item.mediaId.name,
            type: item.mediaId.type,
            posterUrl: item.mediaId.posterUrl,
            rating: item.mediaId.rating,
            genres: item.mediaId.genres,
          },
          progress: item.progress,
          completed: item.completed,
          lastWatchedAt: item.lastWatchedAt,
          watchedAt: item.watchedAt,
        };

        // For series, add episode information
        if (item.seasonNumber && item.episodeNumber) {
          historyItem.seasonNumber = item.seasonNumber;
          historyItem.episodeNumber = item.episodeNumber;

          // Try to find the specific episode details from embedded episodes
          if (item.mediaId.episodes && item.mediaId.episodes.length > 0) {
            const episode = item.mediaId.episodes.find(
              (ep) =>
                ep.seasonNumber === item.seasonNumber &&
                ep.episodeNumber === item.episodeNumber
            );

            if (episode) {
              historyItem.episodeTitle = episode.title;
              historyItem.episodeDuration = episode.duration;
            }
          }
        } else if (item.mediaId.type === "movie") {
          historyItem.duration = item.mediaId.duration;
        }

        return historyItem;
      });

      res.status(200).json({
        success: true,
        count: formattedHistory.length,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        watchHistory: formattedHistory,
      });
    } catch (error) {
      console.error("Get watch history error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch watch history",
      });
    }
  });

  // @route   POST /api/watch-history
  // @desc    Add/Update watch history entry
  // @access  Private
  app.post("/api/watch-history", protect, async (req, res) => {
    try {
      const { mediaId, seasonNumber, episodeNumber, progress, completed } =
        req.body;

      if (!mediaId) {
        return res.status(400).json({
          success: false,
          message: "Media ID is required",
        });
      }

      // Validate progress
      if (progress !== undefined && (progress < 0 || progress > 100)) {
        return res.status(400).json({
          success: false,
          message: "Progress must be between 0 and 100",
        });
      }

      // Check if media exists
      const media = await Media.findById(mediaId);
      if (!media) {
        return res.status(404).json({
          success: false,
          message: "Media not found",
        });
      }

      // For series, validate season and episode
      if (media.type === "series" && (seasonNumber || episodeNumber)) {
        if (!seasonNumber || !episodeNumber) {
          return res.status(400).json({
            success: false,
            message: "Both season and episode numbers are required for series",
          });
        }

        // Check if episode exists in media's episodes array
        const episodeExists = media.episodes.some(
          (ep) =>
            ep.seasonNumber === seasonNumber &&
            ep.episodeNumber === episodeNumber
        );

        if (!episodeExists) {
          return res.status(404).json({
            success: false,
            message: "Episode not found in this series",
          });
        }
      }

      const user = await User.findById(req.user._id);
      await user.addToWatchHistory(
        mediaId,
        seasonNumber || null,
        episodeNumber || null,
        progress || 0,
        completed || false
      );

      res.status(200).json({
        success: true,
        message: "Watch history updated successfully",
      });
    } catch (error) {
      console.error("Add watch history error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update watch history",
      });
    }
  });

  // @route   GET /api/continue-watching
  // @desc    Get continue watching list (incomplete items)
  // @access  Private
  app.get("/api/continue-watching", protect, async (req, res) => {
    try {
      const user = await User.findById(req.user._id).populate({
        path: "watchHistory.mediaId",
        select: "name type posterUrl rating genres episodes duration",
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Get continue watching items
      const continueWatching = user
        .getContinueWatching()
        .filter((item) => item.mediaId) // Filter out deleted media
        .map((item) => {
          const result = {
            media: {
              _id: item.mediaId._id,
              name: item.mediaId.name,
              type: item.mediaId.type,
              posterUrl: item.mediaId.posterUrl,
              rating: item.mediaId.rating,
              genres: item.mediaId.genres,
            },
            progress: item.progress,
            lastWatchedAt: item.lastWatchedAt,
          };

          // Add episode info for series
          if (item.seasonNumber && item.episodeNumber) {
            result.seasonNumber = item.seasonNumber;
            result.episodeNumber = item.episodeNumber;

            // Find episode details
            if (item.mediaId.episodes && item.mediaId.episodes.length > 0) {
              const episode = item.mediaId.episodes.find(
                (ep) =>
                  ep.seasonNumber === item.seasonNumber &&
                  ep.episodeNumber === item.episodeNumber
              );

              if (episode) {
                result.episodeTitle = episode.title;
                result.episodeDuration = episode.duration;
              }
            }
          } else if (item.mediaId.type === "movie") {
            result.duration = item.mediaId.duration;
          }

          return result;
        });

      res.status(200).json({
        success: true,
        count: continueWatching.length,
        continueWatching,
      });
    } catch (error) {
      console.error("Get continue watching error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch continue watching list",
      });
    }
  });

  // @route   DELETE /api/watch-history/:mediaId
  // @desc    Remove specific entry from watch history
  // @access  Private
  app.delete("/api/watch-history/:mediaId", protect, async (req, res) => {
    try {
      const { mediaId } = req.params;
      const { seasonNumber, episodeNumber } = req.query;

      const user = await User.findById(req.user._id);

      // Filter out the specific entry
      user.watchHistory = user.watchHistory.filter((item) => {
        const sameMedia = item.mediaId.toString() === mediaId;

        // For movies or if no season/episode specified, remove all entries for this media
        if (!seasonNumber && !episodeNumber) {
          return !sameMedia;
        }

        // For series, only remove the specific episode
        return !(
          sameMedia &&
          item.seasonNumber === parseInt(seasonNumber) &&
          item.episodeNumber === parseInt(episodeNumber)
        );
      });

      await user.save();

      res.status(200).json({
        success: true,
        message: "Removed from watch history successfully",
      });
    } catch (error) {
      console.error("Remove from watch history error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to remove from watch history",
      });
    }
  });
};
