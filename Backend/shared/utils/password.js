// Password hashing. Uses bcryptjs — a pure-JavaScript bcrypt that runs on
// both Node and Cloudflare Workers (the native `bcrypt` package cannot load on
// Workers). Hashes are the same $2b$ format, so existing passwords keep working.
import bcrypt from "bcryptjs";

const COST = 12;

export function hashPassword(plain) {
  return bcrypt.hash(plain, COST);
}

export function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}
