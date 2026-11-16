import { fetchContent } from "./api.js";
import { initCore, initReveal, refreshReveal, initSearch, playHeroIntro } from "./core.js";
import { showSkeletons, showLoadError, hideLoadError } from "./loading.js";
import { renderBranding } from "./sections/branding.js";
import { renderHero } from "./sections/hero.js";
import { renderAbout } from "./sections/about.js";
import { renderSkills } from "./sections/skills.js";
import { renderProjects } from "./sections/projects.js";
import { renderCertificates } from "./sections/certificates.js";
import { renderContact } from "./sections/contact.js";

initCore();
showSkeletons();
playHeroIntro();
// Section headings animate in on scroll right away, not only after data loads.
initReveal();

function load() {
  fetchContent()
    .then((content) => {
      hideLoadError();
      renderBranding(content.site);
      renderHero(content.hero);
      renderAbout(content.about);
      renderSkills(content.skills || []);
      renderProjects(content.projects || []);
      renderCertificates(content.certificates);
      renderContact(content.contact || {});
      initSearch(content);
      refreshReveal();
    })
    .catch((err) => {
      console.error("Failed to load portfolio content:", err);
      showLoadError(load);
    });
}

load();
