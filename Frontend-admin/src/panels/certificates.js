function esc(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderCertificatesPanel(content) {
  let certificates = [...(content.certificates || [])];
  let openIndex = null; // which certificate is currently expanded (only one at a time)

  const el = document.getElementById("panel-certs");
  el.innerHTML = `
    <p class="lede">Click a certificate to edit it.</p>
    <div class="card" id="certList"></div>
    <button class="add-row-btn" id="addCertBtn"><span class="plus">+</span> Add certificate</button>
    <button class="btn btn-primary" id="saveCertBtn" style="margin-top:16px;">Save Certificates</button>
  `;

  function render() {
    const list = document.getElementById("certList");

    if (!certificates.length) {
      list.innerHTML = `<p class="lede" style="margin-bottom:0;">No certificates yet. Click "Add certificate" below.</p>`;
      return;
    }

    list.innerHTML = certificates
      .map(
        (c, i) => `
        <div class="accordion-item ${openIndex === i ? "open" : ""}" data-i="${i}">
          <div class="accordion-head">
            <div class="accordion-title">
              <span class="idx">${String(i + 1).padStart(2, "0")}</span>
              <b class="cert-title">${esc(c.name) || "Untitled"}</b>
              <span class="meta cert-meta">${esc(c.issuer)}</span>
            </div>
            <span class="accordion-caret">▸</span>
          </div>
          <div class="accordion-body">
            <div class="row2">
              <div class="field"><label>Certificate name</label><input type="text" data-k="name" value="${esc(c.name)}"></div>
              <div class="field"><label>Issuer</label><input type="text" data-k="issuer" value="${esc(c.issuer)}"></div>
            </div>
            <div class="row3">
              <div class="field"><label>Credential ID</label><input type="text" data-k="credentialId" value="${esc(c.credentialId)}"></div>
              <div class="field"><label>Issued</label><input type="text" data-k="issued" value="${esc(c.issued)}"></div>
              <div class="field"><label>Expires</label><input type="text" data-k="expiry" value="${esc(c.expiry)}"></div>
            </div>
            <div class="field">
              <label>Verification link</label>
              <input type="text" data-k="credentialUrl" value="${esc(c.credentialUrl)}" placeholder="https://www.credly.com/...">
              <div class="hint">This is where "Verify Credential" on the public site sends visitors.</div>
            </div>
            <div class="accordion-actions">
              <button class="btn btn-danger-ghost btn-sm remove-cert">Delete certificate</button>
              <button class="btn btn-primary btn-sm save-cert">Save</button>
            </div>
          </div>
        </div>`
      )
      .join("");

    list.querySelectorAll(".accordion-item").forEach((item) => {
      const i = Number(item.dataset.i);
      item.querySelector(".accordion-head").addEventListener("click", () => {
        const wasOpen = item.classList.contains("open");
        list.querySelectorAll(".accordion-item").forEach((x) => x.classList.remove("open"));
        if (!wasOpen) item.classList.add("open");
        openIndex = wasOpen ? null : i;
      });

      item.querySelectorAll("[data-k]").forEach((f) =>
        f.addEventListener("input", () => {
          certificates[i][f.dataset.k] = f.value;
          if (f.dataset.k === "name") item.querySelector(".cert-title").textContent = f.value || "Untitled";
          if (f.dataset.k === "issuer") item.querySelector(".cert-meta").textContent = f.value;
        })
      );

      item.querySelector(".remove-cert").addEventListener("click", async (e) => {
        e.stopPropagation();
        certificates.splice(i, 1);
        openIndex = null;
        render();
        await window.__saveContent({ certificates }, "Deleted successfully");
      });

      item.querySelector(".save-cert").addEventListener("click", async (e) => {
        e.stopPropagation();
        await window.__saveContent({ certificates });
      });
    });
  }

  render();

  document.getElementById("addCertBtn").addEventListener("click", () => {
    certificates.push({ name: "", issuer: "", credentialId: "", issued: "", expiry: "", logoUrl: "", credentialUrl: "" });
    openIndex = certificates.length - 1; // open the new one so you can start typing right away
    render();
    document.querySelector(`#certList .accordion-item[data-i="${openIndex}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  document.getElementById("saveCertBtn").addEventListener("click", () => window.__saveContent({ certificates }));
}