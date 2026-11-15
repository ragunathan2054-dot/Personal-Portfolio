# Deploying the API to Cloudflare Workers

The same Express app now runs in two places:

| Entry point | Used by | Command |
|---|---|---|
| `server.js` | Render (unchanged, kept as rollback) and local `npm run dev` | `npm start` |
| `worker.js` | Cloudflare Workers | `npm run deploy:worker` |

Both share `app.js`, the routes, controllers and models. The MongoDB Atlas database and Cloudinary account stay the same.

## What changed for Workers, and why

- **Express runs through Cloudflare's Node.js HTTP support** (`nodejs_compat` + `httpServerHandler`). No framework rewrite.
- **One database connection per request.** Workers can't share a socket between requests, so each request that touches the DB opens a connection lazily and closes it afterwards (`config/db.js`). Models created with `defineModel()` pick the right connection automatically. On Node nothing changed.
- **`bcrypt` → `bcryptjs`.** Native addons can't load on Workers. Same `$2b$` hash format, so existing passwords keep working.
- **Cloudinary uploads use the signed REST API via `fetch`** instead of the Node SDK. Same folder (`portfolio`), same returned `secure_url`.
- **Rate limiting** uses a timer-free in-memory store (Workers forbid timers at startup) and keys on `CF-Connecting-IP`. The counts are per Worker instance, so treat them as best effort. The DB account lockout (5 failures → 15 min) is the main brute-force protection.
- **Admin seeding** runs on the first login request per Worker instance instead of at startup. It still only creates an admin when the users collection is empty.
- **`wrangler.jsonc` aliases** `mongoose`, `qrcode` and `base32.js` to their Node builds. Without them the bundler picks broken browser builds.
- **`iconv-lite` override** (package.json) fixes a bundling crash in Express 4's body parser.
- Small fixes that apply to both runtimes: async route errors now reach the error handler instead of hanging the request, logout clears the cookie on the right domain, and upload type/size errors return 400 with a readable message.

## Free-plan limits to know about

Workers Free plan: 100,000 requests/day, **10 ms CPU per request**, 50 subrequests and 6 open connections per request ([limits](https://developers.cloudflare.com/workers/platform/limits/)). Measured locally:

| Operation | CPU |
|---|---|
| Open + query + close a MongoDB connection | ~9.6 ms |
| Express middleware stack | ~2–3 ms |
| bcrypt verify (cost 12, login / change password / change email) | **~280 ms** |

DB requests sit close to the 10 ms limit, and password checks are far over it. Check the real CPU time in the dashboard during staging (step 4) before switching traffic.

## Prerequisites

1. A Cloudflare account (free) and `npx wrangler login`. You do this step.
2. **MongoDB Atlas → Network Access must allow Cloudflare.** Workers don't have fixed outbound IPs, so the access list needs `0.0.0.0/0` (access is still protected by the username/password in `MONGO_URI`). If the list currently only allows Render's IPs, the Worker can't connect.
3. For the admin site to work, the API must be served from a subdomain of `ragunathan-back.online`, because the auth and CSRF cookies are scoped to that domain. A `*.workers.dev` URL is only good for read-only smoke tests. Workers custom domains require the domain's DNS to be managed by Cloudflare.

## 1. Set the secrets

Create `Backend/.prod.vars.json` (gitignored). Copy the values from the Render dashboard; don't invent new ones:

```json
{
  "MONGO_URI": "...",
  "JWT_SECRET": "...",
  "JWT_EXPIRES_IN": "...",
  "PUBLIC_ORIGIN": "https://<public site origin>",
  "ADMIN_ORIGIN": "https://<admin site origin>",
  "CLOUDINARY_CLOUD_NAME": "...",
  "CLOUDINARY_API_KEY": "...",
  "CLOUDINARY_API_SECRET": "..."
}
```

`ADMIN_EMAIL` and `ADMIN_PASSWORD` are only used when no user exists. Your database already has an admin, so leave them out.

Then, from `Backend/`:

```bash
npx wrangler secret bulk .prod.vars.json
```

Delete `.prod.vars.json` afterwards if you don't want the secrets on disk.

## 2. Check the build

```bash
npm run check:worker      # bundles without deploying (~706 KiB gzipped)
```

## 3. Deploy (staging on workers.dev)

```bash
npm run deploy:worker
```

Wrangler prints a `https://portfolio-api.<your-subdomain>.workers.dev` URL. Smoke test (read-only):

```bash
curl https://portfolio-api.<sub>.workers.dev/health
curl -H "Origin: <PUBLIC_ORIGIN>" https://portfolio-api.<sub>.workers.dev/api/public/content
```

## 4. Check CPU time

In the Cloudflare dashboard go to Workers & Pages → portfolio-api → Observability (or Metrics), and look at the CPU time of the requests above. Anything that hit the limit shows as an "exceeded resources" / Error 1102 outcome.

## 5. Custom domain and cutover

In `wrangler.jsonc`, uncomment `routes` and set the hostname, then `npm run deploy:worker` again.

- **If the frontends currently call Render through a hostname you control** (for example `api.ragunathan-back.online` CNAMEed to Render), point that hostname at the Worker. The frontends need no change, and rollback means pointing it back at Render.
- **Otherwise** use a new hostname such as `api.ragunathan-back.online`, then update in Cloudflare Pages (Settings → Environment variables) and redeploy each site:
  - Public site: `VITE_API_URL=https://<api host>/api/public`
  - Admin site: `VITE_API_URL=https://<api host>/api/private`

## Rollback

Render keeps working from the same code (`npm start`). Don't delete the Render service until the Worker has served real traffic without errors. To roll back, point the hostname or `VITE_API_URL` back at Render.

## Local development

```bash
npm run dev          # Node server, reads .env (as before)
npm run dev:worker   # Workers runtime locally (wrangler dev), also reads .env
```
