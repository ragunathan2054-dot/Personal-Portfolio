const API_URL = import.meta.env.VITE_API_URL;

function getCookie(name) {
  return document.cookie.split("; ").find((r) => r.startsWith(name + "="))?.split("=")[1];
}

export async function apiFetch(path, options = {}) {
  const isMutating = options.method && options.method !== "GET";
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(isMutating ? { "X-CSRF-Token": getCookie("XSRF-TOKEN") } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    throw new Error("__unauthenticated__");
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export function escapeHtml(str = "") {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}