import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import User from "../shared/models/User.js";
import { hashPassword, verifyPassword } from "../shared/utils/password.js";
import { baseCookieOptions } from "../shared/utils/cookies.js";

const PENDING_2FA_COOKIE = "twofa_pending";

function signToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set — add it to the backend's environment variables.");
  }
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    algorithm: "HS256",
  });
}

function setAuthCookie(res, token) {
  res.cookie("token", token, {
    ...baseCookieOptions(),
    httpOnly: true,
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

  const valid = await verifyPassword(password, user.passwordHash);
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
    // Proof that the password step passed, valid for 5 minutes. The 2FA step
    // only accepts this cookie, never a bare userId from the request body.
    const pending = jwt.sign({ id: user._id, purpose: "2fa" }, process.env.JWT_SECRET, {
      expiresIn: "5m",
      algorithm: "HS256",
    });
    res.cookie(PENDING_2FA_COOKIE, pending, {
      ...baseCookieOptions(),
      httpOnly: true,
      maxAge: 5 * 60 * 1000,
    });
    return res.json({ requiresTwoFactor: true, userId: user._id });
  }

  const token = signToken(user._id);
  setAuthCookie(res, token);
  res.json({ success: true, requiresTwoFactor: false });
}

export async function verifyTwoFactorLogin(req, res) {
  const { userId, otp } = req.body;
  const expired = { error: "Sign-in session expired. Enter your password again." };

  let pending;
  try {
    pending = jwt.verify(req.cookies[PENDING_2FA_COOKIE], process.env.JWT_SECRET, { algorithms: ["HS256"] });
  } catch {
    return res.status(401).json(expired);
  }
  if (pending.purpose !== "2fa" || (userId && String(userId) !== String(pending.id))) {
    return res.status(401).json(expired);
  }

  const user = await User.findById(pending.id); // full document, includes twoFactorSecret — correct
  if (!user || !user.twoFactorSecret) return res.status(401).json({ error: "Invalid session." });

  if (user.isLocked()) {
    return res.status(423).json({ error: "Account temporarily locked. Try again later." });
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token: otp,
    window: 1,
  });
  if (!verified) {
    // Wrong codes count toward the same lockout as wrong passwords, so the
    // 6-digit code can't be brute-forced.
    user.loginAttempts += 1;
    if (user.loginAttempts >= 5) user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
    return res.status(401).json({ error: "Invalid authentication code." });
  }

  user.loginAttempts = 0;
  user.lockUntil = null;
  await user.save();

  res.clearCookie(PENDING_2FA_COOKIE, { ...baseCookieOptions(), httpOnly: true });
  const token = signToken(user._id);
  setAuthCookie(res, token);
  res.json({ success: true });
}

export function logout(req, res) {
  // Must use the same domain/path the cookie was set with, or the browser
  // keeps it (previously the production cookie survived logout).
  res.clearCookie("token", { ...baseCookieOptions(), httpOnly: true });
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

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) return res.status(401).json({ error: "Current password is incorrect." });

  user.passwordHash = await hashPassword(newPassword);
  await user.save();
  res.json({ success: true });
}

// NEW — was missing entirely. Requires the current password as proof before
// changing something as sensitive as the login email.
export async function changeEmail(req, res) {
  const { newEmail, currentPassword } = req.body;
  const user = await User.findById(req.user._id);

  const valid = await verifyPassword(currentPassword, user.passwordHash);
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