
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
