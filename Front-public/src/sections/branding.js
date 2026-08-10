export function renderBranding(site = {}) {
  document.getElementById("navLogo").textContent = site.logoText || "AK";

  const svg = document.getElementById("idSvg");
  const photo = document.getElementById("idPhotoFull");

  if (site.heroPhotoUrl) {
    svg.style.display = "none";
    photo.src = site.heroPhotoUrl;
    photo.style.display = "block";
  } else {
    svg.style.display = "block";
    photo.style.display = "none";
    photo.src = "";
    document.getElementById("heroBadgeText").textContent = site.heroBadgeText || "AK";
  }
}