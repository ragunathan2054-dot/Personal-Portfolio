import mongoose from "mongoose";
import { defineModel } from "../../config/db.js";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    twoFactorSecret: { type: String, default: null },
    twoFactorEnabled: { type: Boolean, default: false },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

export default defineModel("User", userSchema);