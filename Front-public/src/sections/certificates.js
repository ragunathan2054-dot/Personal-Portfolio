export function renderCertificates(certs) {
  const certGrid = document.getElementById("certGrid");
  certGrid.innerHTML = "";

  certs.forEach((c) => {
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
          <span class="flip-hint">Verify Credential →</span>
        </div>
      </div>`;
    card.addEventListener("click", () => card.classList.toggle("flipped"));
    certGrid.appendChild(card);
  });
}