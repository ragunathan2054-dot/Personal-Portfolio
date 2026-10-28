import { escapeHtml } from "../api.js";

export function renderAbout(about = {}) {
  document.getElementById("aboutP1").textContent = about.paragraphs?.[0] || "";
  document.getElementById("aboutP2").textContent = about.paragraphs?.[1] || "";

  const statsEl = document.getElementById("aboutStats");
  statsEl.innerHTML = (about.stats || [])
    .map((s) => `<div class="stat"><div class="num">${escapeHtml(s.number)}</div><div class="label">${escapeHtml(s.label)}</div></div>`)
    .join("");
  let eduEl = document.getElementById("aboutEducation");
  if (!eduEl) {
    eduEl = document.createElement("div");
    eduEl.id = "aboutEducation";
    statsEl.insertAdjacentElement("afterend", eduEl);
  }
  const education = (about.education || []).filter((e) => e.institution);
  eduEl.className = "edu-block";
  eduEl.innerHTML = education.length
    ? `<div class="eyebrow">Education</div>` +
      education
        .map((e) => {
          const meta = [e.period, e.kind].filter(Boolean).map(escapeHtml).join(" · ");
          return `
            <div class="edu-item">
              ${meta ? `<div class="edu-period">${meta}</div>` : ""}
              <h3>${escapeHtml(e.institution)}</h3>
              ${e.course ? `<div class="edu-course">${escapeHtml(e.course)}</div>` : ""}
              ${e.details ? `<div class="edu-detail">${escapeHtml(e.details)}</div>` : ""}
            </div>`;
        })
        .join("")
    : "";

  document.getElementById("aboutTimeline").innerHTML = (about.timeline || [])
    .map((t) => `<div class="t-item"><div class="yr">${escapeHtml(t.years)}</div><h3>${escapeHtml(t.title)}</h3><p>${escapeHtml(t.description)}</p></div>`)
    .join("");
}