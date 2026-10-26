import cloudinary from "../config/cloudinary.js";

export async function uploadImage(req, res, next) {
  if (!req.file) return res.status(400).json({ error: "No file provided." });

  try {
    const isPdf = req.file.mimetype === "application/pdf";

    const options = {
      folder: "portfolio",
      resource_type: isPdf ? "raw" : "image",
    };

    if (isPdf) {
      const baseName =
        req.file.originalname
          .replace(/\.[^.]+$/, "")
          .replace(/[^a-zA-Z0-9_-]/g, "_")
          .slice(0, 60) || "document";

      options.public_id = `${baseName}_${Date.now()}.pdf`;
    }

    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        console.error("Cloudinary upload error:", error);
        return next(error);
      }
      res.json({ url: result.secure_url });
    });
    uploadStream.end(req.file.buffer);
  } catch (err) {
    console.error("Cloudinary configuration error:", err);
    next(err);
  }
}