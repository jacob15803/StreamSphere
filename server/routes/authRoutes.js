const { User } = require("../models/User");
const { OTP } = require("../models/OTP");
const { sendOTPEmail, sendWelcomeEmail } = require("../utils/emailService");
const { generateToken, protect } = require("../middleware/authMiddleware");

module.exports = (app) => {
  // Send OTP
  app.post("/api/auth/send-otp", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid email address",
        });
      }

      const existingUser = await User.findOne({ email: email.toLowerCase() });

      await OTP.cleanupOldOTPs(email.toLowerCase());

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

      const newOTP = new OTP({
        email: email.toLowerCase(),
        otp: otpCode,
      });

      await newOTP.save();

      const emailResult = await sendOTPEmail(email, otpCode, !existingUser);

      if (!emailResult.success) {
        return res.status(500).json({
          success: false,
          message: "Failed to send OTP. Please try again.",
        });
      }

      res.status(200).json({
        success: true,
        message: "OTP sent successfully to your email",
        isNewUser: !existingUser,
        email: email.toLowerCase(),
      });
    } catch (error) {
      console.error("Send OTP error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send OTP. Please try again later.",
      });
    }
  });

  // Verify OTP
  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          message: "Email and OTP are required",
        });
      }

      const otpRecord = await OTP.findOne({
        email: email.toLowerCase(),
        verified: false,
        expiresAt: { $gt: new Date() },
      }).sort({ createdAt: -1 });

      if (!otpRecord) {
        return res.status(400).json({
          success: false,
          message: "OTP expired or not found. Please request a new OTP.",
        });
      }

      if (otpRecord.attempts >= 5) {
        return res.status(400).json({
          success: false,
          message: "Too many incorrect attempts. Please request a new OTP.",
        });
      }

      const isMatch = await otpRecord.compareOTP(otp);

      if (!isMatch) {
        otpRecord.attempts += 1;
        await otpRecord.save();

        return res.status(400).json({
          success: false,
          message: `Invalid OTP. ${5 - otpRecord.attempts} attempts remaining.`,
        });
      }

      otpRecord.verified = true;
      await otpRecord.save();

      const existingUser = await User.findOne({ email: email.toLowerCase() });

      if (existingUser) {
        existingUser.lastLogin = Date.now();
        await existingUser.save();

        const token = generateToken(existingUser._id);
        const isPremium = existingUser.hasValidSubscription();

        return res.status(200).json({
          success: true,
          message: "Login successful",
          isNewUser: false,
          token,
          user: {
            id: existingUser._id,
            email: existingUser.email,
            name: existingUser.name,
            phone: existingUser.phone,
            profilePicture: existingUser.profilePicture,
            watchlistCount: existingUser.watchlistCount,
            subscription: {
              plan: existingUser.subscription.plan,
              status: existingUser.subscription.status,
              isPremium,
            },
          },
        });
      } else {
        return res.status(200).json({
          success: true,
          message: "OTP verified. Please complete your registration.",
          isNewUser: true,
          email: email.toLowerCase(),
        });
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to verify OTP. Please try again.",
      });
    }
  });

  // Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const {
        email,
        name,
        phone,
        dateOfBirth,
        profilePicture,
        favoriteGenres,
        favoriteLanguages,
      } = req.body;

      if (!email || !name) {
        return res.status(400).json({
          success: false,
          message: "Email and name are required",
        });
      }

      const verifiedOTP = await OTP.findOne({
        email: email.toLowerCase(),
        verified: true,
        expiresAt: { $gt: new Date() },
      }).sort({ createdAt: -1 });

      if (!verifiedOTP) {
        return res.status(400).json({
          success: false,
          message: "Please verify your email with OTP first",
        });
      }

      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists with this email",
        });
      }

      const newUser = new User({
        email: email.toLowerCase(),
        name,
        phone: phone || "",
        dateOfBirth: dateOfBirth || null,
        profilePicture: profilePicture || "",
        preferences: {
          favoriteGenres: favoriteGenres || [],
          favoriteLanguages: favoriteLanguages || [],
        },
      });

      await newUser.save();

      const token = generateToken(newUser._id);

      sendWelcomeEmail(newUser.email, newUser.name).catch((err) =>
        console.error("Failed to send welcome email:", err)
      );

      await OTP.deleteOne({ _id: verifiedOTP._id });

      res.status(201).json({
        success: true,
        message: "Registration successful",
        token,
        user: {
          id: newUser._id,
          email: newUser.email,
          name: newUser.name,
          phone: newUser.phone,
          profilePicture: newUser.profilePicture,
          preferences: newUser.preferences,
          watchlistCount: 0,
          subscription: {
            plan: newUser.subscription.plan,
            status: newUser.subscription.status,
            isPremium: false,
          },
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Registration failed. Please try again.",
      });
    }
  });

  // Get current user
  app.get("/api/auth/me", protect, async (req, res) => {
    try {
      const isPremium = req.user.hasValidSubscription();

      res.status(200).json({
        success: true,
        user: {
          id: req.user._id,
          email: req.user.email,
          name: req.user.name,
          phone: req.user.phone,
          dateOfBirth: req.user.dateOfBirth,
          profilePicture: req.user.profilePicture,
          preferences: req.user.preferences,
          watchlistCount: req.user.watchlistCount,
          lastLogin: req.user.lastLogin,
          createdAt: req.user.createdAt,
          subscription: {
            plan: req.user.subscription.plan,
            status: req.user.subscription.status,
            startDate: req.user.subscription.startDate,
            endDate: req.user.subscription.endDate,
            isPremium,
          },
        },
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch profile",
      });
    }
  });

  // Update profile
  app.put("/api/auth/profile", protect, async (req, res) => {
    try {
      const {
        name,
        phone,
        dateOfBirth,
        profilePicture,
        favoriteGenres,
        favoriteLanguages,
      } = req.body;

      const updateData = {};
      if (name) updateData.name = name;
      if (phone !== undefined) updateData.phone = phone;
      if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
      if (profilePicture !== undefined)
        updateData.profilePicture = profilePicture;

      if (favoriteGenres || favoriteLanguages) {
        updateData.preferences = {};
        if (favoriteGenres)
          updateData["preferences.favoriteGenres"] = favoriteGenres;
        if (favoriteLanguages)
          updateData["preferences.favoriteLanguages"] = favoriteLanguages;
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      const isPremium = updatedUser.hasValidSubscription();

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: {
          id: updatedUser._id,
          email: updatedUser.email,
          name: updatedUser.name,
          phone: updatedUser.phone,
          dateOfBirth: updatedUser.dateOfBirth,
          profilePicture: updatedUser.profilePicture,
          preferences: updatedUser.preferences,
          watchlistCount: updatedUser.watchlistCount,
          subscription: {
            plan: updatedUser.subscription.plan,
            status: updatedUser.subscription.status,
            isPremium,
          },
        },
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update profile",
      });
    }
  });
};
