export function renderProjects(projects) {
  document.getElementById("projectsCount").textContent = `(${projects.length})`;
  const projectList = document.getElementById("projectList");
  projectList.innerHTML = "";
  const displayOrder = [...projects].reverse();

  displayOrder.forEach((p, i) => {
    const card = document.createElement("div");
    card.className = "project-card";
    card.innerHTML = `
      <div class="p-top">
        <div>
          <div class="p-tag">${p.tag}</div>
          <div class="p-title">${p.title}</div>
          <div class="p-desc">${p.desc}</div>
          <div class="p-meta">
            <span>Status: ${p.status}</span>
            <span>Version: ${p.version}</span>
            <span>Commits: ${p.commits}</span>
          </div>
        </div>
        <div style="font-family:var(--mono); font-size:.7rem; color:var(--text-soft);">${String(i + 1).padStart(2, "0")}</div>
      </div>
      <div class="p-body">
        <div class="p-body-inner">
          <div class="p-col">
            <h4>Features</h4>
            <ul>${(p.features || []).map((f) => `<li>${f}</li>`).join("")}</ul>
            <div style="margin-top:14px;">${(p.stack || []).map((s) => `<span class="stack-pill">${s}</span>`).join("")}</div>
          </div>
          <div class="p-col">
            <h4>Challenge</h4><p>${p.challenge}</p>
            <h4 style="margin-top:14px;">Solution</h4><p>${p.solution}</p>
          </div>
        </div>
        <div class="p-links">
          <a href="${p.demo}">Live Demo →</a>
          <a href="${p.repo}">GitHub →</a>
        </div>
      </div>
    `;
    card.addEventListener("click", () => {
      const wasOpen = card.classList.contains("open");
      document.querySelectorAll(".project-card").forEach((c) => c.classList.remove("open"));
      if (!wasOpen) card.classList.add("open");
    });
    if (i >= 3) card.style.display = "none";
    projectList.appendChild(card);
  });

  if (displayOrder.length > 3) {
    const moreBtn = document.createElement("div");
    moreBtn.className = "see-more-link";
    moreBtn.textContent = "See more →";
    moreBtn.addEventListener("click", () => {
      const hidden = [...projectList.querySelectorAll(".project-card")].slice(6);
      const opening = hidden[0].style.display === "none";
      hidden.forEach((c) => (c.style.display = opening ? "" : "none"));
      moreBtn.textContent = opening ? "See less" : "See more →";
    });
    projectList.appendChild(moreBtn);
  }
}