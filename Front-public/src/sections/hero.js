import { escapeHtml } from "../api.js";

let roles = [];
let roleIndex = 0;

export function renderHero(hero) {
  document.getElementById("heroEyebrow").textContent = hero.eyebrow;
  document.getElementById("heroHeadline").innerHTML = hero.headline;
  document.getElementById("heroDesc").textContent = hero.description;

  const buttonsEl = document.getElementById("heroButtons");
  let html = "";

  // Resume button — only rendered if a resume was actually uploaded.
  // The "download" attribute tells the browser to download the file instead
  // of navigating to it, and target="_blank" is a safe fallback if the
  // browser chooses to open it in a new tab anyway (some browsers preview
  // PDFs instead of downloading by default).
  if (hero.resumeUrl) {
    html += `<a class="btn btn-primary" href="${escapeHtml(hero.resumeUrl)}" download target="_blank" rel="noopener noreferrer">${escapeHtml(hero.resumeButtonLabel || "Download Resume")}</a>`;
  }

  html += (hero.buttons || [])
    .map((b) => `<a class="btn btn-ghost" href="${escapeHtml(b.link || "#")}">${escapeHtml(b.label)}</a>`)
    .join("");

  buttonsEl.innerHTML = html;

  roles = hero.roles?.length ? hero.roles : ["Cloud Engineer"];
  startRoleRotation();
}

function startRoleRotation() {
  const roleEl = document.getElementById("rotate-role");
  setInterval(() => {
    roleIndex = (roleIndex + 1) % roles.length;
    roleEl.style.opacity = 0;
    setTimeout(() => {
      roleEl.textContent = roles[roleIndex];
      roleEl.style.opacity = 1;
    }, 250);
  }, 2400);
}