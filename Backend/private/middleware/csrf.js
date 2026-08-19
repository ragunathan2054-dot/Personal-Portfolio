import crypto from "crypto";

export function issueCsrfToken(req, res, next) {
  const token = crypto.randomBytes(32).toString("hex");

  res.cookie("XSRF-TOKEN", token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
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