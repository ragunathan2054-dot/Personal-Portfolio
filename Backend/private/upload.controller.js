import { uploadBuffer } from "../config/cloudinary.js";

export const ALLOWED_UPLOAD_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

// Cloudinary options for an uploaded file. Shared by the Express route (Node /
// Render) and the native Workers upload handler (private/upload.worker.js).
export function uploadOptionsFor(mimetype, originalname = "") {
  const isPdf = mimetype === "application/pdf";
  const options = {
    folder: "portfolio",
    resource_type: isPdf ? "raw" : "image",
    mimetype,
    filename: originalname,
  };

  if (isPdf) {
    const baseName =
      originalname
        .replace(/\.[^.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .slice(0, 60) || "document";

    options.public_id = `${baseName}_${Date.now()}.pdf`;
  }
  return options;
}

export async function uploadImage(req, res) {
  if (!req.file) return res.status(400).json({ error: "No file provided." });

  try {
    const result = await uploadBuffer(req.file.buffer, uploadOptionsFor(req.file.mimetype, req.file.originalname));
    res.json({ url: result.secure_url });
  } catch (err) {
    console.error("Cloudinary upload error:", err.message);
    // Admin-only route: show the real reason (e.g. "Cloudinary is not
    // configured", "Invalid Signature") instead of a generic error. These
    // messages never contain the API secret.
    res.status(502).json({ error: `Upload failed: ${err.message}` });
  }
}
