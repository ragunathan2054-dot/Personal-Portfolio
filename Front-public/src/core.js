import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

export function initCore() {
  const progress = document.getElementById("progress");
  const nav = document.getElementById("navbar");
  const toTop = document.getElementById("toTop");

  window.addEventListener("scroll", () => {
    const h = document.documentElement;
    const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
    progress.style.width = pct + "%";
    nav.classList.toggle("scrolled", h.scrollTop > 20);
    toTop.classList.toggle("show", h.scrollTop > 600);
  });
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  const navLinks = document.querySelectorAll(".nav-links a");
  const sections = document.querySelectorAll("section[id]");
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          navLinks.forEach((l) => l.classList.toggle("active", l.dataset.sec === e.target.id));
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  sections.forEach((s) => obs.observe(s));

  document.getElementById("themeToggle").addEventListener("click", () => {
    const root = document.documentElement;
    root.setAttribute("data-theme", root.getAttribute("data-theme") === "dark" ? "light" : "dark");
  });
}

export function initReveal() {
  document.querySelectorAll(".reveal").forEach((el) => {
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 28 },
      { autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 85%" } }
    );
  });
}

// Real search modal matching the site's own design — builds a searchable
// index from skills, projects, and certificates once, then filters live as you type.
export function initSearch(content) {
  const overlay = document.getElementById("searchOverlay");
  const input = document.getElementById("searchModalInput");
  const results = document.getElementById("searchResults");
  const btn = document.getElementById("searchBtn");

  const index = [
    ...(content.skills || []).map((s) => ({ type: "Skill", name: s.name, target: "skills" })),
    ...(content.projects || []).map((p) => ({ type: "Project", name: p.title, target: "projects" })),
    ...(content.certificates || []).map((c) => ({ type: "Certificate", name: c.name, target: "certs" })),
  ];

  function openModal() {
    overlay.classList.add("open");
    input.value = "";
    input.focus();
    renderResults("");
  }
  function closeModal() {
    overlay.classList.remove("open");
  }

  function renderResults(term) {
    const t = term.trim().toLowerCase();
    const matches = t === "" ? index.slice(0, 6) : index.filter((i) => i.name.toLowerCase().includes(t));

    if (!matches.length) {
      results.innerHTML = `<div class="search-empty">No results for "${term}"</div>`;
      return;
    }

    results.innerHTML = matches
      .map((m, i) => `<div class="search-result-item ${i === 0 ? "active" : ""}" data-target="${m.target}"><span class="rname">${m.name}</span><span class="rtype">${m.type}</span></div>`)
      .join("");

    results.querySelectorAll(".search-result-item").forEach((item) => {
      item.addEventListener("click", () => {
        document.getElementById(item.dataset.target).scrollIntoView({ behavior: "smooth" });
        closeModal();
      });
    });
  }

  btn.addEventListener("click", openModal);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });

  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      openModal();
    }
    if (e.key === "Escape") closeModal();
  });

  input.addEventListener("input", () => renderResults(input.value));
} 