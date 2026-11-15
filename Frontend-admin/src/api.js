const API_URL = import.meta.env.VITE_API_URL;

function getCookie(name) {
  return document.cookie.split("; ").find((r) => r.startsWith(name + "="))?.split("=")[1];
}

export async function apiFetch(path, options = {}) {
  if (!API_URL) {
    throw new Error("VITE_API_URL is not set. Add it in your hosting settings, then redeploy the admin site.");
  }

  const isMutating = options.method && options.method !== "GET";

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(isMutating ? { "X-CSRF-Token": getCookie("XSRF-TOKEN") } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error("Cannot reach the server. Check the backend address and that the backend allows this site (CORS).");
  }

  const text = await res.text();
  let data = null;
  if (text) {
    try { data = JSON.parse(text); } catch { data = null; }
  }

  const isAuthAttempt = path === "/auth/login" || path === "/auth/verify-2fa";
  if (res.status === 401 && !isAuthAttempt) {
    throw new Error("__unauthenticated__");
  }

  if (!res.ok) {
    throw new Error(data?.error || `Server returned status ${res.status}`);
  }
  if (data === null) {
    throw new Error(`The server replied with an empty or non-JSON response (status ${res.status}). Check that VITE_API_URL points at your API.`);
  }
  return data;
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