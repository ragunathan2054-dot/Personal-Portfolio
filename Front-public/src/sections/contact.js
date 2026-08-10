import { showToast } from "../toast.js";

const API_URL = import.meta.env.VITE_API_URL;

export function renderContact(contact) {
  const list = document.getElementById("contactList");
  list.innerHTML = `
    <li><span>Email</span><span>${contact.email} <span class="copy-btn" id="copyEmail">Copy</span></span></li>
    <li><span>Location</span><span>${contact.location}</span></li>
    <li><span>LinkedIn</span><span>${contact.linkedin}</span></li>
    <li><span>GitHub</span><span>${contact.github}</span></li>
    <li><span>Availability</span><span>${contact.availability}</span></li>`;

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
        // Server returned something that wasn't JSON (e.g. a raw 404 HTML page) —
        // this tells us the route itself likely isn't reachable.
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