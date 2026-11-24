
const line = (cls = "") => `<span class="sk sk-line ${cls}"></span>`;
const card = () =>
  `<div class="sk-card"><span class="sk sk-title"></span>${line()}${line("short")}${line("tiny")}</div>`;
const repeat = (n, fn) => Array.from({ length: n }, fn).join("");

const SKELETONS = {
  heroDesc: () => line() + line("short"),
  heroButtons: () => `<span class="sk sk-btn"></span><span class="sk sk-btn"></span>`,
  aboutP1: () => line() + line() + line("short"),
  aboutP2: () => line() + line("short"),
  aboutStats: () => repeat(3, () => `<span class="sk sk-stat"></span>`),
  aboutTimeline: () => repeat(3, () => `<div style="margin-bottom:22px">${line("tiny")}<span class="sk sk-title"></span>${line()}</div>`),
  skillGroups: () => `<div class="sk-grid">${repeat(6, card)}</div>`,
  projectList: () => repeat(3, () => `<div class="sk-project">${card()}</div>`),
  certList: () => repeat(6, () => `<div class="sk-card" style="border-radius:18px;padding:16px 20px">${line("short")}${line("tiny")}</div>`),
  certDetail: () => `<span class="sk sk-title"></span>${line()}${line("short")}${line()}${line("tiny")}`,
  contactList: () => repeat(5, () => `<li>${line("tiny")}${line("short")}</li>`),
};

export function showSkeletons() {
  document.body.classList.remove("sk-paused");
  for (const [id, build] of Object.entries(SKELETONS)) {
    const el = document.getElementById(id);
    if (el && !el.childElementCount && !el.textContent.trim()) el.innerHTML = build();
  }
}

export function showLoadError(onRetry) {
  document.body.classList.add("sk-paused"); // stop the shimmer, it isn't loading anymore
  let box = document.getElementById("loadError");
  if (!box) {
    box = document.createElement("div");
    box.id = "loadError";
    box.className = "load-error";
    box.setAttribute("role", "alert");
    box.innerHTML = `<span>Couldn't load the portfolio content.</span><button type="button">Retry</button>`;
    document.body.appendChild(box);
  }
  box.hidden = false;
  const btn = box.querySelector("button");
  btn.disabled = false;
  btn.textContent = "Retry";
  btn.onclick = () => {
    btn.disabled = true;
    btn.textContent = "Loading…";
    document.body.classList.remove("sk-paused");
    onRetry();
  };
}

export function hideLoadError() {
  const box = document.getElementById("loadError");
  if (box) box.hidden = true;
}
