const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/public"
).replace(/\/$/, "");
export async function fetchContent() {
  const res = await fetch(`${API_URL}/content`, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error("Could not load portfolio content");
  return res.json();
}
export function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
export function safeUrl(url, fallback = "#") {
  const u = String(url || "").trim();
  return /^(https?:\/\/|mailto:|tel:|#|\/(?!\/))/i.test(u) ? u : fallback;
}
export function normalizeUrl(url) {
  let u = String(url || "").trim();
  if (!u || u === "#") return "";
  if (/^(https?:|mailto:|tel:)/i.test(u)) return u.replace(/\s+/g, "");
  if (/^[\w-]+(\.[\w-]+)+(\/|$)/.test(u)) return "https://" + u.replace(/\s+/g, "");
  return u;
}
export function limitedHtml(str) {
  return escapeHtml(str).replace(/&lt;(\/?)(em|strong|b|i|br)\s*(\/?)&gt;/gi, "<$1$2$3>");
}
