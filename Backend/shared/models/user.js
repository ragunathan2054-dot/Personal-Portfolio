import mongoose from "mongoose";

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

// Account-level lockout, separate from IP rate limiting.
// Rate limiting blocks an IP; this blocks the ACCOUNT even if the attacker
// switches IPs — the two protections cover different angles of brute force.
userSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

export default mongoose.model("User", userSchema);