import { showToast } from "../toast.js";
import { escapeHtml, safeUrl, normalizeUrl } from "../api.js";

const API_URL = import.meta.env.VITE_API_URL;

// "Open LinkedIn ↗" style button that opens the profile in a new tab, or plain
// text if the value isn't a usable link.
function profileButton(value, label) {
  const url = safeUrl(normalizeUrl(value), "");
  if (!url) return escapeHtml(value);
  return `<a class="contact-btn" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(label)} (opens in a new tab)">${escapeHtml(label)} <span aria-hidden="true">↗</span></a>`;
}

export function renderContact(contact) {
  const list = document.getElementById("contactList");
  const email = String(contact.email || "").trim();
  list.innerHTML = `
    <li><span>Email</span><span><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a> <span class="copy-btn" id="copyEmail">Copy</span></span></li>
    <li><span>Location</span><span>${escapeHtml(contact.location)}</span></li>
    <li><span>LinkedIn</span><span>${profileButton(contact.linkedin, "Open LinkedIn")}</span></li>
    <li><span>GitHub</span><span>${profileButton(contact.github, "Open GitHub")}</span></li>
    <li><span>Availability</span><span>${escapeHtml(contact.availability)}</span></li>`;

  document.getElementById("copyEmail").addEventListener("click", () => {
    navigator.clipboard.writeText(contact.email);
    showToast("Email copied");
  });

  const form = document.getElementById("contactForm");
  form.style.display = contact.showForm ? "block" : "none";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("cf-name").value;
    const email = document.getElementById("cf-email").value;
    const message = document.getElementById("cf-message").value;

    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error(`Server returned ${res.status} — check that the backend is running and /contact route exists`);
      }

      if (!res.ok) throw new Error(data.error || `Server error (${res.status})`);

      showToast("Message sent — thank you!");
      form.reset();
    } catch (err) {
      console.error("Contact form error:", err);
      showToast(err.message || "Something went wrong. Please try again.", "error");
    }
  });
}