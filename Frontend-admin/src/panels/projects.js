export function renderProjectsPanel(content) {
  let projects = [...(content.projects || [])];
  const el = document.getElementById("panel-projects");
  el.innerHTML = `<p class="lede">Each project card, in full detail.</p><div class="card" id="projList"></div><button class="add-row-btn" id="addProjBtn"><span class="plus">+</span> Add project</button><button class="btn btn-primary" id="saveProjBtn" style="margin-top:16px;">Save Projects</button>`;
  function toArray(val) {
    if (Array.isArray(val)) return val;
    if (typeof val === "string" && val.trim()) return val.split(",").map((s) => s.trim());
    return [];
  }

  function render() {
    document.getElementById("projList").innerHTML = projects
      .map((p, i) => `
        <div class="accordion-item" data-i="${i}">
          <div class="accordion-head"><div class="accordion-title"><span class="idx">${String(i + 1).padStart(2, "0")}</span><b>${p.title || "Untitled"}</b><span class="meta">${p.status || ""}</span></div><span class="accordion-caret">▸</span></div>
          <div class="accordion-body">
            <div class="row2">
              <div class="field"><label>Title</label><input data-k="title" value="${p.title || ""}"></div>
              <div class="field"><label>Tag</label><input data-k="tag" value="${p.tag || ""}"></div>
            </div>
            <div class="field"><label>Short description</label><textarea data-k="desc">${p.desc || ""}</textarea></div>
            <div class="row3">
              <div class="field"><label>Status</label><input data-k="status" value="${p.status || ""}"></div>
              <div class="field"><label>Version</label><input data-k="version" value="${p.version || ""}"></div>
              <div class="field"><label>Commits</label><input data-k="commits" value="${p.commits || ""}"></div>
            </div>
            <div class="field"><label>Tech stack (comma separated)</label><input data-k="stack" value="${toArray(p.stack).join(", ")}"></div>
            <div class="field"><label>Features (one per line)</label><textarea data-k="features">${toArray(p.features).join("\n")}</textarea></div>
            <div class="row2">
              <div class="field"><label>Challenge</label><textarea data-k="challenge">${p.challenge || ""}</textarea></div>
              <div class="field"><label>Solution</label><textarea data-k="solution">${p.solution || ""}</textarea></div>
            </div>
            <div class="row2">
              <div class="field"><label>Live demo link</label><input data-k="demo" value="${p.demo || ""}"></div>
              <div class="field"><label>GitHub repo link</label><input data-k="repo" value="${p.repo || ""}"></div>
            </div>
            <div class="accordion-actions"><button class="btn btn-danger-ghost btn-sm remove-proj">Delete project</button><button class="btn btn-primary btn-sm save-proj">Save</button></div>
          </div>
        </div>`)
      .join("");

    el.querySelectorAll(".accordion-head").forEach((h) => h.addEventListener("click", () => h.parentElement.classList.toggle("open")));

    el.querySelectorAll(".accordion-item").forEach((item) => {
      const i = Number(item.dataset.i);

      item.querySelectorAll("[data-k]").forEach((f) => {
        f.addEventListener("input", () => {
          if (f.dataset.k === "stack") projects[i].stack = f.value.split(",").map((s) => s.trim()).filter(Boolean);
          else if (f.dataset.k === "features") projects[i].features = f.value.split("\n").map((s) => s.trim()).filter(Boolean);
          else projects[i][f.dataset.k] = f.value;
        });
      });

      item.querySelector(".remove-proj").addEventListener("click", async (e) => {
        e.stopPropagation();
        projects.splice(i, 1);
        render();
        await window.__saveContent({ projects }, "Deleted successfully");
      });

      item.querySelector(".save-proj").addEventListener("click", async (e) => {
        e.stopPropagation();
        await window.__saveContent({ projects });
      });
    });
  }
  render();

  document.getElementById("addProjBtn").addEventListener("click", () => {
    projects.push({ title: "", tag: "", desc: "", status: "", version: "", commits: "", stack: [], features: [], challenge: "", solution: "", demo: "", repo: "" });
    render();
  });

  document.getElementById("saveProjBtn").addEventListener("click", () => window.__saveContent({ projects }));
}