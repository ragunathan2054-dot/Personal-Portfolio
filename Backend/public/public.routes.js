import express from "express";
import { body } from "express-validator";
import rateLimit from "express-rate-limit";
import { getPublicContent, submitContactMessage } from "./public.controller.js";
import { validate } from "../shared/middleware/validate.js";

const router = express.Router();

router.get("/content", getPublicContent);

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many messages sent. Please try again later." },
});

router.post(
  "/contact",
  contactLimiter,
  body("name").trim().isLength({ min: 1, max: 100 }),
  body("email").isEmail().normalizeEmail(),
  body("message").trim().isLength({ min: 1, max: 2000 }),
  validate,
  submitContactMessage
);

export default router;