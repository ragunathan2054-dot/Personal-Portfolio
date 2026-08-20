import cloudinary from "../config/cloudinary.js";

export async function uploadImage(req, res, next) {
  if (!req.file) return res.status(400).json({ error: "No file provided." });

  try {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "portfolio",
        resource_type: "auto",
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