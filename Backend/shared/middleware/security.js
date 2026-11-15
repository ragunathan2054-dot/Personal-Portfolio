import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { LazyMemoryStore } from "./rateLimitStore.js";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";

// Helmet sets ~11 protective headers in one line: stops clickjacking
// (X-Frame-Options), MIME-sniffing (X-Content-Type-Options), and restricts
// where scripts/styles can load from (Content-Security-Policy).
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "https://res.cloudinary.com", "data:"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
    },
  },
});

// Rate limits are keyed by client IP. On Cloudflare the real client IP is in
// CF-Connecting-IP; on Render/Node req.ip is used, as before.
// Note: the counters are kept in memory, so on Workers each instance counts
// separately — treat these limits as best-effort. The database-backed account
// lockout (5 failed logins -> 15 min lock) is the main brute-force defence.
export function clientIpKey(req) {
  return req.headers["cf-connecting-ip"] || req.ip || "unknown";
}

// Applies to every request on the server.
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: clientIpKey,
  store: new LazyMemoryStore(),
  validate: false,
  message: { error: "Too many requests. Please try again later." },
});


export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: clientIpKey,
  store: new LazyMemoryStore(),
  validate: false,
  message: { error: "Too many login attempts. Try again in 15 minutes." },
});

export const sanitizeMiddleware = mongoSanitize();

export const hppMiddleware = hpp();