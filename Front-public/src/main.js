import { fetchContent } from "./api.js";
import { initCore, initReveal, initSearch } from "./core.js";
import { renderBranding } from "./sections/branding.js";
import { renderHero } from "./sections/hero.js";
import { renderAbout } from "./sections/about.js";
import { renderSkills } from "./sections/skills.js";
import { renderProjects } from "./sections/projects.js";
import { renderCertificates } from "./sections/certificates.js";
import { renderContact } from "./sections/contact.js";

initCore();

fetchContent()
  .then((content) => {
    renderBranding(content.site);
    renderHero(content.hero);
    renderAbout(content.about);
    renderSkills(content.skills);
    renderProjects(content.projects);
    renderCertificates(content.certificates);
    renderContact(content.contact);
    initSearch(content);
    initReveal();
  })
  .catch((err) => console.error("Failed to load portfolio content:", err));