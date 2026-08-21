// AutoPrime — Branding Applicator (main site)
// Applies saved client branding (colors, logo, name) to the page.

(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const apply = () => {
      const b = window.BRANDING;
      if (!b) return;

      const root = document.documentElement;
      root.style.setProperty("--gold", b.primary || "#c8a24c");
      root.style.setProperty("--gold-light", b.accent || "#e8cf8f");
      root.style.setProperty("--gold-dark", b.primary ? shade(b.primary, -25) : "#9a7a33");
      root.style.setProperty("--noir", b.dark || "#0a0a0c");
      root.style.setProperty("--noir-2", shade(b.dark || "#0a0a0c", 6));
      root.style.setProperty("--noir-3", shade(b.dark || "#0a0a0c", 16));
      root.style.setProperty("--card", b.card || "#141419");

      // Heading font
      const fontMap = { serif: "'Cormorant Garamond', serif", modern: "'Inter', sans-serif", luxury: "'Playfair Display', serif" };
      root.style.setProperty("--font-serif", fontMap[b.font] || "'Cormorant Garamond', serif");
      root.style.setProperty("--font-head", fontMap[b.font] || "'Cormorant Garamond', serif");

      // Brand name
      const name = b.name || "AUTO PRIME";
      const parts = name.trim().split(/\s+/);
      const first = parts[0] || "AUTO";
      const rest = parts.slice(1).join(" ") || "PRIME";
      document.querySelectorAll(".brand-text").forEach((el) => {
        el.innerHTML = `<em>${escapeHtml(first.toUpperCase())}</em> <span style="color:var(--gold)">${escapeHtml(rest.toUpperCase())}</span>`;
      });

      // Logo image (if provided)
      if (b.logo) {
        document.querySelectorAll(".brand-mark").forEach((el) => {
          el.innerHTML = `<img src="${b.logo}" alt="logo" style="width:34px;height:34px;object-fit:contain;border-radius:50%;" />`;
        });
      }

      // Footer brand
      document.querySelectorAll(".footer-brand .brand-text").forEach((el) => {
        el.innerHTML = `<em>${escapeHtml(first.toUpperCase())}</em> <span style="color:var(--gold)">${escapeHtml(rest.toUpperCase())}</span>`;
      });

      // Title
      document.title = `${name} — Bespoke Luxury Automobiles`;

      // Chat bot greeting name
      const chatTitle = document.querySelector(".chatbot-title h3");
      if (chatTitle) chatTitle.textContent = name + " Concierge";

      // Contact email domain
      const mails = document.querySelectorAll(".contact-method p, .contact-method h4");
      mails.forEach((m) => {
        if (m.textContent.includes("autoprime")) {
          m.textContent = m.textContent.replace(/autoprime/g, first.toLowerCase());
        }
      });
    };

    const escapeHtml = (s) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const shade = (hex, pct) => {
      try {
        const num = parseInt(hex.replace("#", ""), 16);
        let r = (num >> 16) + pct;
        let g = ((num >> 8) & 0xff) + pct;
        let b = (num & 0xff) + pct;
        r = Math.max(0, Math.min(255, r));
        g = Math.max(0, Math.min(255, g));
        b = Math.max(0, Math.min(255, b));
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
      } catch (e) { return hex; }
    };

    if (document.readyState === "complete") apply();
    else window.addEventListener("load", apply);
  });
})();