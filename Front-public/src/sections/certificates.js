// Certificates: scrollable list (left) + detail showcase (right).
// The API already returns only visible certificates, in display order.
import { escapeHtml, safeUrl, normalizeUrl } from "../api.js";

const pad = (n) => String(n).padStart(2, "0");
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isNarrow = () => window.matchMedia("(max-width: 900px)").matches;

// Short badge text: the admin's issuer code, or initials made from the issuer
// ("Amazon Web Services" -> "AWS", "MongoDB" -> "MON", "The Linux Foundation" -> "LF").
export function issuerCodeFor(c) {
  const manual = String(c.issuerCode || "").trim();
  if (manual) return manual.slice(0, 8);
  const words = String(c.issuer || "").replace(/[^A-Za-z0-9 ]/g, " ").split(/\s+/)
    .filter((w) => w && !/^(the|of|and|for|by)$/i.test(w));
  if (!words.length) return "—";
  if (words.length === 1) return words[0].length <= 4 ? words[0] : words[0].slice(0, 3);
  return words.slice(0, 3).map((w) => w[0]).join("");
}

const hasExpiry = (v) => {
  const s = String(v || "").trim();
  return s && !/^(n\/?a|none|no expiry|never|-|—)$/i.test(s);
};
const link = (url) => safeUrl(normalizeUrl(url), "");

export function renderCertificates(certs = []) {
  const list = document.getElementById("certList");
  const detail = document.getElementById("certDetail");
  const counter = document.getElementById("certCounter");
  const hint = document.getElementById("certHint");
  if (!list || !detail) return;

  if (!certs.length) {
    list.innerHTML = "";
    counter.textContent = "00 / 00";
    hint.hidden = true;
    detail.innerHTML = `<p class="cx-empty">Certificates will appear here soon.</p>`;
    return;
  }

  let selected = 0;
  const total = certs.length;

  list.innerHTML = certs
    .map((c, i) => `
      <button type="button" class="cx-item" data-i="${i}" aria-pressed="${i === 0}" aria-controls="certDetail">
        <span class="cx-num">${pad(i + 1)}</span>
        <span class="cx-item-text">
          <span class="cx-item-title">${escapeHtml(c.name) || "Untitled certificate"}</span>
          <span class="cx-item-issuer">${escapeHtml(c.issuer)}</span>
        </span>
      </button>`)
    .join("");
  const buttons = [...list.querySelectorAll(".cx-item")];

  function renderDetail(c, i) {
    const logo = link(c.logoUrl);
    const verify = link(c.credentialUrl);
    const certificate = link(c.certificateUrl);
    const skills = (c.skills || []).filter(Boolean).slice(0, 8);
    const meta = [
      ["Issued", c.issued || "—", false],
      ["Expires", hasExpiry(c.expiry) ? c.expiry : "No expiry", false],
      ["Credential ID", c.credentialId || "—", true],
      ["Course type", c.kind || "—", false],
    ];

    detail.innerHTML = `
      <div class="cx-detail-inner">
        <div class="cx-detail-top">
          <div class="cx-badge" aria-hidden="true">${logo
            ? `<img src="${escapeHtml(logo)}" alt="" loading="lazy">`
            : escapeHtml(issuerCodeFor(c))}</div>
          <div class="cx-issuer">
            <b>${escapeHtml(c.issuer) || "Issuer"}</b>
            ${c.kind ? `<span>${escapeHtml(c.kind)}</span>` : ""}
          </div>
          <span class="cx-pill">Completed</span>
        </div>

        <div class="cx-detail-label">Credential ${pad(i + 1)} of ${pad(total)}</div>
        <h3 class="cx-detail-title">${escapeHtml(c.name) || "Untitled certificate"}</h3>
        ${c.issuer ? `<p class="cx-by">Issued by ${escapeHtml(c.issuer)}</p>` : ""}

        <hr class="cx-divider">
        <dl class="cx-meta">
          ${meta.map(([k, v, mono]) => `<div><dt>${k}</dt><dd${mono ? ' class="cx-mono"' : ""}>${escapeHtml(v)}</dd></div>`).join("")}
        </dl>

        ${skills.length ? `
          <div class="cx-skills-label">Skills</div>
          <ul class="cx-tags">${skills.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>` : ""}

        <hr class="cx-divider">
        <div class="cx-actions">
          ${verify ? `<a class="cx-btn cx-btn-primary" href="${escapeHtml(verify)}" target="_blank" rel="noopener noreferrer">Verify credential <span aria-hidden="true">↗</span></a>` : ""}
          ${certificate ? `<a class="cx-btn cx-btn-ghost" href="${escapeHtml(certificate)}" target="_blank" rel="noopener noreferrer">View certificate <span aria-hidden="true">↗</span></a>` : ""}
          ${!verify && !certificate ? `<span class="cx-note">No public verification link for this credential.</span>` : ""}
        </div>
      </div>`;
  }

  // Scroll only inside the list (never jumps the whole page), like block "nearest".
  function revealRow(btn) {
    const top = btn.offsetTop - list.offsetTop;
    const bottom = top + btn.offsetHeight;
    const viewTop = list.scrollTop;
    const viewBottom = viewTop + list.clientHeight - 28; // keep clear of the bottom fade
    let target = null;
    if (top < viewTop) target = top - 4;
    else if (bottom > viewBottom) target = bottom - list.clientHeight + 32;
    if (target !== null) list.scrollTo({ top: target, behavior: reducedMotion() ? "auto" : "smooth" });
  }

  function select(i, { fromUser = false, focus = false } = {}) {
    selected = Math.max(0, Math.min(total - 1, i));
    buttons.forEach((b, bi) => b.setAttribute("aria-pressed", String(bi === selected)));
    counter.textContent = `${pad(selected + 1)} / ${pad(total)}`;
    renderDetail(certs[selected], selected);
    if (fromUser) {
      revealRow(buttons[selected]);
      if (focus) buttons[selected].focus({ preventScroll: true });
      // Phones: the details sit under the list, so bring them into view.
      if (isNarrow() && !focus) detail.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "nearest" });
    }
  }

  list.addEventListener("click", (e) => {
    const btn = e.target.closest(".cx-item");
    if (btn) select(Number(btn.dataset.i), { fromUser: true });
  });

  // Arrow keys / Home / End move through the list.
  list.addEventListener("keydown", (e) => {
    const keys = { ArrowDown: selected + 1, ArrowUp: selected - 1, Home: 0, End: total - 1 };
    if (!(e.key in keys)) return;
    e.preventDefault();
    select(keys[e.key], { fromUser: true, focus: true });
  });

  // "Scroll down" hint + bottom fade: only when the list overflows; fade the
  // hint out once the bottom is reached.
  function updateOverflow() {
    const overflowing = list.scrollHeight > list.clientHeight + 2;
    const atEnd = list.scrollTop + list.clientHeight >= list.scrollHeight - 8;
    list.classList.toggle("is-overflowing", overflowing);
    list.classList.toggle("is-at-end", atEnd);
    hint.hidden = !overflowing;
    hint.classList.toggle("is-done", atEnd);
  }
  list.addEventListener("scroll", updateOverflow, { passive: true });
  if (!list.dataset.resizeBound) {
    window.addEventListener("resize", updateOverflow, { passive: true });
    list.dataset.resizeBound = "1";
  }

  // The site search (⌘K) can open a certificate directly.
  selectFromSearch = (i) => select(i, { fromUser: true });
  if (!searchBound) {
    document.addEventListener("certificates:select", (e) => selectFromSearch?.(e.detail));
    searchBound = true;
  }

  select(0);
  updateOverflow();
}

let selectFromSearch = null;
let searchBound = false;
