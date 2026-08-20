import bcrypt from "bcrypt";
import User from "../models/User.js";
export async function seedAdmin() {
  const existing = await User.findOne({ email: process.env.ADMIN_EMAIL });
  if (existing) return;

  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
  await User.create({ email: process.env.ADMIN_EMAIL, passwordHash });
  console.log("Admin account seeded from .env");
}