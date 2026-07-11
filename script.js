(function () {
  const accents = ["", "accent-red", "accent-sage", "accent-amber"];

  function card({ title, desc, previewUrl, previewOnNavy, actions, accentIndex }) {
    const el = document.createElement("article");
    el.className = "gg-card";
    el.setAttribute("role", "listitem");

    const preview = document.createElement("div");
    preview.className = "gg-card-preview" + (previewOnNavy ? " preview-navy" : "");
    if (previewUrl) {
      const img = document.createElement("img");
      img.src = previewUrl;
      img.alt = "";
      img.loading = "lazy";
      preview.appendChild(img);
    }
    el.appendChild(preview);

    const accent = document.createElement("div");
    accent.className = "gg-card-accent " + (accents[accentIndex % accents.length] || "");
    el.appendChild(accent);

    const h3 = document.createElement("h3");
    h3.textContent = title;
    el.appendChild(h3);

    const p = document.createElement("p");
    p.className = "gg-card-desc";
    p.textContent = desc;
    el.appendChild(p);

    const actionsEl = document.createElement("div");
    actionsEl.className = "gg-card-actions";
    actions.forEach((a) => {
      const btn = document.createElement("a");
      btn.href = a.href;
      btn.target = "_blank";
      btn.rel = "noopener noreferrer";
      btn.className = "gg-button gg-button-sm" + (a.secondary ? " gg-button-secondary" : "");
      btn.textContent = a.label;
      actionsEl.appendChild(btn);
    });
    el.appendChild(actionsEl);

    return el;
  }

  function renderLogos() {
    const grid = document.getElementById("logo-grid");
    if (!grid) return;
    const logos = globalGatheringMediaAssets.logos;
    const entries = [
      { key: logos.markOnly, desc: "The Global Gathering mark on its own, for compact or icon-style placements.", onNavy: false },
      { key: logos.transparent, desc: "Full logo with a transparent background, for layering over your own designs.", onNavy: false },
      { key: logos.whiteBackground, desc: "Full logo on white, ready to drop into documents and presentations.", onNavy: false },
      { key: logos.navyBackground, desc: "Full logo on navy, for dark-background use.", onNavy: true }
    ];
    entries.forEach((entry, i) => {
      grid.appendChild(
        card({
          title: entry.key.title,
          desc: entry.desc,
          previewUrl: entry.key.url,
          previewOnNavy: entry.onNavy,
          accentIndex: i,
          actions: [{ href: entry.key.url, label: "Download (PNG)" }]
        })
      );
    });
  }

  function renderBanners() {
    const grid = document.getElementById("banner-grid");
    if (!grid) return;
    const b = globalGatheringMediaAssets.banners.mainBanner;
    grid.appendChild(
      card({
        title: b.title,
        desc: "A wide event banner for email headers, web heroes, and slide decks.",
        previewUrl: b.url,
        accentIndex: 0,
        actions: [{ href: b.url, label: "Download (PNG)" }]
      })
    );
  }

  function renderGraphics() {
    const grid = document.getElementById("graphics-grid");
    if (!grid) return;
    const g = globalGatheringMediaAssets.promotionalGraphics;
    const entries = [
      { data: g.presenter, desc: "Invite colleagues to submit a proposal and present at the Gathering." },
      { data: g.attendee, desc: "Invite colleagues to register and take part in the Gathering." },
      { data: g.partner, desc: "Invite organizations to partner with the Gathering." }
    ];
    entries.forEach((entry, i) => {
      grid.appendChild(
        card({
          title: entry.data.title,
          desc: entry.desc,
          previewUrl: entry.data.imageUrl,
          accentIndex: i + 1,
          actions: [
            { href: entry.data.imageUrl, label: "Download (PNG)" },
            { href: entry.data.canvaTemplateUrl, label: "Edit in Canva", secondary: true }
          ]
        })
      );
    });
  }

  renderLogos();
  renderBanners();
  renderGraphics();

  // Copies text (and, where supported, HTML) to the clipboard. Falls back to a
  // hidden textarea + execCommand, because the modern Clipboard API can be
  // blocked inside a third-party iframe unless the host page's <iframe> tag
  // includes allow="clipboard-write" — which we can't guarantee.
  async function copyToClipboard(plainText, html) {
    try {
      if (html && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/plain": new Blob([plainText], { type: "text/plain" }),
            "text/html": new Blob([html], { type: "text/html" })
          })
        ]);
        return true;
      }
      await navigator.clipboard.writeText(plainText);
      return true;
    } catch (err) {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = plainText;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(textarea);
        return ok;
      } catch (err2) {
        return false;
      }
    }
  }

  // Copy video link buttons
  document.querySelectorAll("[data-copy-url]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const original = btn.textContent;
      const ok = await copyToClipboard(btn.getAttribute("data-copy-value"));
      btn.textContent = ok ? "Copied" : "Copy failed";
      setTimeout(() => {
        btn.textContent = original;
      }, 2000);
    });
  });

  // Copy embed code buttons
  document.querySelectorAll("[data-copy-embed]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const url = btn.getAttribute("data-embed-url");
      const title = btn.getAttribute("data-embed-title") || "video";
      const embed = `<div class="gg-video-wrapper"><iframe src="${url}" title="${title}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>`;
      const original = btn.textContent;
      const ok = await copyToClipboard(embed);
      btn.textContent = ok ? "Copied" : "Copy failed";
      setTimeout(() => {
        btn.textContent = original;
      }, 2000);
    });
  });

  // Copy email draft
  const copyEmailBtn = document.getElementById("copy-email-btn");
  const copyEmailStatus = document.getElementById("copy-email-status");
  const emailBody = document.getElementById("email-body");
  if (copyEmailBtn && emailBody) {
    copyEmailBtn.addEventListener("click", async () => {
      const subject = "A virtual learning opportunity: 2026 Global Gathering for the Future of Child Welfare";
      const plainText = subject + "\n\n" + emailBody.innerText;
      const ok = await copyToClipboard(plainText, emailBody.innerHTML);
      copyEmailStatus.textContent = ok ? "Copied to clipboard" : "Copy failed — please select and copy manually";
      setTimeout(() => {
        copyEmailStatus.textContent = "";
      }, 3000);
    });
  }

  // Copy buttons for the event description versions
  document.querySelectorAll("[data-copy-block]").forEach((btn) => {
    const card = btn.closest(".gg-copy-block");
    const body = card && card.querySelector("[data-copy-block-body]");
    const status = card && card.querySelector("[data-copy-block-status]");
    if (!body) return;
    btn.addEventListener("click", async () => {
      const ok = await copyToClipboard(body.innerText, body.innerHTML);
      if (status) status.textContent = ok ? "Copied to clipboard" : "Copy failed — please select and copy manually";
      setTimeout(() => {
        if (status) status.textContent = "";
      }, 3000);
    });
  });

  // Tabs: nav buttons and hero CTAs switch which section is visible.
  // No scrolling involved, which matters inside the iframe embed — the frame
  // is sized to exactly match content height, so it has no internal scroll
  // position for an anchor jump to move.
  const tabButtons = document.querySelectorAll("[data-tab-target]");
  const tabPanels = document.querySelectorAll("[data-tab-panel]");

  function activateTab(id) {
    tabPanels.forEach((panel) => {
      panel.hidden = panel.getAttribute("data-tab-panel") !== id;
    });
    tabButtons.forEach((btn) => {
      if (!btn.classList.contains("gg-tab-btn")) return;
      const active = btn.getAttribute("data-tab-target") === id;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
  }

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => activateTab(btn.getAttribute("data-tab-target")));
  });

  activateTab("home");

  // Embed support: report content height to the parent frame (see embed
  // snippet: listens for { ggWidgetHeight } and sizes the iframe;
  // scrolling="no" means the page itself must never need its own scrollbar).
  if (window.self !== window.top) {
    let lastHeight = 0;
    let scheduled = false;

    function reportHeight() {
      const height = Math.ceil(document.documentElement.getBoundingClientRect().height);
      if (Math.abs(height - lastHeight) > 1) {
        lastHeight = height;
        window.parent.postMessage({ ggWidgetHeight: height }, "*");
      }
    }

    function scheduleReport() {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        reportHeight();
      });
    }

    if (window.ResizeObserver) {
      new ResizeObserver(scheduleReport).observe(document.documentElement);
    }

    window.addEventListener("load", scheduleReport);
    window.addEventListener("resize", scheduleReport);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(scheduleReport);
    }

    scheduleReport();
  }
})();
