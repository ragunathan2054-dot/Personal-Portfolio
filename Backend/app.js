import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import {
  helmetMiddleware, generalLimiter, sanitizeMiddleware, hppMiddleware,
} from "./shared/middleware/security.js";
import { errorHandler } from "./shared/middleware/errorHandler.js";
import { issueCsrfToken } from "./private/middleware/csrf.js";

import publicRoutes from "./public/public.routes.js";
import privateRoutes from "./private/private.routes.js";

// PUBLIC_ORIGIN / ADMIN_ORIGIN may each hold one origin or a comma-separated
// list. Trailing slashes are ignored so "https://site.com/" still matches.
function allowedOrigins() {
  return [process.env.PUBLIC_ORIGIN, process.env.ADMIN_ORIGIN]
    .filter(Boolean)
    .flatMap((v) => v.split(","))
    .map((o) => o.trim().replace(/\/+$/, ""))
    .filter(Boolean);
}

// Builds the Express app. Shared by the Node server (server.js, used on
// Render and for local `npm run dev`) and the Cloudflare Worker (worker.js).
export function createApp() {
  const app = express();

  app.use(helmetMiddleware);
  app.use(cors({
    // Read per request so the Worker always sees its configured variables.
    origin(origin, callback) {
      callback(null, Boolean(origin) && allowedOrigins().includes(origin));
    },
    credentials: true,
  }));
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

  return app;
}
