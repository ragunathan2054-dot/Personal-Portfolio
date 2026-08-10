import { apiFetch } from "../api.js";
import { showToast } from "../toast.js";

export async function renderMessagesPanel() {
  const el = document.getElementById("panel-messages");
  el.innerHTML = `<p class="lede">Messages submitted through your public Contact form.</p><div class="card" id="msgList"></div>`;

  async function load() {
    const messages = await apiFetch("/messages");
    const list = document.getElementById("msgList");

    if (!messages.length) {
      list.innerHTML = `<p class="lede" style="margin-bottom:0;">No messages yet.</p>`;
      return;
    }

    list.innerHTML = messages
      .map((m) => `
        <div class="list-row" data-id="${m._id}">
          <div class="list-fields">
            <b>${m.name}</b> — <span style="color:var(--text-soft);">${m.email}</span>
            <div class="hint">${new Date(m.createdAt).toLocaleString()}</div>
            <p style="margin-top:6px; font-size:.86rem;">${m.message}</p>
          </div>
          <button class="remove-btn">Delete</button>
        </div>`)
      .join("");

    list.querySelectorAll(".remove-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.closest(".list-row").dataset.id;
        try {
          await apiFetch(`/messages/${id}`, { method: "DELETE" });
          showToast("Message deleted");
          load();
        } catch (err) {
          showToast(err.message, "error");
        }
      });
    });
  }

  load();
}