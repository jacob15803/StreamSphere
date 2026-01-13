const Razorpay = require("razorpay");
const CryptoJS = require("crypto-js");
const { User } = require("../models/User");
const { Subscription } = require("../models/Subscription");
const { protect } = require("../middleware/authMiddleware");

// Subscription plans
const PLANS = {
  monthly: {
    name: "Monthly Premium",
    amount: 199, // in rupees
    duration: 30, // in days
  },
  quarterly: {
    name: "Quarterly Premium",
    amount: 499,
    duration: 90,
  },
  yearly: {
    name: "Yearly Premium",
    amount: 1499,
    duration: 365,
  },
};

module.exports = (app) => {
  // Get all subscription plans
  app.get("/api/subscription/plans", (req, res) => {
    res.json({
      success: true,
      plans: Object.keys(PLANS).map((key) => ({
        id: key,
        ...PLANS[key],
      })),
    });
  });

  // Get user's current subscription
  app.get("/api/subscription/status", protect, async (req, res) => {
    try {
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const isPremium = user.hasValidSubscription();

      res.json({
        success: true,
        subscription: {
          plan: user.subscription.plan,
          status: user.subscription.status,
          startDate: user.subscription.startDate,
          endDate: user.subscription.endDate,
          isPremium,
          daysRemaining:
            isPremium && user.subscription.endDate
              ? Math.ceil(
                  (user.subscription.endDate - new Date()) /
                    (1000 * 60 * 60 * 24)
                )
              : 0,
        },
      });
    } catch (error) {
      console.error("Get subscription status error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch subscription status",
      });
    }
  });

  // Create subscription order
  app.post("/api/subscription/create-order", protect, async (req, res) => {
    try {
      const { planId } = req.body;

      if (!planId || !PLANS[planId]) {
        return res.status(400).json({
          success: false,
          message: "Invalid plan selected",
        });
      }

      const plan = PLANS[planId];

      // Create Razorpay instance
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      const options = {
        amount: plan.amount * 100, // Convert to paise
        currency: "INR",
        receipt: `sub_${Date.now()}`,
      };

      razorpay.orders.create(options, async (err, order) => {
        if (err) {
          console.error("Razorpay order creation error:", err);
          return res.status(500).json({
            success: false,
            message: "Failed to create order",
          });
        }

        // Calculate dates
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + plan.duration);

        // Create subscription record
        const subscription = await Subscription.create({
          userId: req.user._id,
          plan: "premium",
          amount: plan.amount,
          duration: plan.duration,
          startDate,
          endDate,
          orderId: order.id,
          status: "pending",
        });

        res.json({
          success: true,
          message: "Order created successfully",
          orderId: order.id,
          amount: plan.amount,
          currency: "INR",
          planName: plan.name,
        });
      });
    } catch (error) {
      console.error("Create subscription order error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create subscription order",
      });
    }
  });

  // Verify subscription payment
  app.post("/api/subscription/verify-payment", protect, async (req, res) => {
    try {
      const { paymentId, orderId, signature } = req.body;

      if (!paymentId || !orderId || !signature) {
        return res.status(400).json({
          success: false,
          message: "Missing payment details",
        });
      }

      // Find subscription
      const subscription = await Subscription.findOne({ orderId });

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: "Subscription not found",
        });
      }

      if (subscription.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized",
        });
      }

      // Verify signature
      const generatedSignature = CryptoJS.HmacSHA256(
        `${orderId}|${paymentId}`,
        process.env.RAZORPAY_KEY_SECRET
      ).toString();

      if (generatedSignature !== signature) {
        subscription.status = "failed";
        await subscription.save();

        return res.status(400).json({
          success: false,
          message: "Payment verification failed",
        });
      }

      // Update subscription
      subscription.paymentId = paymentId;
      subscription.signature = signature;
      subscription.status = "active";
      await subscription.save();

      // Update user
      const user = await User.findById(req.user._id);
      await user.activatePremium(subscription.duration);

      res.json({
        success: true,
        message: "Subscription activated successfully",
        subscription: {
          plan: user.subscription.plan,
          status: user.subscription.status,
          endDate: user.subscription.endDate,
        },
      });
    } catch (error) {
      console.error("Verify subscription payment error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to verify payment",
      });
    }
  });

  // Cancel subscription
  app.post("/api/subscription/cancel", protect, async (req, res) => {
    try {
      const user = await User.findById(req.user._id);

      if (!user.hasValidSubscription()) {
        return res.status(400).json({
          success: false,
          message: "No active subscription to cancel",
        });
      }

      await user.cancelSubscription();

      // Update subscription records
      await Subscription.updateMany(
        { userId: user._id, status: "active" },
        { status: "cancelled" }
      );

      res.json({
        success: true,
        message: "Subscription cancelled successfully",
      });
    } catch (error) {
      console.error("Cancel subscription error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to cancel subscription",
      });
    }
  });

  // Get subscription history
  app.get("/api/subscription/history", protect, async (req, res) => {
    try {
      const subscriptions = await Subscription.find({
        userId: req.user._id,
      }).sort({ createdAt: -1 });

      res.json({
        success: true,
        subscriptions,
      });
    } catch (error) {
      console.error("Get subscription history error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch subscription history",
      });
    }
  });
};
