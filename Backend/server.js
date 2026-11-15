// Node.js entry point — used by Render and by `npm run dev` locally.
// The Cloudflare Workers entry point is worker.js; both share app.js.
import "dotenv/config";

import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";
import { seedAdmin } from "./shared/utils/seedAdmin.js";

const app = createApp();
const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  await seedAdmin();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
