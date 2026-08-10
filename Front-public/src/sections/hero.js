import { escapeHtml } from "../api.js";

let roles = [];
let roleIndex = 0;

export function renderHero(hero) {
  document.getElementById("heroEyebrow").textContent = hero.eyebrow;
  document.getElementById("heroHeadline").innerHTML = hero.headline; // one deliberate exception — see note below
  document.getElementById("heroDesc").textContent = hero.description;

  const buttonsEl = document.getElementById("heroButtons");
  buttonsEl.innerHTML = (hero.buttons || [])
    .map((b, i) => `<a class="btn ${i === 0 ? "btn-primary" : "btn-ghost"}" href="${escapeHtml(b.link || "#")}">${escapeHtml(b.label)}</a>`)
    .join("");

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