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
  body("hero.headline").optional().isString().trim().isLength({ max: 200 }),
  body("hero.description").optional().isString().trim().isLength({ max: 500 }),
  body("skills").optional().isArray({ max: 60 }),
  body("projects").optional().isArray({ max: 30 }),
  body("certificates").optional().isArray({ max: 30 }),
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