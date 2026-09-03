import cloudinary from "../config/cloudinary.js";

export async function uploadImage(req, res, next) {
  if (!req.file) return res.status(400).json({ error: "No file provided." });

  try {
    const isPdf = req.file.mimetype === "application/pdf";

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "portfolio",
        resource_type: isPdf ? "raw" : "image",
        // "attachment" flag tells Cloudinary to serve this file with headers
        // that force a real download, instead of trying to preview it inline —
        // this is what actually fixes the "failed to load PDF" error, since
        // the browser now downloads the file directly rather than attempting
        // to render it in its built-in PDF viewer.
        ...(isPdf ? { type: "upload", flags: "attachment" } : {}),
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return next(error);
        }
        res.json({ url: result.secure_url });
      }
    );
    uploadStream.end(req.file.buffer);
  } catch (err) {
    console.error("Cloudinary configuration error:", err);
    next(err);
  }
}