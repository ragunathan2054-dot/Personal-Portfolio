const CAT_LABELS = { cloud: "Cloud & DevOps", dev: "Development", design: "Design", sec: "Security" };
const GROUP_ORDER = ["cloud", "dev", "design", "sec"];
let activeFilter = "all";

export function renderSkills(skills) {
  const skillGroups = document.getElementById("skillGroups");
  skillGroups.innerHTML = "";

  GROUP_ORDER.forEach((cat) => {
    const groupSkills = skills.filter((s) => s.category === cat);
    if (!groupSkills.length) return;

    const group = document.createElement("div");
    group.className = "skill-group";
    group.dataset.cat = cat;
    group.innerHTML = `<div class="skill-group-head"><h3>${CAT_LABELS[cat]}</h3><span class="count">${groupSkills.length} skills</span></div><div class="skill-grid"></div>`;

    const grid = group.querySelector(".skill-grid");
    groupSkills.forEach((s, idx) => {
      const card = document.createElement("div");
      card.className = "skill-card";
      card.dataset.cat = s.category;
      card.dataset.name = s.name.toLowerCase();
      card.dataset.idx = idx;
      card.innerHTML = `
        <div class="skill-inner">
          <div class="skill-face skill-front">
            <div class="skill-top-row">
              <div class="skill-icon">${s.name.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase()}</div>
              <div class="skill-name-block"><div class="sname">${s.name}</div><span class="scat">${CAT_LABELS[s.category]}</span></div>
              <span class="skill-pct">${s.years}</span>
            </div>
            <div class="skill-bar-track"><div class="skill-bar-fill" style="width:${s.level}%;"></div></div>
            <div><div class="skill-desc">${s.description}</div><div class="skill-used" style="margin-top:8px;">Used in <b>${s.usedIn}</b></div></div>
          </div>
          <div class="skill-face skill-back">
            <div><span class="scat">${CAT_LABELS[s.category]}</span><p class="skill-note" style="margin-top:8px;">${s.note}</p></div>
            <span class="flip-hint">← Tap to flip back</span>
          </div>
        </div>`;
      card.addEventListener("click", () => card.classList.toggle("flipped"));
      grid.appendChild(card);
    });

  if (groupSkills.length > 3) {
  const moreBtn = document.createElement("div");
  moreBtn.className = "see-more-link";
  moreBtn.textContent = "See more →";
  moreBtn.addEventListener("click", () => {
    group.classList.toggle("expanded");
    moreBtn.textContent = group.classList.contains("expanded") ? "See less" : "See more →";
    applySkillFilters();
  });
  group.appendChild(moreBtn);
}

    skillGroups.appendChild(group);
  });

  initSkillFilters();
  applySkillFilters();
}

function initSkillFilters() {
  document.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      activeFilter = chip.dataset.f;
      applySkillFilters();
    });
  });

  let debounce;
  document.getElementById("skillSearch").addEventListener("input", () => {
    clearTimeout(debounce);
    debounce = setTimeout(applySkillFilters, 200);
  });
}

function applySkillFilters() {
  const term = document.getElementById("skillSearch").value.trim().toLowerCase();
  const searching = term !== "";
  document.getElementById("skillEmptyTerm").textContent = term;

  let visibleCount = 0;
  document.querySelectorAll(".skill-group").forEach((group) => {
    const groupMatchesCat = activeFilter === "all" || group.dataset.cat === activeFilter;
    const expanded = group.classList.contains("expanded") || searching;

    group.querySelectorAll(".skill-card").forEach((card) => {
      const matchesTerm = term === "" || card.dataset.name.includes(term);
      const withinLimit = expanded || Number(card.dataset.idx) < 3;
      const show = groupMatchesCat && matchesTerm && withinLimit;
      card.style.display = show ? "block" : "none";
      if (show) visibleCount++;
    });

    group.style.display = groupMatchesCat ? "block" : "none";
    const moreBtn = group.querySelector(".skill-more-btn");
    if (moreBtn) moreBtn.style.display = groupMatchesCat && !searching ? "block" : "none";
  });

  document.getElementById("skillEmpty").classList.toggle("show", visibleCount === 0);
}