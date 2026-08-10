import cloudinary from "../config/cloudinary.js";

export async function uploadImage(req, res, next) {
  if (!req.file) return res.status(400).json({ error: "No file provided." });

  try {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "portfolio", resource_type: "image" },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return next(error); // routed through errorHandler.js, not crashing the server
        }
        res.json({ url: result.secure_url });
      }
    );
    uploadStream.end(req.file.buffer);
  } catch (err) {
    // Catches synchronous config errors (like missing api_key) that throw
    // BEFORE the callback above ever runs — this is what was crashing your
    // whole server. Now it becomes a normal, safe 500 response instead.
    console.error("Cloudinary configuration error:", err);
    next(err);
  }
}