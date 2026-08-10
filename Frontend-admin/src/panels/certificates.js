export function renderCertificatesPanel(content) {
  let certificates = [...(content.certificates || [])];
  const el = document.getElementById("panel-certs");
  el.innerHTML = `<p class="lede">Credentials shown as flip-cards.</p><div class="card" id="certList"></div><button class="add-row-btn" id="addCertBtn"><span class="plus">+</span> Add certificate</button><button class="btn btn-primary" id="saveCertBtn" style="margin-top:16px;">Save Certificates</button>`;

  function render() {
    document.getElementById("certList").innerHTML = certificates
      .map((c, i) => `
        <div class="list-row" data-i="${i}">
          <div class="list-fields">
            <div class="row2">
              <div class="field"><label>Certificate name</label><input data-k="name" value="${c.name || ""}"></div>
              <div class="field"><label>Issuer</label><input data-k="issuer" value="${c.issuer || ""}"></div>
            </div>
            <div class="row3">
              <div class="field"><label>Credential ID</label><input data-k="credentialId" value="${c.credentialId || ""}"></div>
              <div class="field"><label>Issued</label><input data-k="issued" value="${c.issued || ""}"></div>
              <div class="field"><label>Expires</label><input data-k="expiry" value="${c.expiry || ""}"></div>
            </div>
          </div>
          <button class="remove-btn">Remove</button>
        </div>`)
      .join("");

    document.querySelectorAll("#certList .list-row").forEach((row) => {
      const i = Number(row.dataset.i);
      row.querySelectorAll("[data-k]").forEach((f) => f.addEventListener("input", () => { certificates[i][f.dataset.k] = f.value; }));
      row.querySelector(".remove-btn").addEventListener("click", async () => {
        certificates.splice(i, 1);
        render();
        await window.__saveContent({ certificates }, "Deleted successfully");
      });
    });
  }
  render();

  document.getElementById("addCertBtn").addEventListener("click", () => {
    certificates.push({ name: "", issuer: "", credentialId: "", issued: "", expiry: "", logoUrl: "" });
    render();
  });

  document.getElementById("saveCertBtn").addEventListener("click", () => window.__saveContent({ certificates }));
}