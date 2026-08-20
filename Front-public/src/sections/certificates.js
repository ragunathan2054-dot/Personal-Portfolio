export function renderCertificates(certs) {
  const certGrid = document.getElementById("certGrid");
  certGrid.innerHTML = "";

  certs.forEach((c) => {
    const card = document.createElement("div");
    card.className = "cert-card";
    const logoHtml = c.logoUrl
      ? `<img src="${c.logoUrl}" alt="${c.issuer} logo">`
      : `<span class="logo-fallback">${c.issuer.slice(0, 8)}</span>`;

    // "Verify Credential" is now a real <a> tag pointing at credentialUrl.
    // stopPropagation keeps a click on the link from also toggling the card
    // flip — it just opens the link cleanly in a new tab.
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
    if (verifyLink) {
      verifyLink.addEventListener("click", (e) => e.stopPropagation());
    }

    certGrid.appendChild(card);
  });
}