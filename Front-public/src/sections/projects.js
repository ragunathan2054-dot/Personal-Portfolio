import { escapeHtml, safeUrl } from "../api.js";

const VISIBLE_COUNT = 3;

export function renderProjects(projects) {
  const countEl = document.getElementById("projectsCount");
  if (countEl) countEl.textContent = `(${projects.length})`;

  const projectList = document.getElementById("projectList");
  projectList.innerHTML = "";
  const displayOrder = [...projects].reverse();

  displayOrder.forEach((p, i) => {
    const card = document.createElement("div");
    card.className = "project-card";
    card.innerHTML = `
      <div class="p-top">
        <div>
          <div class="p-tag">${escapeHtml(p.tag)}</div>
          <div class="p-title">${escapeHtml(p.title)}</div>
          <div class="p-desc">${escapeHtml(p.desc)}</div>
          <div class="p-meta">
            <span>Status: ${escapeHtml(p.status)}</span>
            <span>Version: ${escapeHtml(p.version)}</span>
            <span>Commits: ${escapeHtml(p.commits)}</span>
          </div>
        </div>
        <div style="font-family:var(--mono); font-size:.7rem; color:var(--text-soft);">${String(i + 1).padStart(2, "0")}</div>
      </div>
      <div class="p-body">
        <div class="p-body-inner">
          <div class="p-col">
            <h4>Features</h4>
            <ul>${(p.features || []).map((f) => `<li>${escapeHtml(f)}</li>`).join("")}</ul>
            <div style="margin-top:14px;">${(p.stack || []).map((s) => `<span class="stack-pill">${escapeHtml(s)}</span>`).join("")}</div>
          </div>
          <div class="p-col">
            <h4>Challenge</h4><p>${escapeHtml(p.challenge)}</p>
            <h4 style="margin-top:14px;">Solution</h4><p>${escapeHtml(p.solution)}</p>
          </div>
        </div>
        <div class="p-links">
          <a href="${escapeHtml(safeUrl(p.demo))}">Live Demo →</a>
          <a href="${escapeHtml(safeUrl(p.repo))}">GitHub →</a>
        </div>
      </div>
    `;
    card.addEventListener("click", () => {
      const wasOpen = card.classList.contains("open");
      document.querySelectorAll(".project-card").forEach((c) => c.classList.remove("open"));
      if (!wasOpen) card.classList.add("open");
    });
    if (i >= VISIBLE_COUNT) card.style.display = "none";
    projectList.appendChild(card);
  });

  if (displayOrder.length > VISIBLE_COUNT) {
    const moreBtn = document.createElement("div");
    moreBtn.className = "see-more-link";
    moreBtn.textContent = "See more →";
    moreBtn.addEventListener("click", () => {
      const hidden = [...projectList.querySelectorAll(".project-card")].slice(VISIBLE_COUNT);
      const opening = hidden[0].style.display === "none";
      hidden.forEach((c) => (c.style.display = opening ? "" : "none"));
      moreBtn.textContent = opening ? "See less" : "See more →";
    });
    projectList.appendChild(moreBtn);
  }
}