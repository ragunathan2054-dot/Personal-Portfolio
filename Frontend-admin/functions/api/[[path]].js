// Cloudflare Pages Function: forwards every /api/* request from the admin site
// to the backend Worker.
//
// Why: the browser then only ever talks to the admin site's own domain, so the
// login cookie and CSRF cookie are first-party and work even when the admin
// site and the API are on different domains (e.g. *.pages.dev and *.workers.dev).
//
// Configure in the admin Pages project → Settings → Variables and Secrets:
//   API_ORIGIN = https://<your-worker>.workers.dev   (no trailing slash)
// and set VITE_API_URL = /api/private
export async function onRequest({ request, env }) {
  if (!env.API_ORIGIN) {
    return Response.json({ error: "API_ORIGIN is not set on the admin Pages project." }, { status: 500 });
  }

  const incoming = new URL(request.url);
  const target = new URL(incoming.pathname + incoming.search, env.API_ORIGIN);

  const headers = new Headers(request.headers);
  headers.delete("host");

  return fetch(target, {
    method: request.method,
    headers,
    body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
    redirect: "manual",
  });
}
