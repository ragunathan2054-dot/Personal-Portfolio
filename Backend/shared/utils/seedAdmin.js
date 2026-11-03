import bcrypt from "bcrypt";
import User from "../models/User.js";
export async function seedAdmin() {
  const userCount = await User.countDocuments();
  if (userCount > 0) return;

  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    console.warn("No users exist and ADMIN_EMAIL / ADMIN_PASSWORD are not set, so no admin was created.");
    return;
  }

  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
  await User.create({ email: process.env.ADMIN_EMAIL, passwordHash });
  console.log("Admin account seeded from .env");
}