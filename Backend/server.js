// This MUST be the first line in the entire file. Side-effect imports run in
// the order they're written, so putting this first guarantees process.env is
// populated from .env BEFORE any other file (like cloudinary.js) tries to read it.
import "dotenv/config";

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { connectDB } from "./config/db.js";
import { seedAdmin } from "./shared/utils/seedAdmin.js";
import {
  helmetMiddleware,
  generalLimiter,
  sanitizeMiddleware,
  hppMiddleware,
} from "./shared/middleware/security.js";
import { errorHandler } from "./shared/middleware/errorHandler.js";
import { issueCsrfToken } from "./private/middleware/csrf.js";

import publicRoutes from "./public/public.routes.js";
import privateRoutes from "./private/private.routes.js";

const app = express();

const allowedOrigins = [
  process.env.PUBLIC_ORIGIN,
  process.env.ADMIN_ORIGIN,
].filter(Boolean);
app.use(helmetMiddleware);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error("CORS policy: Origin not allowed"));
    },
    credentials: true,
  }),
);
app.options("*", cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
app.use(sanitizeMiddleware);
app.use(hppMiddleware);
app.use(generalLimiter);
app.use(issueCsrfToken);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

app.use("/api/public", publicRoutes);
app.use("/api/private", privateRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  await seedAdmin();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
