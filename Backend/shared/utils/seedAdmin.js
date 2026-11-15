import { hashPassword } from "./password.js";
import User from "../models/User.js";
export async function seedAdmin() {
  const userCount = await User.countDocuments();
  if (userCount > 0) return;

  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    console.warn("No users exist and ADMIN_EMAIL / ADMIN_PASSWORD are not set, so no admin was created.");
    return;
  }

  const passwordHash = await hashPassword(process.env.ADMIN_PASSWORD);
  await User.create({ email: process.env.ADMIN_EMAIL, passwordHash });
  console.log("Admin account seeded from .env");
}