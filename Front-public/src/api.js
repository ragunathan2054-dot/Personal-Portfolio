const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/public"
).replace(/\/$/, "");

// The public site only ever does GETs — no login, no cookie, no CSRF token
// here, because nothing on this side changes data.
export async function fetchContent() {
  const res = await fetch(`${API_URL}/content`);
  if (!res.ok) throw new Error("Could not load portfolio content");
  return res.json();
}

// Escapes text before it's placed into innerHTML — the frontend half of XSS
// protection. Even if something unexpected slipped past backend validation,
// the browser prints it as plain visible text instead of running it as markup.
export function escapeHtml(str = "") {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
