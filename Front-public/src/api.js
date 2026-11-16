const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/public"
).replace(/\/$/, "");
export async function fetchContent() {
  // Give up after 15s so the visitor sees a Retry option instead of waiting forever.
  const res = await fetch(`${API_URL}/content`, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error("Could not load portfolio content");
  return res.json();
}
// Escapes text for safe use inside HTML, including inside attribute values
// ("..." and '...'). null/undefined become "".
export function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Only allow link targets that can't run script: http(s), mailto, tel,
// in-page anchors and site-relative paths. Anything else (javascript:, data:, ...)
// becomes the fallback.
export function safeUrl(url, fallback = "#") {
  const u = String(url || "").trim();
  return /^(https?:\/\/|mailto:|tel:|#|\/(?!\/))/i.test(u) ? u : fallback;
}

// Adds https:// to links typed without it ("www.linkedin.com/in/x" ->
// "https://www.linkedin.com/in/x") and removes spaces (e.g. in wa.me numbers).
// Empty or "#" stays empty.
export function normalizeUrl(url) {
  let u = String(url || "").trim();
  if (!u || u === "#") return "";
  if (/^(https?:|mailto:|tel:)/i.test(u)) return u.replace(/\s+/g, "");
  if (/^[\w-]+(\.[\w-]+)+(\/|$)/.test(u)) return "https://" + u.replace(/\s+/g, "");
  return u;
}

// The hero headline allows a few formatting tags (e.g. <em>accent</em>).
// Everything is escaped, then only bare <em>, <strong>, <b>, <i>, <br> tags
// (no attributes) are turned back into HTML.
export function limitedHtml(str) {
  return escapeHtml(str).replace(/&lt;(\/?)(em|strong|b|i|br)\s*(\/?)&gt;/gi, "<$1$2$3>");
}
