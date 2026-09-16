export function renderCertificates(certs) {
  document.getElementById("certsCount").textContent = `(${certs.length})`;
  const certGrid = document.getElementById("certGrid");
  certGrid.innerHTML = "";
  const displayOrder = [...certs].reverse();

  displayOrder.forEach((c, i) => {
    const card = document.createElement("div");
    card.className = "cert-card";
    const logoHtml = c.logoUrl
      ? `<img src="${c.logoUrl}" alt="${c.issuer} logo">`
      : `<span class="logo-fallback">${c.issuer.slice(0, 8)}</span>`;

    card.innerHTML = `
      <div class="cert-inner">
        <div class="cert-face cert-front">
          <div class="badge">${logoHtml}</div>
          <div><h3>${c.name}</h3><div class="issuer">${c.issuer}</div></div>
          <span class="flip-hint">Click to view details →</span>
        </div>
        <div class="cert-face cert-back">
          <div>
            <div class="idline">Credential ID: ${c.credentialId}</div>
            <div class="idline">Issued: ${c.issued}</div>
            <div class="idline">Expires: ${c.expiry}</div>
          </div>
          ${
            c.credentialUrl
              ? `<a class="flip-hint verify-link" href="${c.credentialUrl}" target="_blank" rel="noopener noreferrer">Verify Credential →</a>`
              : `<span class="flip-hint">Verify Credential →</span>`
          }
        </div>
      </div>
    `;
    card.addEventListener("click", () => card.classList.toggle("flipped"));
    const verifyLink = card.querySelector(".verify-link");
    if (verifyLink) verifyLink.addEventListener("click", (e) => e.stopPropagation());

    if (i >= 3) card.style.display = "none";
    certGrid.appendChild(card);
  });

  if (displayOrder.length > 3) {
    const moreBtn = document.createElement("div");
    moreBtn.className = "see-more-link";
    moreBtn.textContent = "See more →";
    moreBtn.style.gridColumn = "1 / -1";
    moreBtn.addEventListener("click", () => {
      const hidden = [...certGrid.querySelectorAll(".cert-card")].slice(3);
      const opening = hidden[0].style.display === "none";
      hidden.forEach((c) => (c.style.display = opening ? "" : "none"));
      moreBtn.textContent = opening ? "See less" : "See more →";
    });
    certGrid.appendChild(moreBtn);
  }
}