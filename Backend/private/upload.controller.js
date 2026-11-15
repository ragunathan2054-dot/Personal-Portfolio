import { uploadBuffer } from "../config/cloudinary.js";

export async function uploadImage(req, res, next) {
  if (!req.file) return res.status(400).json({ error: "No file provided." });

  try {
    const isPdf = req.file.mimetype === "application/pdf";

    const options = {
      folder: "portfolio",
      resource_type: isPdf ? "raw" : "image",
      mimetype: req.file.mimetype,
      filename: req.file.originalname,
    };

    if (isPdf) {
      const baseName =
        req.file.originalname
          .replace(/\.[^.]+$/, "")
          .replace(/[^a-zA-Z0-9_-]/g, "_")
          .slice(0, 60) || "document";

      options.public_id = `${baseName}_${Date.now()}.pdf`;
    }

    const result = await uploadBuffer(req.file.buffer, options);
    res.json({ url: result.secure_url });
  } catch (err) {
    console.error("Cloudinary upload error:", err.message);
    next(err);
  }
}
