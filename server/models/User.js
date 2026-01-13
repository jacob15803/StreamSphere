const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// User Schema
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    // Subscription fields
    subscription: {
      plan: {
        type: String,
        enum: ["free", "premium"],
        default: "free",
      },
      status: {
        type: String,
        enum: ["active", "expired", "cancelled"],
        default: "active",
      },
      startDate: {
        type: Date,
        default: null,
      },
      endDate: {
        type: Date,
        default: null,
      },
      autoRenew: {
        type: Boolean,
        default: false,
      },
    },
    preferences: {
      favoriteGenres: [
        {
          type: String,
          trim: true,
        },
      ],
      favoriteLanguages: [
        {
          type: String,
          trim: true,
        },
      ],
    },
    watchlist: [
      {
        mediaId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Media",
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    watchHistory: [
      {
        mediaId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Media",
          required: true,
        },
        seasonNumber: {
          type: Number,
          default: null,
        },
        episodeNumber: {
          type: Number,
          default: null,
        },
        progress: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
        completed: {
          type: Boolean,
          default: false,
        },
        lastWatchedAt: {
          type: Date,
          default: Date.now,
        },
        watchedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Indexes
userSchema.index({ "watchlist.mediaId": 1 });
userSchema.index({ "watchHistory.mediaId": 1 });
userSchema.index({ "subscription.plan": 1, "subscription.status": 1 });

// Virtual for watchlist count
userSchema.virtual("watchlistCount").get(function () {
  return this.watchlist.length;
});

// Virtual to check if user has active premium subscription
userSchema.virtual("isPremium").get(function () {
  return (
    this.subscription.plan === "premium" &&
    this.subscription.status === "active" &&
    (!this.subscription.endDate || this.subscription.endDate > new Date())
  );
});

// Method to check subscription validity
userSchema.methods.hasValidSubscription = function () {
  if (this.subscription.plan === "free") return false;

  if (this.subscription.status !== "active") return false;

  if (this.subscription.endDate && this.subscription.endDate < new Date()) {
    return false;
  }

  return true;
};

// Method to activate premium subscription
userSchema.methods.activatePremium = function (durationInDays = 30) {
  const now = new Date();
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + durationInDays);

  this.subscription.plan = "premium";
  this.subscription.status = "active";
  this.subscription.startDate = now;
  this.subscription.endDate = endDate;

  return this.save();
};

// Method to cancel subscription
userSchema.methods.cancelSubscription = function () {
  this.subscription.status = "cancelled";
  this.subscription.autoRenew = false;
  return this.save();
};

// Method to add to watchlist
userSchema.methods.addToWatchlist = function (mediaId) {
  const exists = this.watchlist.some(
    (item) => item.mediaId.toString() === mediaId.toString()
  );

  if (!exists) {
    this.watchlist.push({ mediaId });
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove from watchlist
userSchema.methods.removeFromWatchlist = function (mediaId) {
  this.watchlist = this.watchlist.filter(
    (item) => item.mediaId.toString() !== mediaId.toString()
  );
  return this.save();
};

// Method to add/update watch history
userSchema.methods.addToWatchHistory = function (
  mediaId,
  seasonNumber = null,
  episodeNumber = null,
  progress = 0,
  completed = false
) {
  const existingIndex = this.watchHistory.findIndex((item) => {
    const sameMedia = item.mediaId.toString() === mediaId.toString();

    if (!seasonNumber && !episodeNumber) {
      return sameMedia && !item.seasonNumber && !item.episodeNumber;
    }

    return (
      sameMedia &&
      item.seasonNumber === seasonNumber &&
      item.episodeNumber === episodeNumber
    );
  });

  if (existingIndex !== -1) {
    this.watchHistory[existingIndex].progress = progress;
    this.watchHistory[existingIndex].completed = completed;
    this.watchHistory[existingIndex].lastWatchedAt = Date.now();
  } else {
    this.watchHistory.push({
      mediaId,
      seasonNumber,
      episodeNumber,
      progress,
      completed,
      lastWatchedAt: Date.now(),
      watchedAt: Date.now(),
    });
  }

  return this.save();
};

// Method to get continue watching
userSchema.methods.getContinueWatching = function () {
  return this.watchHistory
    .filter((item) => !item.completed && item.progress > 0)
    .sort((a, b) => b.lastWatchedAt - a.lastWatchedAt)
    .slice(0, 10);
};

const User = mongoose.model("User", userSchema);

module.exports = { User };
