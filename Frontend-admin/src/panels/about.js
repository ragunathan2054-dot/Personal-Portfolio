export function renderAboutPanel(content) {
  const about = content.about || {};
  const el = document.getElementById("panel-about");

  el.innerHTML = `
    <p class="lede">Your story, your numbers, your career timeline.</p>
    <div class="card">
      <div class="card-head"><h3>Bio</h3></div>
      <div class="field"><label>Paragraph 1</label><textarea id="a-p1" style="min-height:96px;">${about.paragraphs?.[0] || ""}</textarea></div>
      <div class="field"><label>Paragraph 2</label><textarea id="a-p2" style="min-height:96px;">${about.paragraphs?.[1] || ""}</textarea></div>
    </div>

    <div class="card">
      <div class="card-head"><h3>Stats row</h3></div>
      <div class="stat-grid" id="statGrid"></div>
    </div>

    <div class="card">
      <div class="card-head"><h3>Career timeline</h3></div>
      <div id="timelineRows"></div>
      <button class="add-row-btn" id="addTimelineBtn"><span class="plus">+</span> Add timeline entry</button>
    </div>

    <button class="btn btn-primary" id="saveAboutBtn">Save About section</button>
  `;

  let stats = [...(about.stats || [])];
  let timeline = [...(about.timeline || [])];

  function renderStats() {
    document.getElementById("statGrid").innerHTML = stats
      .map((s, i) => `<div class="stat-edit"><label>Number</label><input data-i="${i}" data-k="number" value="${s.number}"><input class="label-input" data-i="${i}" data-k="label" value="${s.label}"></div>`)
      .join("");
    document.querySelectorAll("#statGrid input").forEach((input) =>
      input.addEventListener("input", () => { stats[input.dataset.i][input.dataset.k] = input.value; })
    );
  }
  function renderTimeline() {
    document.getElementById("timelineRows").innerHTML = timeline
      .map((t, i) => `
        <div class="list-row">
          <div class="list-fields">
            <div class="row2">
              <div class="field"><label>Years</label><input data-i="${i}" data-k="years" value="${t.years}"></div>
              <div class="field"><label>Role title</label><input data-i="${i}" data-k="title" value="${t.title}"></div>
            </div>
            <div class="field"><label>Description</label><textarea data-i="${i}" data-k="description">${t.description}</textarea></div>
          </div>
          <button class="remove-btn" data-i="${i}">Remove</button>
        </div>`)
      .join("");
    document.querySelectorAll("#timelineRows input, #timelineRows textarea").forEach((f) =>
      f.addEventListener("input", () => { timeline[f.dataset.i][f.dataset.k] = f.value; })
    );
    document.querySelectorAll("#timelineRows .remove-btn").forEach((btn) =>
      btn.addEventListener("click", () => { timeline.splice(Number(btn.dataset.i), 1); renderTimeline(); })
    );
  }
  renderStats();
  renderTimeline();

  document.getElementById("addTimelineBtn").addEventListener("click", () => {
    timeline.push({ years: "", title: "", description: "" });
    renderTimeline();
  });

  document.getElementById("saveAboutBtn").addEventListener("click", async () => {
    const about = {
      paragraphs: [document.getElementById("a-p1").value, document.getElementById("a-p2").value],
      stats, timeline,
    };
    await window.__saveContent({ about });
  });
}