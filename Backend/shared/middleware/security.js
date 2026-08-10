import helmet from "helmet";
import rateLimit from "express-rate-limit";
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

// Applies to every request on the server.
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});

// Much stricter — only login/auth routes use this. This is the main defense
// against someone guessing your password by brute force.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Try again in 15 minutes." },
});

// Strips $ and . from request data — blocks NoSQL injection like
// { "email": { "$gt": "" } } from bypassing a login query.
export const sanitizeMiddleware = mongoSanitize();

// Blocks HTTP Parameter Pollution, e.g. ?role=user&role=admin.
export const hppMiddleware = hpp();