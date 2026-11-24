import express from "express";
import multer from "multer";
import { body } from "express-validator";

import {
  login, verifyTwoFactorLogin, logout,
  setupTwoFactor, confirmTwoFactor, disableTwoFactor,
  changePassword, changeEmail, me,
} from "./auth.controller.js";
import { getContentForEdit, updateContent, getMessages, deleteMessage } from "./content.controller.js";
import { uploadImage } from "./upload.controller.js";

import { requireAuth } from "./middleware/requireAuth.js";
import { verifyCsrfToken } from "./middleware/csrf.js";
import { validate } from "../shared/middleware/validate.js";
import { authLimiter } from "../shared/middleware/security.js";
import { asyncHandler as h } from "../shared/utils/asyncHandler.js";

const router = express.Router();

// Per-certificate checks (each item in the certificates list). Empty optional
// fields are fine; anything filled in must be valid.
const URL_RULES = { protocols: ["http", "https"], require_protocol: true };
const optionalText = (field, label, max) =>
  body(`certificates.*.${field}`).optional({ values: "null" }).isString().trim()
    .isLength({ max }).withMessage(`${label} is too long (max ${max} characters).`);
const optionalUrl = (field, label) =>
  body(`certificates.*.${field}`).optional({ values: "falsy" }).isString().trim()
    .isURL(URL_RULES).withMessage(`${label} must be a full link starting with https://`);

const certificateRules = [
  optionalText("name", "Title", 200),
  optionalText("issuer", "Issuer", 120),
  optionalText("credentialId", "Credential ID", 120),
  optionalText("issued", "Issued date", 40),
  optionalText("expiry", "Expires", 40),
  optionalText("kind", "Course type", 80),
  optionalText("issuerCode", "Issuer code", 8),
  optionalUrl("credentialUrl", "Verify URL"),
  optionalUrl("certificateUrl", "Certificate URL"),
  optionalUrl("logoUrl", "Logo URL"),
  body("certificates.*.skills").optional({ values: "null" })
    .isArray({ max: 8 }).withMessage("At most 8 skill tags."),
  body("certificates.*.skills.*").isString().trim()
    .isLength({ min: 1, max: 40 }).withMessage("Each skill tag must be 1–40 characters."),
  body("certificates.*.order").optional({ values: "null" })
    .isInt({ min: 0, max: 9999 }).withMessage("Order must be a whole number (0–9999).").toInt(),
  body("certificates.*.isVisible").optional({ values: "null" })
    .isBoolean().withMessage("Visible must be on or off.").toBoolean(),
];


router.post("/auth/login", authLimiter,
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }),
  validate, h(login)
);

router.post("/auth/verify-2fa", authLimiter,
  body("otp").isLength({ min: 6, max: 6 }).isNumeric(),
  validate, h(verifyTwoFactorLogin)
);

router.post("/auth/logout", requireAuth, logout);
router.get("/auth/me", requireAuth, me);

router.post("/auth/setup-2fa", requireAuth, verifyCsrfToken, h(setupTwoFactor));
router.post("/auth/confirm-2fa", requireAuth, verifyCsrfToken,
  body("otp").isLength({ min: 6, max: 6 }).isNumeric(),
  validate, h(confirmTwoFactor)
);
router.post("/auth/disable-2fa", requireAuth, verifyCsrfToken, h(disableTwoFactor));

router.put("/auth/password", requireAuth, verifyCsrfToken,
  body("currentPassword").notEmpty(),
  body("newPassword").isStrongPassword({
    minLength: 10, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1,
  }),
  validate, h(changePassword)
);


router.put("/auth/email", requireAuth, verifyCsrfToken,
  body("newEmail").isEmail().normalizeEmail(),
  body("currentPassword").notEmpty(),
  validate, h(changeEmail)
);


router.get("/content", requireAuth, h(getContentForEdit));

router.put("/content", requireAuth, verifyCsrfToken,
  body("hero.headline").optional().isString().trim().isLength({ max: 200 })
    .withMessage("Headline is too long (max 200 characters)."),
  body("hero.description").optional().isString().trim().isLength({ max: 500 })
    .withMessage("Hero description is too long (max 500 characters)."),
  body("skills").optional().isArray({ max: 150 }).withMessage("Too many skills (max 150)."),
  body("projects").optional().isArray({ max: 50 }).withMessage("Too many projects (max 50)."),
  body("certificates").optional().isArray({ max: 100 }).withMessage("Too many certificates (max 100)."),
  ...certificateRules,
  validate, h(updateContent)
);


router.get("/messages", requireAuth, h(getMessages));
router.delete("/messages/:id", requireAuth, verifyCsrfToken, h(deleteMessage));


const storage = multer.memoryStorage();
function fileFilter(req, file, cb) {
  const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  if (!allowed.includes(file.mimetype)) return cb(new Error("Only JPG, PNG, WEBP images or PDF files are allowed."));
  cb(null, true);
}
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// Turn multer errors (wrong type, too large) into a 400 with a readable message
// instead of a generic 500.
function uploadSingle(req, res, next) {
  upload.single("image")(req, res, (err) => {
    if (!err) return next();
    const message = err.code === "LIMIT_FILE_SIZE" ? "File is too large (max 5 MB)." : err.message;
    res.status(400).json({ error: message });
  });
}

router.post("/upload", requireAuth, verifyCsrfToken, uploadSingle, h(uploadImage));

export default router;