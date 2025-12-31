const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// OTP Schema
const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
      index: { expires: 0 }, // TTL index - MongoDB will auto-delete expired documents
    },
    verified: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 0,
      max: 5, // Max 5 attempts
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
otpSchema.index({ email: 1, createdAt: -1 });

otpSchema.pre("save", async function () {
  // Skip hashing if otp not modified
  if (!this.isModified("otp")) return;

  const salt = await bcrypt.genSalt(10);
  this.otp = await bcrypt.hash(this.otp, salt);
});

// Method to compare OTP
otpSchema.methods.compareOTP = async function (candidateOTP) {
  return await bcrypt.compare(candidateOTP, this.otp);
};

// Static method to clean up old OTPs for an email
otpSchema.statics.cleanupOldOTPs = async function (email) {
  await this.deleteMany({
    email,
    $or: [{ verified: true }, { expiresAt: { $lt: new Date() } }],
  });
};

const OTP = mongoose.model("OTP", otpSchema);

module.exports = { OTP };
