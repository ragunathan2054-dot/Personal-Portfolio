import { validationResult } from "express-validator";

// Runs after express-validator's field checks. Stops the request here with
// a clean 400 if anything failed, instead of letting bad data reach the DB.
export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: "Invalid input.", details: errors.array() });
  }
  next();
}