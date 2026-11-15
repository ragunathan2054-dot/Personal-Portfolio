import crypto from "node:crypto";

// Uploads go straight to Cloudinary's signed Upload API using fetch, which
// works the same on Node and on Cloudflare Workers (the Cloudinary Node SDK
// depends on Node streams and http internals that Workers only partly support).
// Docs: https://cloudinary.com/documentation/upload_images#generating_authentication_signatures

function getConfig() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error(
      "Cloudinary is not configured — set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET."
    );
  }
  return { cloudName: CLOUDINARY_CLOUD_NAME, apiKey: CLOUDINARY_API_KEY, apiSecret: CLOUDINARY_API_SECRET };
}

// Cloudinary signature: SHA-1 of the sorted "key=value&..." params + API secret.
export function signParams(params, apiSecret) {
  const toSign = Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== "")
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return crypto.createHash("sha1").update(toSign + apiSecret).digest("hex");
}

// buffer: file contents; options: { folder, resource_type, public_id? }
// Resolves to Cloudinary's upload result (includes secure_url).
export async function uploadBuffer(buffer, { resource_type = "image", mimetype, filename, ...params }) {
  const { cloudName, apiKey, apiSecret } = getConfig();
  const signedParams = { ...params, timestamp: Math.floor(Date.now() / 1000) };

  const form = new FormData();
  for (const [k, v] of Object.entries(signedParams)) form.append(k, String(v));
  form.append("api_key", apiKey);
  form.append("signature", signParams(signedParams, apiSecret));
  form.append("file", new Blob([buffer], { type: mimetype }), filename || "upload");

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resource_type}/upload`, {
    method: "POST",
    body: form,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.secure_url) {
    throw new Error(`Cloudinary upload failed (${res.status}): ${data?.error?.message || "unknown error"}`);
  }
  return data;
}
