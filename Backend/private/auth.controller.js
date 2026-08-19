import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import User from "../shared/models/User.js";

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

function setAuthCookie(res, token) {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    domain: process.env.NODE_ENV === "production"
      ? ".ragunathan-back.online"
      : undefined,
    path: "/",
    maxAge: 2 * 60 * 60 * 1000,
  });
}
export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });

  const genericError = { error: "Invalid email or password." };
  if (!user) return res.status(401).json(genericError);

  if (user.isLocked()) {
    return res.status(423).json({ error: "Account temporarily locked. Try again later." });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    user.loginAttempts += 1;
    if (user.loginAttempts >= 5) user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
    return res.status(401).json(genericError);
  }

  user.loginAttempts = 0;
  user.lockUntil = null;
  await user.save();

  if (user.twoFactorEnabled) {
    return res.json({ requiresTwoFactor: true, userId: user._id });
  }

  const token = signToken(user._id);
  setAuthCookie(res, token);
  res.json({ success: true, requiresTwoFactor: false });
}

export async function verifyTwoFactorLogin(req, res) {
  const { userId, otp } = req.body;
  const user = await User.findById(userId); // full document, includes twoFactorSecret — correct
  if (!user || !user.twoFactorSecret) return res.status(401).json({ error: "Invalid session." });

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token: otp,
    window: 1,
  });
  if (!verified) return res.status(401).json({ error: "Invalid authentication code." });

  const token = signToken(user._id);
  setAuthCookie(res, token);
  res.json({ success: true });
}

export function logout(req, res) {
  res.clearCookie("token");
  res.json({ success: true });
}

// THE FIX: re-fetch the full user document instead of using req.user, because
// requireAuth deliberately strips twoFactorSecret off req.user for security.
// Without this re-fetch, every 2FA operation was reading/writing "undefined".
export async function setupTwoFactor(req, res) {
  const user = await User.findById(req.user._id);
  const secret = speakeasy.generateSecret({ name: `Portfolio (${user.email})` });
  user.twoFactorSecret = secret.base32;
  await user.save();

  const qrDataUrl = await QRCode.toDataURL(secret.otpauth_url);
  res.json({ qrDataUrl, manualKey: secret.base32 });
}

export async function confirmTwoFactor(req, res) {
  const { otp } = req.body;
  const user = await User.findById(req.user._id); // re-fetch — this is the actual fix
  if (!user.twoFactorSecret) {
    return res.status(400).json({ error: "Start 2FA setup again before confirming." });
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token: otp,
    window: 1,
  });
  if (!verified) return res.status(400).json({ error: "Incorrect code. Try again." });

  user.twoFactorEnabled = true;
  await user.save();
  res.json({ success: true });
}

export async function disableTwoFactor(req, res) {
  const user = await User.findById(req.user._id);
  user.twoFactorEnabled = false;
  user.twoFactorSecret = null;
  await user.save();
  res.json({ success: true });
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) return res.status(401).json({ error: "Current password is incorrect." });

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();
  res.json({ success: true });
}

// NEW — was missing entirely. Requires the current password as proof before
// changing something as sensitive as the login email.
export async function changeEmail(req, res) {
  const { newEmail, currentPassword } = req.body;
  const user = await User.findById(req.user._id);

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) return res.status(401).json({ error: "Current password is incorrect." });

  const existing = await User.findOne({ email: newEmail.toLowerCase() });
  if (existing && String(existing._id) !== String(user._id)) {
    return res.status(400).json({ error: "That email is already in use." });
  }

  user.email = newEmail.toLowerCase();
  await user.save();
  res.json({ success: true, email: user.email });
}

export function me(req, res) {
  res.json({ user: req.user });
}