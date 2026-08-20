const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/public"
).replace(/\/$/, "");
export async function fetchContent() {
  const res = await fetch(`${API_URL}/content`);
  if (!res.ok) throw new Error("Could not load portfolio content");
  return res.json();
}
export function escapeHtml(str = "") {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
