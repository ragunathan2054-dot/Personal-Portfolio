import crypto from "crypto";
import { baseCookieOptions } from "../../shared/utils/cookies.js";

export function issueCsrfToken(req, res, next) {
  const token = crypto.randomBytes(32).toString("hex");

  res.cookie("XSRF-TOKEN", token, {
    ...baseCookieOptions(),
    httpOnly: false, // the admin site reads it and echoes it back in X-CSRF-Token
  });

  next();
}

export function verifyCsrfToken(req, res, next) {
  const cookieToken = req.cookies["XSRF-TOKEN"];
  const headerToken = req.headers["x-csrf-token"];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({
      error: "Invalid or missing CSRF token.",
    });
  }

  next();
}