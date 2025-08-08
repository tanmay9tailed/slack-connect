import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  isAuthorized: {
    type: Boolean,
  },
  slack: {
    workspace: String,
    refreshAccessToken: String,
    accessToken: String,
    userAccessToken: String,
    userRefreshToken: String,
    expiresAt: Number,
  },

});

userSchema.index({ "slack.expiresAt": 1 });

const User = mongoose.model("User", userSchema);
export default User;
