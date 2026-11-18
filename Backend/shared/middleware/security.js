import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { LazyMemoryStore } from "./rateLimitStore.js";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
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