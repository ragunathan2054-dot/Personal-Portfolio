import { escapeHtml } from "../api.js";

const VISIBLE_COUNT = 3;
function safeUrl(url) {
  return /^https?:\/\//i.test(url || "") ? url : "";
}

export function renderCertificates(certs = []) {
  const countEl = document.getElementById("certsCount");
  if (countEl) countEl.textContent = `(${certs.length})`;

  const certGrid = document.getElementById("certGrid");
  certGrid.innerHTML = "";
  const displayOrder = [...certs].reverse();

  displayOrder.forEach((c, i) => {
    const card = document.createElement("div");
    card.className = "cert-card";

    const logoHtml = c.logoUrl
      ? `<img src="${escapeHtml(c.logoUrl)}" alt="${escapeHtml(c.issuer)} logo">`
      : `<span class="logo-fallback">${escapeHtml((c.issuer || "").slice(0, 8))}</span>`;

    const link = safeUrl(c.credentialUrl);

    card.innerHTML = `
      <div class="cert-inner">
        <div class="cert-face cert-front">
          <div class="badge">${logoHtml}</div>
          <div><h3>${escapeHtml(c.name)}</h3><div class="issuer">${escapeHtml(c.issuer)}</div></div>
          <span class="flip-hint">Click to view details →</span>
        </div>
        <div class="cert-face cert-back">
          <div>
            <div class="idline">Credential ID: ${escapeHtml(c.credentialId)}</div>
            <div class="idline">Issued: ${escapeHtml(c.issued)}</div>
            <div class="idline">Expires: ${escapeHtml(c.expiry)}</div>
          </div>
          ${
            link
              ? `<a class="flip-hint verify-link" href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer">Verify Credential →</a>`
              : `<span class="flip-hint">Verify Credential →</span>`
          }
        </div>
      </div>
    `;

    card.addEventListener("click", () => card.classList.toggle("flipped"));
    const verifyLink = card.querySelector(".verify-link");
    if (verifyLink) verifyLink.addEventListener("click", (e) => e.stopPropagation());

    if (i >= VISIBLE_COUNT) card.style.display = "none";
    certGrid.appendChild(card);
  });

  if (displayOrder.length > VISIBLE_COUNT) {
    const moreBtn = document.createElement("div");
    moreBtn.className = "see-more-link";
    moreBtn.textContent = "See more →";
    moreBtn.style.gridColumn = "1 / -1"; // spans the full width under the grid
    moreBtn.addEventListener("click", () => {
      const hidden = [...certGrid.querySelectorAll(".cert-card")].slice(VISIBLE_COUNT);
      const opening = hidden[0].style.display === "none";
      hidden.forEach((c) => (c.style.display = opening ? "" : "none"));
      moreBtn.textContent = opening ? "See less" : "See more →";
    });
    certGrid.appendChild(moreBtn);
  }
}