function esc(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const EDU_KINDS = ["College", "School", "Training", "Other"];

export function renderAboutPanel(content) {
  const about = content.about || {};
  const el = document.getElementById("panel-about");

  el.innerHTML = `
    <p class="lede">Your story, your numbers, your education, and your career timeline.</p>

    <div class="card">
      <div class="card-head"><h3>Bio</h3></div>
      <div class="field"><label>Paragraph 1</label><textarea id="a-p1" style="min-height:96px;">${esc(about.paragraphs?.[0])}</textarea></div>
      <div class="field"><label>Paragraph 2</label><textarea id="a-p2" style="min-height:96px;">${esc(about.paragraphs?.[1])}</textarea></div>
    </div>

    <div class="card">
      <div class="card-head"><h3>Stats row</h3></div>
      <div class="stat-grid" id="statGrid"></div>
      <button class="add-row-btn" id="addStatBtn" type="button"><span class="plus">+</span> Add stat</button>
    </div>

    <div class="card">
      <div class="card-head"><h3>Education</h3><span class="sub">College, school, training</span></div>
      <div id="eduList"></div>
      <button class="add-row-btn" id="addEduBtn" type="button"><span class="plus">+</span> Add education</button>
    </div>

    <div class="card">
      <div class="card-head"><h3>Career timeline</h3></div>
      <div id="timelineRows"></div>
      <button class="add-row-btn" id="addTimelineBtn" type="button"><span class="plus">+</span> Add timeline entry</button>
    </div>

    <button class="btn btn-primary" id="saveAboutBtn">Save About section</button>
  `;

  let stats = [...(about.stats || [])];
  let timeline = [...(about.timeline || [])];
  let education = [...(about.education || [])];
  let openEdu = null; // which education entry is expanded (one at a time)

  function collectAbout() {
    return {
      paragraphs: [document.getElementById("a-p1").value, document.getElementById("a-p2").value],
      stats,
      timeline,
      education,
    };
  }

  /* ---------- Stats ---------- */
  function renderStats() {
    document.getElementById("statGrid").innerHTML = stats
      .map(
        (s, i) => `
        <div class="stat-edit">
          <label>Number</label>
          <input type="text" data-i="${i}" data-k="number" value="${esc(s.number)}">
          <input type="text" class="label-input" data-i="${i}" data-k="label" value="${esc(s.label)}">
          <button class="remove-btn" type="button" data-i="${i}">Remove</button>
        </div>`
      )
      .join("");

    document.querySelectorAll("#statGrid input").forEach((input) =>
      input.addEventListener("input", () => { stats[input.dataset.i][input.dataset.k] = input.value; })
    );
    document.querySelectorAll("#statGrid .remove-btn").forEach((btn) =>
      btn.addEventListener("click", () => { stats.splice(Number(btn.dataset.i), 1); renderStats(); })
    );
  }

  /* ---------- Education (collapsed list, click to edit) ---------- */
  function renderEducation() {
    const list = document.getElementById("eduList");

    if (!education.length) {
      list.innerHTML = `<p class="hint" style="margin-bottom:6px;">No education added yet. Click "Add education" below.</p>`;
      return;
    }

    list.innerHTML = education
      .map(
        (e, i) => `
        <div class="accordion-item ${openEdu === i ? "open" : ""}" data-i="${i}">
          <div class="accordion-head">
            <div class="accordion-title">
              <span class="idx">${String(i + 1).padStart(2, "0")}</span>
              <b class="edu-name">${esc(e.institution) || "Untitled"}</b>
              <span class="meta edu-meta">${esc(e.kind)}</span>
            </div>
            <span class="accordion-caret">▸</span>
          </div>
          <div class="accordion-body">
            <div class="row2">
              <div class="field"><label>Institution</label><input type="text" data-k="institution" value="${esc(e.institution)}"></div>
              <div class="field"><label>Type</label>
                <select data-k="kind">${EDU_KINDS.map((k) => `<option value="${k}" ${e.kind === k ? "selected" : ""}>${k}</option>`).join("")}</select>
              </div>
            </div>
            <div class="row2">
              <div class="field"><label>Course / degree</label><input type="text" data-k="course" value="${esc(e.course)}" placeholder="B.E. Computer Science"></div>
              <div class="field"><label>Period</label><input type="text" data-k="period" value="${esc(e.period)}" placeholder="2022 — 2026"></div>
            </div>
            <div class="field"><label>Details (optional)</label><input type="text" data-k="details" value="${esc(e.details)}" placeholder="e.g. CGPA 8.2 · Chennai"></div>
            <div class="accordion-actions">
              <button class="btn btn-danger-ghost btn-sm remove-edu" type="button">Delete</button>
              <button class="btn btn-primary btn-sm save-edu" type="button">Save</button>
            </div>
          </div>
        </div>`
      )
      .join("");

    list.querySelectorAll(".accordion-item").forEach((item) => {
      const i = Number(item.dataset.i);

      item.querySelector(".accordion-head").addEventListener("click", () => {
        const wasOpen = item.classList.contains("open");
        list.querySelectorAll(".accordion-item").forEach((x) => x.classList.remove("open"));
        if (!wasOpen) item.classList.add("open");
        openEdu = wasOpen ? null : i;
      });

      item.querySelectorAll("[data-k]").forEach((f) => {
        const evt = f.tagName === "SELECT" ? "change" : "input";
        f.addEventListener(evt, () => {
          education[i][f.dataset.k] = f.value;
          if (f.dataset.k === "institution") item.querySelector(".edu-name").textContent = f.value || "Untitled";
          if (f.dataset.k === "kind") item.querySelector(".edu-meta").textContent = f.value;
        });
      });

      item.querySelector(".remove-edu").addEventListener("click", async (e) => {
        e.stopPropagation();
        education.splice(i, 1);
        openEdu = null;
        renderEducation();
        await window.__saveContent({ about: collectAbout() }, "Deleted successfully");
      });

      item.querySelector(".save-edu").addEventListener("click", async (e) => {
        e.stopPropagation();
        await window.__saveContent({ about: collectAbout() });
      });
    });
  }

  /* ---------- Timeline ---------- */
  function renderTimeline() {
    document.getElementById("timelineRows").innerHTML = timeline
      .map(
        (t, i) => `
      <div class="list-row">
        <div class="list-fields">
          <div class="row2">
            <div class="field"><label>Years</label><input type="text" data-i="${i}" data-k="years" value="${esc(t.years)}"></div>
            <div class="field"><label>Role title</label><input type="text" data-i="${i}" data-k="title" value="${esc(t.title)}"></div>
          </div>
          <div class="field"><label>Description</label><textarea data-i="${i}" data-k="description">${esc(t.description)}</textarea></div>
        </div>
        <button class="remove-btn" type="button" data-i="${i}">Remove</button>
      </div>`
      )
      .join("");

    document.querySelectorAll("#timelineRows input, #timelineRows textarea").forEach((f) =>
      f.addEventListener("input", () => { timeline[f.dataset.i][f.dataset.k] = f.value; })
    );
    document.querySelectorAll("#timelineRows .remove-btn").forEach((btn) =>
      btn.addEventListener("click", () => { timeline.splice(Number(btn.dataset.i), 1); renderTimeline(); })
    );
  }

  renderStats();
  renderEducation();
  renderTimeline();

  document.getElementById("addStatBtn").addEventListener("click", () => {
    stats.push({ number: "", label: "" });
    renderStats();
  });

  document.getElementById("addEduBtn").addEventListener("click", () => {
    education.push({ kind: "College", period: "", institution: "", course: "", details: "" });
    openEdu = education.length - 1; // open the new entry so you can type straight away
    renderEducation();
    document.querySelector(`#eduList .accordion-item[data-i="${openEdu}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  document.getElementById("addTimelineBtn").addEventListener("click", () => {
    timeline.push({ years: "", title: "", description: "" });
    renderTimeline();
  });

  document.getElementById("saveAboutBtn").addEventListener("click", async () => {
    await window.__saveContent({ about: collectAbout() });
  });
}