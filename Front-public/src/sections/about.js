export function renderAbout(about) {
  document.getElementById("aboutP1").textContent = about.paragraphs?.[0] || "";
  document.getElementById("aboutP2").textContent = about.paragraphs?.[1] || "";

  document.getElementById("aboutStats").innerHTML = (about.stats || [])
    .map((s) => `<div class="stat"><div class="num">${s.number}</div><div class="label">${s.label}</div></div>`)
    .join("");

  document.getElementById("aboutTimeline").innerHTML = (about.timeline || [])
    .map((t) => `<div class="t-item"><div class="yr">${t.years}</div><h3>${t.title}</h3><p>${t.description}</p></div>`)
    .join("");
}