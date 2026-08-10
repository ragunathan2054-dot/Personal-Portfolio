const CATS = [
  { v: "cloud", l: "Cloud & DevOps" }, { v: "dev", l: "Development" },
  { v: "design", l: "Design" }, { v: "sec", l: "Security" },
];

export function renderSkillsPanel(content) {
  let skills = [...(content.skills || [])];
  const el = document.getElementById("panel-skills");
  el.innerHTML = `<p class="lede">Every skill shown on your public page. Click one to edit it.</p><div class="card" id="skillList"></div><button class="add-row-btn" id="addSkillBtn"><span class="plus">+</span> Add skill</button><button class="btn btn-primary" id="saveSkillsBtn" style="margin-top:16px;">Save Skills</button>`;

  function render() {
    document.getElementById("skillList").innerHTML = skills
      .map((s, i) => `
        <div class="accordion-item" data-i="${i}">
          <div class="accordion-head"><div class="accordion-title"><span class="idx">${String(i + 1).padStart(2, "0")}</span><b>${s.name || "Untitled"}</b><span class="meta">${s.years || ""} · ${s.level || 0}%</span></div><span class="accordion-caret">▸</span></div>
          <div class="accordion-body">
            <div class="row3">
              <div class="field"><label>Skill name</label><input data-k="name" value="${s.name || ""}"></div>
              <div class="field"><label>Years</label><input data-k="years" value="${s.years || ""}"></div>
              <div class="field"><label>Category</label>
                <select data-k="category">${CATS.map((c) => `<option value="${c.v}" ${s.category === c.v ? "selected" : ""}>${c.l}</option>`).join("")}</select>
              </div>
            </div>
            <div class="field"><label>Proficiency</label><div class="level-row"><input type="range" data-k="level" min="0" max="100" value="${s.level || 0}"><span class="val">${s.level || 0}%</span></div></div>
            <div class="field"><label>Short description</label><input data-k="description" value="${s.description || ""}"></div>
            <div class="field"><label>Used in project</label><input data-k="usedIn" value="${s.usedIn || ""}"></div>
            <div class="field"><label>Detail note (shown on flip)</label><textarea data-k="note">${s.note || ""}</textarea></div>
            <div class="accordion-actions"><button class="btn btn-danger-ghost btn-sm remove-skill">Delete skill</button><button class="btn btn-primary btn-sm save-skill">Save</button></div>
          </div>
        </div>`)
      .join("");

    document.querySelectorAll(".accordion-head").forEach((head) =>
      head.addEventListener("click", () => head.parentElement.classList.toggle("open"))
    );

    document.querySelectorAll(".accordion-item").forEach((item) => {
      const i = Number(item.dataset.i);

      item.querySelectorAll("[data-k]").forEach((f) => {
        f.addEventListener("input", () => {
          skills[i][f.dataset.k] = f.type === "range" ? Number(f.value) : f.value;
          if (f.type === "range") item.querySelector(".val").textContent = f.value + "%";
        });
      });

      item.querySelector(".remove-skill").addEventListener("click", async (e) => {
        e.stopPropagation();
        skills.splice(i, 1);
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
    render();
  });

  document.getElementById("saveSkillsBtn").addEventListener("click", () => window.__saveContent({ skills }));
}