import { apiFetch } from "./api.js";
import { showToast } from "./toast.js";
import { renderHeroPanel } from "./panels/hero.js";
import { renderAboutPanel } from "./panels/about.js";
import { renderSkillsPanel } from "./panels/skills.js";
import { renderProjectsPanel } from "./panels/projects.js";
import { renderCertificatesPanel } from "./panels/certificates.js";
import { renderContactPanel } from "./panels/contact.js";
import { renderMessagesPanel } from "./panels/messages.js";
import { renderAccountPanel } from "./panels/account.js";

const titles = {
  hero: "Hero section", about: "About & timeline", skills: "Skills",
  projects: "Projects", certs: "Certificates", contact: "Contact",
  messages: "Messages", account: "Account settings",
};

let currentContent = null;

function showPanel(key) {
  document.querySelectorAll(".panel").forEach((p) => p.classList.toggle("active", p.id === "panel-" + key));
  document.querySelectorAll(".navlist button[data-panel]").forEach((b) => b.classList.toggle("active", b.dataset.panel === key));
  document.getElementById("panel-title").textContent = titles[key];
}

document.querySelectorAll(".navlist button[data-panel]").forEach((btn) =>
  btn.addEventListener("click", () => showPanel(btn.dataset.panel))
);

function syncSidebarLogo() {
  const text = currentContent?.site?.logoText || "AK";
  document.getElementById("sidebarLogoMark").textContent = text;
}

window.__saveContent = async (partial, successMessage = "Saved successfully") => {
  const pill = document.getElementById("statusPill");
  try {
    currentContent = { ...currentContent, ...partial };
    const updated = await apiFetch("/content", { method: "PUT", body: JSON.stringify(currentContent) });
    currentContent = updated;
    syncSidebarLogo();
    pill.classList.remove("error");
    pill.innerHTML = `<span class="dot"></span>All changes saved`;
    showToast(successMessage);
  } catch (err) {
    pill.classList.add("error");
    pill.innerHTML = `<span class="dot"></span>Save failed`;
    showToast(err.message || "Save failed", "error");
    console.error("Save failed:", err);
  }
};

window.__signOut = async () => {
  await apiFetch("/auth/logout", { method: "POST" });
  window.location.href = "/login.html";
};

document.getElementById("signOutBtn").addEventListener("click", () => window.__signOut());

function safeRender(label, fn) {
  try {
    fn();
  } catch (err) {
    console.error(`[${label} panel failed to render]`, err);
    showToast(`${label} panel error: ${err.message}`, "error");
  }
}

async function init() {
  let meRes;
  try {
    meRes = await apiFetch("/auth/me");
  } catch (err) {
    window.location.href = "/login.html";
    return;
  }

  document.getElementById("authChecking").style.display = "none";
  document.getElementById("shell").style.display = "flex";
  document.getElementById("sidebarName").textContent = meRes.user.email;
  document.getElementById("viewPublicLink").href = import.meta.env.VITE_PUBLIC_SITE_URL || "http://localhost:5173";

  try {
    currentContent = await apiFetch("/content");
  } catch (err) {
    console.error("Failed to load content:", err);
    showToast(`Failed to load content: ${err.message}`, "error");
    currentContent = {};
  }

  syncSidebarLogo(); // set it on initial load, not just after saving

  safeRender("Hero", () => renderHeroPanel(currentContent));
  safeRender("About", () => renderAboutPanel(currentContent));
  safeRender("Skills", () => renderSkillsPanel(currentContent));
  safeRender("Projects", () => renderProjectsPanel(currentContent));
  safeRender("Certificates", () => renderCertificatesPanel(currentContent));
  safeRender("Contact", () => renderContactPanel(currentContent));
  safeRender("Messages", () => renderMessagesPanel());
  safeRender("Account", () => renderAccountPanel(meRes.user));
}

init();