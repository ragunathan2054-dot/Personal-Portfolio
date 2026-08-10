import bcrypt from "bcrypt";
import User from "../models/User.js";

// Creates the one admin account from .env on first boot.
// There is deliberately NO public "/register" route anywhere in this app —
// a portfolio has exactly one owner, so an open signup endpoint is just an
// extra door for attackers with no legitimate use to you.
export async function seedAdmin() {
  const existing = await User.findOne({ email: process.env.ADMIN_EMAIL });
  if (existing) return;

  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
  await User.create({ email: process.env.ADMIN_EMAIL, passwordHash });
  console.log("Admin account seeded from .env");
}