import { validationResult } from "express-validator";

export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const first = errors.array()[0];
    const specific = first?.msg && first.msg !== "Invalid value" ? first.msg : null;
    return res.status(400).json({ error: specific || "Invalid input.", details: errors.array() });
  }
  next();
}