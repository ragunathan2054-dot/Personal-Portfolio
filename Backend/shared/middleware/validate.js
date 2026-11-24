import { validationResult } from "express-validator";

export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const first = errors.array()[0];
    let specific = first?.msg && first.msg !== "Invalid value" ? first.msg : null;
    // Say which list item is wrong, e.g. "Certificate #5: Verify URL must be …"
    // (#5 = the number shown in the admin list).
    const item = specific && String(first.path || "").match(/^(certificates|projects|skills)\[(\d+)\]\./);
    if (item) {
      const noun = { certificates: "Certificate", projects: "Project", skills: "Skill" }[item[1]];
      specific = `${noun} #${Number(item[2]) + 1}: ${specific}`;
    }
    return res.status(400).json({ error: specific || "Invalid input.", details: errors.array() });
  }
  next();
}