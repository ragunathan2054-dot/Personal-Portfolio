import jwt from "jsonwebtoken";
import User from "../../shared/models/User.js";

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Not authenticated." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    if (decoded.purpose) return res.status(401).json({ error: "Session invalid or expired." });
    const user = await User.findById(decoded.id).select("-passwordHash -twoFactorSecret");
    if (!user) return res.status(401).json({ error: "Not authenticated." });

    req.user = user;
    next();
  } catch (err) {

    return res.status(401).json({ error: "Session invalid or expired." });
  }
}