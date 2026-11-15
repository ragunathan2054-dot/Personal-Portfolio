// Shared cookie settings for the auth cookie and the CSRF cookie.
//
// COOKIE_DOMAIN lets the domain be configured per deployment. If it isn't set,
// production keeps the original value (.ragunathan-back.online) so the API,
// admin site and public site share cookies across subdomains. Set it to "none"
// (or empty) for a host-only cookie — needed when the admin site reaches the API
// through its own /api proxy (Frontend-admin/functions/api).
export function cookieDomain() {
  const configured = process.env.COOKIE_DOMAIN;
  if (configured !== undefined) {
    return configured === "" || configured.toLowerCase() === "none" ? undefined : configured;
  }
  return process.env.NODE_ENV === "production" ? ".ragunathan-back.online" : undefined;
}

export function baseCookieOptions() {
  return {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    domain: cookieDomain(),
    path: "/",
  };
}
