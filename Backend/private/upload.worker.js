// Native upload handler for Cloudflare Workers: POST /api/private/upload
//
// Why not the Express route? On Workers, Express + multer parse the whole file
// in JavaScript and copy it again for Cloudinary, which uses a lot of CPU — the
// Free plan's limit (10 ms per request) cuts the request off and Cloudflare
// returns an HTML error page. Here the runtime's built-in (native) form parser
// reads the file and it is passed straight to Cloudinary.
//
// Same rules and messages as the Express route (private.routes.js):
// login required, CSRF token required, JPG/PNG/WEBP/PDF only, max 5 MB.
import jwt from "jsonwebtoken";
import User from "../shared/models/User.js";
import { uploadBuffer } from "../config/cloudinary.js";
import { ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_BYTES, uploadOptionsFor } from "./upload.controller.js";

function parseCookies(header = "") {
  const out = {};
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i < 1) continue;
    const key = part.slice(0, i).trim();
    try { out[key] = decodeURIComponent(part.slice(i + 1).trim()); } catch { out[key] = part.slice(i + 1).trim(); }
  }
  return out;
}

export async function handleUpload(request, allowedOrigins) {
  const origin = request.headers.get("Origin");
  const headers = { "Cache-Control": "no-store" };
  if (origin && allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Credentials"] = "true";
    headers["Vary"] = "Origin";
  }
  const reply = (status, body) => Response.json(body, { status, headers });

  // 1. Logged in? (same checks as middleware/requireAuth.js)
  const cookies = parseCookies(request.headers.get("Cookie") || "");
  if (!cookies.token) return reply(401, { error: "Not authenticated." });
  let decoded;
  try {
    decoded = jwt.verify(cookies.token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
  } catch {
    return reply(401, { error: "Session invalid or expired." });
  }
  if (decoded.purpose) return reply(401, { error: "Session invalid or expired." });
  const user = await User.findById(decoded.id).select("_id").lean();
  if (!user) return reply(401, { error: "Not authenticated." });

  // 2. CSRF token (same as middleware/csrf.js)
  const csrfCookie = cookies["XSRF-TOKEN"];
  if (!csrfCookie || csrfCookie !== request.headers.get("X-CSRF-Token")) {
    return reply(403, { error: "Invalid or missing CSRF token." });
  }

  // 3. The file
  const declared = Number(request.headers.get("Content-Length") || 0);
  if (declared > MAX_UPLOAD_BYTES + 64 * 1024) return reply(400, { error: "File is too large (max 5 MB)." });

  let form;
  try {
    form = await request.formData();
  } catch {
    return reply(400, { error: "No file provided." });
  }
  const file = form.get("image");
  if (!file || typeof file === "string") return reply(400, { error: "No file provided." });
  if (!ALLOWED_UPLOAD_TYPES.includes(file.type)) {
    return reply(400, { error: "Only JPG, PNG, WEBP images or PDF files are allowed." });
  }
  if (file.size > MAX_UPLOAD_BYTES) return reply(400, { error: "File is too large (max 5 MB)." });

  // 4. Send to Cloudinary
  try {
    const result = await uploadBuffer(file, uploadOptionsFor(file.type, file.name || ""));
    return reply(200, { url: result.secure_url });
  } catch (err) {
    console.error("Cloudinary upload error:", err.message);
    return reply(502, { error: `Upload failed: ${err.message}` });
  }
}
