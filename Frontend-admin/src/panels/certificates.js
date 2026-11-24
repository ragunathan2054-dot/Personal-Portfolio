import { escapeHtml as esc } from "../api.js";

const MAX_SKILLS = 8;

const blankCertificate = () => ({
  name: "", issuer: "", credentialId: "", issued: "", expiry: "", logoUrl: "", credentialUrl: "",
  kind: "", skills: [], certificateUrl: "", issuerCode: "", order: null, isVisible: true,
});

// Old certificates (saved before the new fields existed) get safe defaults.
function normalize(c) {
  return {
    ...blankCertificate(),
    ...c,
    skills: Array.isArray(c.skills) ? c.skills : [],
    isVisible: c.isVisible !== false,
    order: typeof c.order === "number" ? c.order : null,
  };
}

export function renderCertificatesPanel(content) {
  let certificates = (content.certificates || []).map(normalize);
  let openIndex = null; // which certificate is expanded (one at a time)
  let query = "";

  const el = document.getElementById("panel-certs");
  el.innerHTML = `
    <p class="lede">Click a certificate to edit it. Hidden certificates stay here but don't show on the public site.</p>
    <div class="cert-toolbar">
      <input type="search" id="certSearch" placeholder="Search by title or issuer…" aria-label="Search certificates">
      <span class="cert-count" id="certCount"></span>
    </div>
    <div class="card" id="certList"></div>
    <button class="add-row-btn" id="addCertBtn"><span class="plus">+</span> Add certificate</button>
    <button class="btn btn-primary" id="saveCertBtn" style="margin-top:16px;">Save Certificates</button>
  `;

  const save = (message) => window.__saveContent({ certificates: certificates.map(toPayload) }, message);

  // What gets sent to the backend: trimmed text, real numbers/booleans.
  function toPayload(c) {
    const out = { ...c };
    for (const k of ["name", "issuer", "credentialId", "issued", "expiry", "logoUrl", "credentialUrl", "kind", "certificateUrl", "issuerCode"]) {
      out[k] = String(out[k] ?? "").trim();
    }
    out.skills = (out.skills || []).map((s) => String(s).trim()).filter(Boolean).slice(0, MAX_SKILLS);
    out.order = out.order === "" || out.order === null || out.order === undefined ? null : Number(out.order);
    out.isVisible = out.isVisible !== false;
    return out;
  }

  function matches(c) {
    if (!query) return true;
    return `${c.name} ${c.issuer}`.toLowerCase().includes(query);
  }

  function updateCount() {
    const hidden = certificates.filter((c) => !c.isVisible).length;
    const shown = certificates.filter(matches).length;
    document.getElementById("certCount").textContent =
      `${query ? `${shown} of ` : ""}${certificates.length} certificates${hidden ? ` · ${hidden} hidden` : ""}`;
  }

  function badges(c) {
    return `${c.order !== null && c.order !== "" ? `<span class="cert-pill">Order ${esc(c.order)}</span>` : ""}`
      + `<span class="cert-pill ${c.isVisible ? "on" : "off"}">${c.isVisible ? "Visible" : "Hidden"}</span>`;
  }

  function skillChips(c) {
    return c.skills
      .map((s, si) => `<span class="chip">${esc(s)}<button type="button" data-remove-skill="${si}" aria-label="Remove ${esc(s)}">✕</button></span>`)
      .join("");
  }

  function render() {
    const list = document.getElementById("certList");
    updateCount();

    if (!certificates.length) {
      list.innerHTML = `<p class="lede" style="margin-bottom:0;">No certificates yet. Click "Add certificate" below.</p>`;
      return;
    }

    list.innerHTML = certificates
      .map((c, i) => `
        <div class="accordion-item ${openIndex === i ? "open" : ""}" data-i="${i}" ${matches(c) ? "" : "hidden"}>
          <div class="accordion-head">
            <div class="accordion-title">
              <span class="idx">${String(i + 1).padStart(2, "0")}</span>
              <b class="cert-title">${esc(c.name) || "Untitled"}</b>
              <span class="meta cert-meta">${esc(c.issuer)}</span>
            </div>
            <div class="cert-head-right"><span class="cert-badges">${badges(c)}</span><span class="accordion-caret">▸</span></div>
          </div>
          <div class="accordion-body">
            <div class="row2">
              <div class="field"><label>Certificate title</label><input type="text" data-k="name" value="${esc(c.name)}"></div>
              <div class="field"><label>Issuer</label><input type="text" data-k="issuer" value="${esc(c.issuer)}" placeholder="Amazon Web Services"></div>
            </div>
            <div class="row3">
              <div class="field"><label>Course type</label><input type="text" data-k="kind" value="${esc(c.kind)}" placeholder="Skill Builder course"></div>
              <div class="field"><label>Issuer code</label><input type="text" data-k="issuerCode" value="${esc(c.issuerCode)}" maxlength="8" placeholder="AWS">
                <div class="hint">Short badge text. Empty = made from the issuer name.</div></div>
              <div class="field"><label>Credential ID</label><input type="text" data-k="credentialId" value="${esc(c.credentialId)}"></div>
            </div>
            <div class="row3">
              <div class="field"><label>Issued</label><input type="text" data-k="issued" value="${esc(c.issued)}" placeholder="Mar 2026">
                <div class="hint">e.g. 2026, Mar 2026, 2026-03.</div></div>
              <div class="field"><label>Expires</label><input type="text" data-k="expiry" value="${esc(c.expiry)}" placeholder="Leave empty if it doesn't expire">
                <div class="hint">Empty or "N/A" shows as "No expiry".</div></div>
              <div class="field"><label>Order</label><input type="number" min="0" max="9999" step="1" data-k="order" value="${c.order ?? ""}" placeholder="Auto">
                <div class="hint">Lower shows first. Empty = sorted by date.</div></div>
            </div>
            <div class="field">
              <label>Skills <span class="label-note">(${c.skills.length}/${MAX_SKILLS})</span></label>
              <div class="tag-input" data-tags>
                ${skillChips(c)}
                <input type="text" data-skill-input placeholder="${c.skills.length >= MAX_SKILLS ? "Max 8 tags" : "Type a skill and press Enter"}" ${c.skills.length >= MAX_SKILLS ? "disabled" : ""}>
              </div>
            </div>
            <div class="field"><label>Verify URL</label><input type="url" data-k="credentialUrl" value="${esc(c.credentialUrl)}" placeholder="https://www.credly.com/badges/...">
              <div class="hint">Where "Verify" on the public site sends visitors.</div></div>
            <div class="row2">
              <div class="field"><label>Certificate URL</label><input type="url" data-k="certificateUrl" value="${esc(c.certificateUrl)}" placeholder="https://…/certificate.pdf">
                <div class="hint">Link to the certificate image or PDF.</div></div>
              <div class="field"><label>Logo URL</label><input type="url" data-k="logoUrl" value="${esc(c.logoUrl)}" placeholder="https://…/logo.png">
                <div class="hint">Optional issuer logo or badge image.</div></div>
            </div>
            <div class="switch-row">
              <div class="label"><b>Visible on public site</b><span>Turn off to hide it without deleting it.</span></div>
              <label class="switch"><input type="checkbox" data-visible ${c.isVisible ? "checked" : ""}><span class="slider"></span></label>
            </div>
            <div class="accordion-actions">
              <button type="button" class="btn btn-danger-ghost btn-sm remove-cert">Delete certificate</button>
              <button type="button" class="btn btn-primary btn-sm save-cert">Save</button>
            </div>
          </div>
        </div>`)
      .join("");

    list.querySelectorAll(".accordion-item").forEach((item) => wire(item, Number(item.dataset.i)));
  }

  function refreshHead(item, c) {
    item.querySelector(".cert-title").textContent = c.name || "Untitled";
    item.querySelector(".cert-meta").textContent = c.issuer;
    item.querySelector(".cert-badges").innerHTML = badges(c);
    updateCount();
  }

  function renderSkills(item, c) {
    const box = item.querySelector("[data-tags]");
    box.querySelectorAll(".chip").forEach((chip) => chip.remove());
    box.insertAdjacentHTML("afterbegin", skillChips(c));
    const input = box.querySelector("[data-skill-input]");
    const full = c.skills.length >= MAX_SKILLS;
    input.disabled = full;
    input.placeholder = full ? "Max 8 tags" : "Type a skill and press Enter";
    item.querySelector(".label-note").textContent = `(${c.skills.length}/${MAX_SKILLS})`;
  }

  function wire(item, i) {
    const c = certificates[i];

    item.querySelector(".accordion-head").addEventListener("click", () => {
      const wasOpen = item.classList.contains("open");
      document.querySelectorAll("#certList .accordion-item").forEach((x) => x.classList.remove("open"));
      if (!wasOpen) item.classList.add("open");
      openIndex = wasOpen ? null : i;
    });

    item.querySelectorAll("[data-k]").forEach((f) =>
      f.addEventListener("input", () => {
        c[f.dataset.k] = f.dataset.k === "order" ? (f.value === "" ? null : Number(f.value)) : f.value;
        refreshHead(item, c);
      })
    );

    item.querySelector("[data-visible]").addEventListener("change", (e) => {
      c.isVisible = e.target.checked;
      refreshHead(item, c);
    });

    // Skills: type + Enter (or comma) adds a tag, ✕ removes one, Backspace on
    // an empty box removes the last one.
    const tagBox = item.querySelector("[data-tags]");
    const skillInput = tagBox.querySelector("[data-skill-input]");
    const addSkill = () => {
      const value = skillInput.value.replace(/,/g, " ").trim();
      skillInput.value = "";
      if (!value || c.skills.length >= MAX_SKILLS) return;
      if (c.skills.some((s) => s.toLowerCase() === value.toLowerCase())) return;
      c.skills.push(value.slice(0, 40));
      renderSkills(item, c);
      skillInput.focus();
    };
    skillInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addSkill(); }
      else if (e.key === "Backspace" && !skillInput.value && c.skills.length) { c.skills.pop(); renderSkills(item, c); }
    });
    skillInput.addEventListener("blur", addSkill);
    tagBox.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-remove-skill]");
      if (btn) { c.skills.splice(Number(btn.dataset.removeSkill), 1); renderSkills(item, c); skillInput.focus(); }
      else if (e.target === tagBox) skillInput.focus();
    });

    // Delete with a confirm step: first click asks, second click deletes.
    const removeBtn = item.querySelector(".remove-cert");
    let confirmTimer = null;
    removeBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      if (!removeBtn.dataset.confirm) {
        removeBtn.dataset.confirm = "1";
        removeBtn.textContent = `Click again to delete "${c.name || "this certificate"}"`;
        confirmTimer = setTimeout(() => { delete removeBtn.dataset.confirm; removeBtn.textContent = "Delete certificate"; }, 4000);
        return;
      }
      clearTimeout(confirmTimer);
      certificates.splice(i, 1);
      openIndex = null;
      render();
      await save("Certificate deleted");
    });

    item.querySelector(".save-cert").addEventListener("click", async (e) => {
      e.stopPropagation();
      await save("Certificate saved");
    });
  }

  render();

  document.getElementById("certSearch").addEventListener("input", (e) => {
    query = e.target.value.trim().toLowerCase();
    document.querySelectorAll("#certList .accordion-item").forEach((item) => {
      item.hidden = !matches(certificates[Number(item.dataset.i)]);
    });
    updateCount();
  });

  document.getElementById("addCertBtn").addEventListener("click", () => {
    certificates.push(blankCertificate());
    openIndex = certificates.length - 1; // open the new one so you can start typing right away
    query = "";
    document.getElementById("certSearch").value = "";
    render();
    document.querySelector(`#certList .accordion-item[data-i="${openIndex}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  document.getElementById("saveCertBtn").addEventListener("click", () => save("Certificates saved"));
}
