// Cloudflare Workers entry point. The Node server entry (Render, local
// `npm run dev`) is server.js; both share the same Express app from app.js.
//
// Express runs on Workers through Cloudflare's Node.js HTTP compatibility:
// app.listen() registers the app with the runtime instead of opening a port,
// and httpServerHandler() turns incoming Worker requests into Node requests.
import { httpServerHandler } from "cloudflare:node";

import { createApp } from "./app.js";
import { runWithRequestDb } from "./config/db.js";
import { seedAdmin } from "./shared/utils/seedAdmin.js";

const PORT = 3000; // internal only, never exposed

createApp().listen(PORT);
const expressHandler = httpServerHandler({ port: PORT });

// On Render the admin account is seeded once at startup. Workers have no
// startup step, so check once per Worker instance, on the first login attempt.
let adminSeedChecked = false;

export default {
  async fetch(request, env, ctx) {
    return runWithRequestDb(env.MONGO_URI, async () => {
      if (!adminSeedChecked && new URL(request.url).pathname === "/api/private/auth/login") {
        try {
          await seedAdmin();
          adminSeedChecked = true;
        } catch (err) {
          // Don't block the request; the login itself will report a DB problem.
          console.error("Admin seed check failed:", err.message);
        }
      }
      return expressHandler.fetch(request, env, ctx);
    });
  },
};
