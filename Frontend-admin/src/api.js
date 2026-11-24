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

// Uploads one file (JPG/PNG/WEBP image or PDF, max 5 MB) to Cloudinary through
// the backend and returns its public URL. Errors come back as readable messages.
export const UPLOAD_MAX_BYTES = 5 * 1024 * 1024;
export async function uploadFile(file) {
  if (file.size > UPLOAD_MAX_BYTES) throw new Error("File is too large (max 5 MB).");
  const form = new FormData();
  form.append("image", file); // the backend's upload field is called "image" for every file type

  let res;
  try {
    res = await fetch(`${API_URL}/upload`, {
      method: "POST",
      credentials: "include",
      headers: { "X-CSRF-Token": getCookie("XSRF-TOKEN") },
      body: form,
    });
  } catch {
    throw new Error("Upload failed: cannot reach the server.");
  }
  const text = await res.text();
  let data = null;
  try { data = JSON.parse(text); } catch { /* not JSON, e.g. a Cloudflare error page */ }
  if (res.status === 401) throw new Error("Your session expired. Sign in again, then retry the upload.");
  if (!res.ok || !data?.url) {
    throw new Error(data?.error || `Upload failed (server returned status ${res.status}). Try again in a moment.`);
  }
  return data.url;
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