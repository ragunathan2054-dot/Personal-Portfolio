export function renderCertificates(certs = []) {
  const certsCount = document.getElementById("certsCount");
  const certGrid = document.getElementById("certGrid");

  const certificates = Array.isArray(certs)
    ? certs.filter((cert) => cert && typeof cert === "object")
    : [];

  if (certsCount) {
    certsCount.textContent = `(${certificates.length})`;
  }

  if (!certGrid) {
    console.error('Missing HTML element: id="certGrid"');
    return;
  }

  certGrid.replaceChildren();

  // Escape certificate text before inserting it into HTML.
  const escapeHtml = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (char) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };
      return entities[char];
    });

  // Allow only HTTP or HTTPS links.
  const safeUrl = (value) => {
    if (typeof value !== "string" || !value.trim()) return "";

    try {
      const url = new URL(value, document.baseURI);
      return ["http:", "https:"].includes(url.protocol)
        ? url.href
        : "";
    } catch {
      return "";
    }
  };

  const displayOrder = [...certificates].reverse();
  const cards = [];

  displayOrder.forEach((c, i) => {
    const card = document.createElement("div");
    card.className = "cert-card";

    const issuer = String(c.issuer || "Unknown issuer");
    const logoUrl = safeUrl(c.logoUrl);
    const credentialUrl = safeUrl(c.credentialUrl);

    const logoHtml = logoUrl
      ? `<img
           src="${escapeHtml(logoUrl)}"
           alt="${escapeHtml(issuer)} logo"
           loading="lazy"
         >`
      : `<span class="logo-fallback">${escapeHtml(
          issuer.slice(0, 8)
        )}</span>`;

    card.innerHTML = `
      <div class="cert-inner">
        <div class="cert-face cert-front">
          <div class="badge">${logoHtml}</div>

          <div>
            <h3>${escapeHtml(c.name || "Certificate")}</h3>
            <div class="issuer">${escapeHtml(issuer)}</div>
          </div>

          <span class="flip-hint">Click to view details →</span>
        </div>

        <div class="cert-face cert-back">
          <div>
            <div class="idline">
              Credential ID: ${escapeHtml(c.credentialId || "Not provided")}
            </div>
            <div class="idline">
              Issued: ${escapeHtml(c.issued || "Not provided")}
            </div>
            <div class="idline">
              Expires: ${escapeHtml(c.expiry || "Not provided")}
            </div>
          </div>

          ${
            credentialUrl
              ? `<a
                   class="flip-hint verify-link"
                   href="${escapeHtml(credentialUrl)}"
                   target="_blank"
                   rel="noopener noreferrer"
                 >Verify Credential →</a>`
              : `<span class="flip-hint">Verification link unavailable</span>`
          }
        </div>
      </div>
    `;

    card.addEventListener("click", () => {
      card.classList.toggle("flipped");
    });

    const verifyLink = card.querySelector(".verify-link");

    if (verifyLink) {
      verifyLink.addEventListener("click", (event) => {
        event.stopPropagation();
      });
    }

    if (i >= 3) {
      card.style.display = "none";
    }

    cards.push(card);
    certGrid.appendChild(card);
  });

  if (cards.length > 3) {
    const moreBtn = document.createElement("div");
    moreBtn.className = "see-more-link";
    moreBtn.textContent = "See more →";
    moreBtn.style.gridColumn = "1 / -1";
    moreBtn.setAttribute("role", "button");
    moreBtn.setAttribute("tabindex", "0");
    moreBtn.setAttribute("aria-expanded", "false");

    let expanded = false;

    const toggleCards = () => {
      expanded = !expanded;

      cards.slice(3).forEach((card) => {
        card.style.display = expanded ? "" : "none";
      });

      moreBtn.textContent = expanded ? "See less" : "See more →";
      moreBtn.setAttribute("aria-expanded", String(expanded));
    };

    moreBtn.addEventListener("click", toggleCards);

    moreBtn.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleCards();
      }
    });

    certGrid.appendChild(moreBtn);
  }
}