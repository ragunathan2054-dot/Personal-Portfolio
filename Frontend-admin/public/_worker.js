// Cloudflare Pages "advanced mode" worker for the admin site.
//
// Vite copies this file into dist/, and Cloudflare Pages runs it for every
// request (no matter how the project's root directory is configured).
//
//   /api/*      -> forwarded to the backend Worker (API_ORIGIN)
//   everything  -> the normal static admin site
//
// Why: the browser only ever talks to the admin site's own domain, so the login
// and CSRF cookies are first-party and work even when the admin site and the API
// are on different domains (e.g. *.pages.dev and *.workers.dev).
//
// Admin Pages project → Settings → Variables and Secrets:
//   API_ORIGIN   = https://<your-worker>.workers.dev   (no trailing slash)
//   VITE_API_URL = /api/private
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      if (!env.API_ORIGIN) {
        return Response.json({ error: "API_ORIGIN is not set on the admin Pages project." }, { status: 500 });
      }
      const target = new URL(url.pathname + url.search, env.API_ORIGIN);
      const headers = new Headers(request.headers);
      headers.delete("host");
      return fetch(target, {
        method: request.method,
        headers,
        body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
        redirect: "manual",
      });
    }

    return env.ASSETS.fetch(request);
  },
};
