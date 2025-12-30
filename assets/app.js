/* =========================
   PrimaClean – App JS
   - Theme toggle (stores preference)
   - Mobile menu
   - Reveal (IntersectionObserver) – ONE animation type
   - Forms: mailto fallback + WhatsApp quick
   - Contact config in one place
   ========================= */

const CONFIG = {
  phoneDisplay: "+49 391 000 000 0",
  phoneTel: "+493910000000",
  email: "info@primaclean-magdeburg.de",
  whatsappNumber: "493910000000", // no +
  // Optional: real form endpoint (recommended for production):
  // formEndpoint: "https://formspree.io/f/XXXXXXX"
  formEndpoint: "" // leave empty => mailto fallback
};

const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

/* Year */
const y = $("#year");
if (y) y.textContent = String(new Date().getFullYear());

/* Theme toggle */
const toggle = $("#themeToggle");
if (toggle) {
  toggle.addEventListener("click", () => {
    const root = document.documentElement;
    const cur = root.getAttribute("data-theme") || "light";
    const next = cur === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("pc_theme", next);
  });
}

/* Mobile menu */
const burger = $("#burger");
const mobileNav = $("#mobileNav");
if (burger && mobileNav) {
  burger.addEventListener("click", () => {
    const open = !mobileNav.hasAttribute("hidden");
    if (open) {
      mobileNav.setAttribute("hidden", "");
      burger.setAttribute("aria-expanded", "false");
    } else {
      mobileNav.removeAttribute("hidden");
      burger.setAttribute("aria-expanded", "true");
    }
  });

  $$("#mobileNav a").forEach(a => a.addEventListener("click", () => {
    mobileNav.setAttribute("hidden", "");
    burger.setAttribute("aria-expanded", "false");
  }));
}

/* Reveal */
const io = ("IntersectionObserver" in window)
  ? new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add("is-visible");
      });
    }, { threshold: 0.12 })
  : null;

$$(".reveal").forEach(el => {
  if (!io) el.classList.add("is-visible");
  else io.observe(el);
});

/* WhatsApp quick link (home form) */
const waQuick = $("#waQuick");
if (waQuick) {
  const base = `https://wa.me/${CONFIG.whatsappNumber}`;
  const text = "Hallo PrimaClean, ich möchte eine Reinigungsanfrage stellen.";
  waQuick.href = `${base}?text=${encodeURIComponent(text)}`;
}

/* Contact page direct CTAs */
const ctaCall = $("#ctaCall");
if (ctaCall) ctaCall.href = `tel:${CONFIG.phoneTel}`;
const ctaWA = $("#ctaWA");
if (ctaWA) ctaWA.href = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent("Hallo PrimaClean, ich möchte eine Reinigungsanfrage stellen.")}`;
const ctaMail = $("#ctaMail");
if (ctaMail) ctaMail.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent("Reinigungsanfrage – PrimaClean")}`;

/* Impressum placeholders */
const impPhone = $("#impPhone");
if (impPhone) impPhone.textContent = CONFIG.phoneDisplay;
const impMail = $("#impMail");
if (impMail) impMail.textContent = CONFIG.email;

/* Forms: send to endpoint if set, else mailto */
function validateRequired(fields) {
  for (const el of fields) {
    if (!el) continue;
    const v = String(el.value || "").trim();
    if (!v) {
      el.focus();
      return { ok: false, el };
    }
  }
  return { ok: true, el: null };
}

function buildMessage(data) {
  return `Hallo PrimaClean,

ich möchte eine Reinigungsanfrage stellen.

Service: ${data.service}
Rhythmus: ${data.rhythmus}
Fläche: ${data.flaeche}
Start: ${data.start}

Hinweise:
${data.note}

Kontaktdaten:
Name: ${data.name}
Telefon: ${data.phone}
E-Mail: ${data.email}

Viele Grüße
${data.name}`;
}

async function submitToEndpoint(endpoint, payload) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Form endpoint error");
  return true;
}

/* Home lead form */
const leadForm = $("#leadForm");
if (leadForm) {
  leadForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const service = $("#service");
    const rhythmus = $("#rhythmus");
    const start = $("#start");
    const name = $("#name");
    const phone = $("#phone");

    const check = validateRequired([service, rhythmus, start, name, phone]);
    if (!check.ok) return;

    const data = {
      service: service.value,
      rhythmus: rhythmus.value,
      flaeche: $("#flaeche")?.value || "(optional)",
      start: start.value,
      note: $("#note")?.value || "(keine Hinweise)",
      name: name.value,
      phone: phone.value,
      email: $("#email")?.value || "(optional)"
    };

    const subject = `Reinigungsanfrage – ${data.service}`;
    const body = buildMessage(data);

    try {
      if (CONFIG.formEndpoint) {
        await submitToEndpoint(CONFIG.formEndpoint, data);
        alert("Danke! Deine Anfrage wurde gesendet. Wir melden uns zeitnah.");
        leadForm.reset();
        return;
      }
    } catch (_) {
      // fallback to mailto below
    }

    window.location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    leadForm.reset();
  });
}

/* Contact form */
const contactForm = $("#contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const service = $("#c_service");
    const rhythmus = $("#c_rhythmus");
    const name = $("#c_name");
    const phone = $("#c_phone");

    const check = validateRequired([service, rhythmus, name, phone]);
    if (!check.ok) return;

    const data = {
      service: service.value,
      rhythmus: rhythmus.value,
      flaeche: "(optional)",
      start: "(via Kontaktformular)",
      note: $("#c_note")?.value || "(keine Hinweise)",
      name: name.value,
      phone: phone.value,
      email: $("#c_email")?.value || "(optional)"
    };

    const subject = `Reinigungsanfrage – ${data.service}`;
    const body = buildMessage(data);

    try {
      if (CONFIG.formEndpoint) {
        await submitToEndpoint(CONFIG.formEndpoint, data);
        alert("Danke! Deine Anfrage wurde gesendet. Wir melden uns zeitnah.");
        contactForm.reset();
        return;
      }
    } catch (_) {}

    window.location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    contactForm.reset();
  });
}
