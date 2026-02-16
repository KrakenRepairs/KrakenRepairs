/* Kraken Repairs — main.JS
   - Mobile nav toggle
   - Smooth page transitions (fade out on navigation)
   - Web3Forms AJAX enhancement (still works without JS)
   - Footer year
*/

(function () {
  // Footer year
  const yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Page load fade-in
  window.addEventListener("DOMContentLoaded", () => {
    document.body.classList.remove("is-loading");
  });

  // Mobile nav
  const toggle = document.querySelector("[data-nav-toggle]");
  const menu = document.querySelector("[data-nav-menu]");

  function setNav(open) {
    if (!toggle || !menu) return;
    menu.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  }

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const open = !menu.classList.contains("is-open");
      setNav(open);
    });

    // Close menu on link click
    menu.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (a) setNav(false);
    });

    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setNav(false);
    });
  }

  // Smooth page transitions: fade out on internal nav
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function isSameOriginLink(a) {
    try {
      const url = new URL(a.href, window.location.href);
      return url.origin === window.location.origin;
    } catch {
      return false;
    }
  }

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-nav]");
    if (!a) return;

    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (!isSameOriginLink(a)) return;

    const url = new URL(a.href, window.location.href);
    const samePath = url.pathname === window.location.pathname;
    if (samePath && url.hash) return;
    if (prefersReduced) return;

    e.preventDefault();
    document.body.classList.add("is-leaving");
    window.setTimeout(() => {
      window.location.href = a.href;
    }, 180);
  });

  // Web3Forms AJAX enhancement
  const form = document.querySelector("form[data-web3form]");
  if (form) {
    const statusEl = form.querySelector("[data-form-status]");

    function setStatus(msg, type) {
      if (!statusEl) return;
      statusEl.textContent = msg;
      statusEl.classList.remove("is-ok", "is-bad");
      if (type) statusEl.classList.add(type);
    }

    form.addEventListener("submit", async (e) => {
      if (!window.fetch) return;

      e.preventDefault();
      setStatus("Sending…", null);

      const formData = new FormData(form);
      if (formData.get("botcheck")) {
        setStatus("Submission blocked.", "is-bad");
        return;
      }

      try {
        const res = await fetch(form.action, {
          method: "POST",
          body: formData,
          headers: { Accept: "application/JSon" },
        });

        const data = await res.JSon().catch(() => ({}));

        if (res.ok && (data.success === true || data.message)) {
          form.reset();
          setStatus("Thanks — we’ve received your enquiry and will call you back soon.", "is-ok");
          return;
        }

        setStatus("Sorry, something went wrong. Please try again.", "is-bad");
      } catch {
        setStatus("Network error. Please try again.", "is-bad");
      }
    });
  }
})();