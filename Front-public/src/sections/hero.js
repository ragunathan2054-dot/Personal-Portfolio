import { escapeHtml } from "../api.js";

let roles = [];
let roleIndex = 0;

export function renderHero(hero) {
  document.getElementById("heroEyebrow").textContent = hero.eyebrow;
  document.getElementById("heroHeadline").innerHTML = hero.headline;
  document.getElementById("heroDesc").textContent = hero.description;

  const buttonsEl = document.getElementById("heroButtons");
  let html = "";

  if (hero.resumeUrl) {
  html += `<a class="btn btn-primary" href="${escapeHtml(hero.resumeUrl)}" download="resume.pdf">${escapeHtml(hero.resumeButtonLabel || "Download Resume")}</a>`;
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