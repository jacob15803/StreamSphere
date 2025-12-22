const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  name: { type: String },
  otp: { type: String },
  email: { type: String },
  subscriptionType: { type: String }
});

mongoose.model("users", userSchema);