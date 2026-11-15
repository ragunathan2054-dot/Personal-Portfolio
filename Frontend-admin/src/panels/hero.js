import { showToast } from "../toast.js";
import { escapeHtml } from "../api.js";

export function renderHeroPanel(content) {
  const hero = content.hero || {};
  const site = content.site || {};
  const el = document.getElementById("panel-hero");

  el.innerHTML = `
    <p class="lede">This is the first thing a visitor sees.</p>

    <div class="card">
      <div class="card-head"><h3>Site branding</h3><span class="sub">Nav logo &amp; hero photo</span></div>
      <div class="field"><label>Nav logo text (top left)</label><input type="text" id="site-logo" value="${escapeHtml(site.logoText || "AK")}"></div>

      <div class="field">
        <label>Hero photo</label>
        <div class="avatar-row">
          <div id="heroPhotoPreview" style="width:64px; height:64px; border-radius:50%; overflow:hidden; background:var(--brown-dark); color:#fff; display:flex; align-items:center; justify-content:center; font-family:var(--serif); font-size:1.1rem; flex-shrink:0;">
            ${site.heroPhotoUrl ? `<img src="${escapeHtml(site.heroPhotoUrl)}" style="width:100%; height:100%; object-fit:cover;">` : escapeHtml(site.heroBadgeText || "AK")}
          </div>
          <div>
            <input type="file" id="heroPhotoInput" accept="image/jpeg,image/png,image/webp" style="display:none;">
            <button class="btn btn-ghost btn-sm" id="uploadPhotoBtn" type="button">Upload photo</button>
            <button class="btn btn-ghost btn-sm" id="removePhotoBtn" type="button" style="${site.heroPhotoUrl ? "" : "display:none;"}">Remove photo</button>
          </div>
        </div>
        <div class="hint">Upload a square photo (800×800px or larger works best) — it fills the box automatically.</div>
      </div>

      <div class="field"><label>Badge text (shown when there's no photo)</label><input type="text" id="site-badge" value="${escapeHtml(site.heroBadgeText || "AK")}"></div>
    </div>

    <div class="card">
      <div class="card-head"><h3>Headline</h3></div>
      <div class="field"><label>Eyebrow label</label><input type="text" id="h-eyebrow" value="${escapeHtml(hero.eyebrow)}"></div>
      <div class="field"><label>Headline</label><textarea id="h-headline">${escapeHtml(hero.headline)}</textarea><div class="hint">A single &lt;em&gt; tag stays styled as the accent word.</div></div>
      <div class="field"><label>Short description</label><textarea id="h-desc">${escapeHtml(hero.description)}</textarea></div>
    </div>

    <div class="card">
      <div class="card-head"><h3>Resume</h3><span class="sub">Downloadable from the hero button</span></div>
      <div class="field"><label>Resume button label</label><input type="text" id="h-resumeLabel" value="${escapeHtml(hero.resumeButtonLabel || "Download Resume")}"></div>
      <div class="field">
        <label>Resume file (PDF)</label>
        <div id="resumeStatus" style="margin-bottom:8px; font-size:.82rem; color:var(--text-soft);">
          ${hero.resumeUrl ? `Current file: <a href="${escapeHtml(hero.resumeUrl)}" target="_blank" rel="noopener noreferrer" style="color:var(--brown-dark);">view current resume</a>` : "No resume uploaded yet"}
        </div>
        <input type="file" id="resumeInput" accept="application/pdf" style="display:none;">
        <button class="btn btn-ghost btn-sm" id="uploadResumeBtn" type="button">Upload PDF</button>
      </div>
    </div>

    <div class="card">
      <div class="card-head"><h3>Rotating job titles</h3></div>
      <div class="chip-row" id="roleChips"></div>
      <div class="add-inline"><input type="text" id="roleInput" placeholder="Add another title"><button class="btn btn-ghost btn-sm" id="addRoleBtn" type="button">Add</button></div>
    </div>

    <div class="card">
      <div class="card-head"><h3>Other buttons</h3><span class="sub">Shown next to the Resume button</span></div>
      <div id="buttonRows"></div>
      <button class="add-row-btn" id="addButtonBtn" type="button"><span class="plus">+</span> Add button</button>
    </div>

    <button class="btn btn-primary" id="saveHeroBtn">Save Hero section</button>
  `;

  let roles = [...(hero.roles || [])];
  let buttons = [...(hero.buttons || [])];
  let heroPhotoUrl = site.heroPhotoUrl || "";
  let resumeUrl = hero.resumeUrl || "";

  function renderChips() {
    document.getElementById("roleChips").innerHTML = roles
      .map((r, i) => `<div class="chip">${escapeHtml(r)}<button data-i="${i}">✕</button></div>`)
      .join("");
    document.querySelectorAll("#roleChips button").forEach((btn) =>
      btn.addEventListener("click", () => { roles.splice(Number(btn.dataset.i), 1); renderChips(); })
    );
  }

  function renderButtons() {
    document.getElementById("buttonRows").innerHTML = buttons
      .map((b, i) => `
        <div class="list-row">
          <div class="list-fields row2">
            <div class="field"><label>Label</label><input type="text" data-i="${i}" data-k="label" value="${escapeHtml(b.label)}"></div>
            <div class="field"><label>Link</label><input type="text" data-i="${i}" data-k="link" value="${escapeHtml(b.link)}"></div>
          </div>
          <button class="remove-btn" data-i="${i}">Remove</button>
        </div>`)
      .join("");
    document.querySelectorAll("#buttonRows input").forEach((input) =>
      input.addEventListener("input", () => { buttons[input.dataset.i][input.dataset.k] = input.value; })
    );
    document.querySelectorAll("#buttonRows .remove-btn").forEach((btn) =>
      btn.addEventListener("click", () => { buttons.splice(Number(btn.dataset.i), 1); renderButtons(); })
    );
  }

  renderChips();
  renderButtons();

  document.getElementById("addRoleBtn").addEventListener("click", () => {
    const input = document.getElementById("roleInput");
    if (input.value.trim()) { roles.push(input.value.trim()); input.value = ""; renderChips(); }
  });

  document.getElementById("addButtonBtn").addEventListener("click", () => {
    buttons.push({ label: "New button", link: "#" });
    renderButtons();
  });

  function getCookie(name) {
    return document.cookie.split("; ").find((r) => r.startsWith(name + "="))?.split("=")[1];
  }

  // Photo upload
  document.getElementById("uploadPhotoBtn").addEventListener("click", () => {
    document.getElementById("heroPhotoInput").click();
  });
  document.getElementById("heroPhotoInput").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        credentials: "include",
        headers: { "X-CSRF-Token": getCookie("XSRF-TOKEN") },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      heroPhotoUrl = data.url;
      document.getElementById("heroPhotoPreview").innerHTML = `<img src="${escapeHtml(heroPhotoUrl)}" style="width:100%; height:100%; object-fit:cover;">`;
      document.getElementById("removePhotoBtn").style.display = "inline-block";
      showToast("Photo uploaded — click Save to apply");
    } catch (err) {
      showToast(err.message, "error");
    }
  });
  document.getElementById("removePhotoBtn").addEventListener("click", () => {
    heroPhotoUrl = "";
    document.getElementById("heroPhotoPreview").textContent = document.getElementById("site-badge").value || "AK";
    document.getElementById("removePhotoBtn").style.display = "none";
    showToast("Photo removed — click Save to apply");
  });

  // Resume upload — same pattern, different accepted file type
  document.getElementById("uploadResumeBtn").addEventListener("click", () => {
    document.getElementById("resumeInput").click();
  });
  document.getElementById("resumeInput").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file); // field name stays "image" — the backend route accepts any file here, filtered by mimetype
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        credentials: "include",
        headers: { "X-CSRF-Token": getCookie("XSRF-TOKEN") },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      resumeUrl = data.url;
      document.getElementById("resumeStatus").innerHTML = `Current file: <a href="${escapeHtml(resumeUrl)}" target="_blank" rel="noopener noreferrer" style="color:var(--brown-dark);">view current resume</a>`;
      showToast("Resume uploaded — click Save to apply");
    } catch (err) {
      showToast(err.message, "error");
    }
  });

  document.getElementById("saveHeroBtn").addEventListener("click", async () => {
    const site = {
      logoText: document.getElementById("site-logo").value,
      heroBadgeText: document.getElementById("site-badge").value,
      heroPhotoUrl,
    };
    const hero = {
      eyebrow: document.getElementById("h-eyebrow").value,
      headline: document.getElementById("h-headline").value,
      description: document.getElementById("h-desc").value,
      resumeButtonLabel: document.getElementById("h-resumeLabel").value,
      resumeUrl,
      roles, buttons,
    };
    await window.__saveContent({ site, hero });
  });
}