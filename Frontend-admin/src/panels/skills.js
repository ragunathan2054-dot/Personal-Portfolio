const CATS = [
  { v: "cloud", l: "Cloud & DevOps" }, { v: "dev", l: "Development" },
  { v: "design", l: "Design" }, { v: "sec", l: "Security" },
];

// Escapes text before it goes into HTML, so quotes or < > in your text can't break the forms.
function esc(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderSkillsPanel(content) {
  let skills = [...(content.skills || [])];
  let openIndex = null; // which skill is expanded (one at a time)

  const el = document.getElementById("panel-skills");
  el.innerHTML = `
    <p class="lede">Every skill shown on your public page. Click one to edit it.</p>
    <div class="card" id="skillList"></div>
    <button class="add-row-btn" id="addSkillBtn" type="button"><span class="plus">+</span> Add skill</button>
    <button class="btn btn-primary" id="saveSkillsBtn" style="margin-top:16px;">Save Skills</button>
  `;

  // Every search below uses `list`, never `document`, so this panel can't
  // touch the accordion rows that belong to other panels (Education, Certificates...).
  const list = el.querySelector("#skillList");

  function metaText(s) {
    return `${s.years || ""} · ${s.level || 0}%`;
  }

  function render() {
    if (!skills.length) {
      list.innerHTML = `<p class="lede" style="margin-bottom:0;">No skills yet. Click "Add skill" below.</p>`;
      return;
    }

    list.innerHTML = skills
      .map(
        (s, i) => `
        <div class="accordion-item ${openIndex === i ? "open" : ""}" data-i="${i}">
          <div class="accordion-head">
            <div class="accordion-title">
              <span class="idx">${String(i + 1).padStart(2, "0")}</span>
              <b class="skill-title">${esc(s.name) || "Untitled"}</b>
              <span class="meta skill-meta">${esc(metaText(s))}</span>
            </div>
            <span class="accordion-caret">▸</span>
          </div>
          <div class="accordion-body">
            <div class="row3">
              <div class="field"><label>Skill name</label><input type="text" data-k="name" value="${esc(s.name)}"></div>
              <div class="field"><label>Years</label><input type="text" data-k="years" value="${esc(s.years)}"></div>
              <div class="field"><label>Category</label>
                <select data-k="category">${CATS.map((c) => `<option value="${c.v}" ${s.category === c.v ? "selected" : ""}>${c.l}</option>`).join("")}</select>
              </div>
            </div>
            <div class="field"><label>Proficiency</label>
              <div class="level-row"><input type="range" data-k="level" min="0" max="100" value="${Number(s.level) || 0}"><span class="val">${Number(s.level) || 0}%</span></div>
            </div>
            <div class="field"><label>Short description</label><input type="text" data-k="description" value="${esc(s.description)}"></div>
            <div class="field"><label>Used in project</label><input type="text" data-k="usedIn" value="${esc(s.usedIn)}"></div>
            <div class="field"><label>Detail note (shown on flip)</label><textarea data-k="note">${esc(s.note)}</textarea></div>
            <div class="accordion-actions">
              <button class="btn btn-danger-ghost btn-sm remove-skill" type="button">Delete skill</button>
              <button class="btn btn-primary btn-sm save-skill" type="button">Save</button>
            </div>
          </div>
        </div>`
      )
      .join("");

    list.querySelectorAll(".accordion-item").forEach((item) => {
      const i = Number(item.dataset.i);

      // Click the header: open this one, close the others.
      item.querySelector(".accordion-head").addEventListener("click", () => {
        const wasOpen = item.classList.contains("open");
        list.querySelectorAll(".accordion-item").forEach((x) => x.classList.remove("open"));
        if (!wasOpen) item.classList.add("open");
        openIndex = wasOpen ? null : i;
      });

      // Typing updates the data, and the header text updates live.
      item.querySelectorAll("[data-k]").forEach((f) => {
        const evt = f.tagName === "SELECT" ? "change" : "input";
        f.addEventListener(evt, () => {
          const key = f.dataset.k;
          skills[i][key] = f.type === "range" ? Number(f.value) : f.value;

          if (f.type === "range") item.querySelector(".val").textContent = f.value + "%";
          if (key === "name") item.querySelector(".skill-title").textContent = f.value || "Untitled";
          if (key === "years" || key === "level") item.querySelector(".skill-meta").textContent = metaText(skills[i]);
        });
      });

      item.querySelector(".remove-skill").addEventListener("click", async (e) => {
        e.stopPropagation();
        skills.splice(i, 1);
        openIndex = null;
        render();
        await window.__saveContent({ skills }, "Deleted successfully");
      });

      item.querySelector(".save-skill").addEventListener("click", async (e) => {
        e.stopPropagation();
        await window.__saveContent({ skills });
      });
    });
  }

  render();

  document.getElementById("addSkillBtn").addEventListener("click", () => {
    skills.push({ name: "", category: "cloud", level: 50, years: "", description: "", usedIn: "", note: "" });
    openIndex = skills.length - 1; // open the new skill so you can type straight away
    render();
    list.querySelector(`.accordion-item[data-i="${openIndex}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  document.getElementById("saveSkillsBtn").addEventListener("click", () => window.__saveContent({ skills }));
}