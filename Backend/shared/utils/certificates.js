// Turns an "issued" value into a sortable timestamp. Accepts what people
// actually type: "2026", "Mar 2025", "2025-03", "03/2025", "2025-03-14".
// Returns -Infinity when it can't be read, so those sort last.
export function issuedTime(value) {
  const s = String(value || "").trim();
  if (!s) return -Infinity;
  if (/^\d{4}$/.test(s)) return Date.UTC(Number(s), 0, 1);
  const mmYyyy = s.match(/^(\d{1,2})[/.-](\d{4})$/);
  if (mmYyyy) return Date.UTC(Number(mmYyyy[2]), Number(mmYyyy[1]) - 1, 1);
  const t = Date.parse(s);
  return Number.isNaN(t) ? -Infinity : t;
}

// Public list: only visible certificates, by manual order (if set), then
// newest issued first. Ties keep "most recently added first".
export function publicCertificates(certificates = []) {
  return certificates
    .map((c, index) => ({ c, index }))
    .filter(({ c }) => c.isVisible !== false)
    .sort((a, b) => {
      const ao = typeof a.c.order === "number" ? a.c.order : null;
      const bo = typeof b.c.order === "number" ? b.c.order : null;
      if (ao !== null && bo !== null && ao !== bo) return ao - bo;
      if (ao !== null && bo === null) return -1;
      if (ao === null && bo !== null) return 1;
      const byDate = issuedTime(b.c.issued) - issuedTime(a.c.issued);
      if (byDate !== 0 && !Number.isNaN(byDate)) return byDate;
      return b.index - a.index;
    })
    .map(({ c }) => c);
}
