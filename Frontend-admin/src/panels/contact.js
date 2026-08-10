export function renderContactPanel(content) {
  const contact = content.contact || {};
  const el = document.getElementById("panel-contact");

  el.innerHTML = `
    <p class="lede">Where visitors can reach you.</p>
    <div class="card">
      <div class="card-head"><h3>Contact details</h3></div>
      <div class="row2">
        <div class="field"><label>Email address</label><input type="email" id="c-email" value="${contact.email || ""}"></div>
        <div class="field"><label>Location</label><input type="text" id="c-location" value="${contact.location || ""}"></div>
      </div>
      <div class="row2">
        <div class="field"><label>LinkedIn</label><input type="text" id="c-linkedin" value="${contact.linkedin || ""}"></div>
        <div class="field"><label>GitHub</label><input type="text" id="c-github" value="${contact.github || ""}"></div>
      </div>
      <div class="field"><label>Availability note</label><input type="text" id="c-availability" value="${contact.availability || ""}"></div>
    </div>
    <div class="card">
      <div class="switch-row">
        <div class="label"><b>Show contact form</b><span>Turn off to hide the message form and show only your details</span></div>
        <label class="switch"><input type="checkbox" id="c-showform" ${contact.showForm ? "checked" : ""}><span class="slider"></span></label>
      </div>
    </div>
    <button class="btn btn-primary" id="saveContactBtn">Save Contact section</button>
  `;

  document.getElementById("saveContactBtn").addEventListener("click", () => {
    const contact = {
      email: document.getElementById("c-email").value,
      location: document.getElementById("c-location").value,
      linkedin: document.getElementById("c-linkedin").value,
      github: document.getElementById("c-github").value,
      availability: document.getElementById("c-availability").value,
      showForm: document.getElementById("c-showform").checked,
    };
    window.__saveContent({ contact });
  });
}