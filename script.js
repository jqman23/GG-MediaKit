(function () {
  const accents = ["", "accent-red", "accent-sage", "accent-amber"];

  function card({ title, desc, format, previewUrl, previewOnNavy, actions, accentIndex }) {
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

    const fmt = document.createElement("div");
    fmt.className = "gg-card-format";
    fmt.textContent = format;
    el.appendChild(fmt);

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
          format: "PNG",
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
        format: "PNG",
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
          format: "PNG · Editable in Canva",
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

  // Copy video link buttons
  document.querySelectorAll("[data-copy-url]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const url = btn.getAttribute("data-copy-value");
      const original = btn.textContent;
      try {
        await navigator.clipboard.writeText(url);
        btn.textContent = "Copied";
      } catch (err) {
        btn.textContent = "Copy failed";
      }
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
      try {
        await navigator.clipboard.writeText(embed);
        btn.textContent = "Copied";
      } catch (err) {
        btn.textContent = "Copy failed";
      }
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
      try {
        if (window.ClipboardItem) {
          const htmlBlob = new Blob([emailBody.innerHTML], { type: "text/html" });
          const textBlob = new Blob([plainText], { type: "text/plain" });
          await navigator.clipboard.write([
            new ClipboardItem({ "text/html": htmlBlob, "text/plain": textBlob })
          ]);
        } else {
          await navigator.clipboard.writeText(plainText);
        }
        copyEmailStatus.textContent = "Copied to clipboard";
      } catch (err) {
        try {
          await navigator.clipboard.writeText(plainText);
          copyEmailStatus.textContent = "Copied to clipboard";
        } catch (err2) {
          copyEmailStatus.textContent = "Copy failed — please select and copy manually";
        }
      }
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
      const plainText = body.innerText;
      try {
        if (window.ClipboardItem) {
          const htmlBlob = new Blob([body.innerHTML], { type: "text/html" });
          const textBlob = new Blob([plainText], { type: "text/plain" });
          await navigator.clipboard.write([
            new ClipboardItem({ "text/html": htmlBlob, "text/plain": textBlob })
          ]);
        } else {
          await navigator.clipboard.writeText(plainText);
        }
        if (status) status.textContent = "Copied to clipboard";
      } catch (err) {
        try {
          await navigator.clipboard.writeText(plainText);
          if (status) status.textContent = "Copied to clipboard";
        } catch (err2) {
          if (status) status.textContent = "Copy failed — please select and copy manually";
        }
      }
      setTimeout(() => {
        if (status) status.textContent = "";
      }, 3000);
    });
  });

  // Embed support: report content height to the parent frame (see embed snippet:
  // listens for { ggWidgetHeight } and sizes the iframe; scrolling="no" on the
  // iframe means the page itself must never need an internal scrollbar).
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

    window.addEventListener("message", (e) => {
      if (e.data && e.data.ggScrollTop !== undefined) {
        // Reserved for future use (e.g. lazy content tied to visible viewport).
      }
    });

    scheduleReport();

    // Same-page anchor links (nav, hero CTAs) can't scroll anything themselves —
    // the iframe is sized to exactly fit its content (scrolling="no"), so there's
    // no internal scroll position to change. Ask the parent page to scroll instead.
    document.addEventListener("click", (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute("href").slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const offset = target.getBoundingClientRect().top + window.scrollY;
      window.parent.postMessage({ ggScrollToOffset: offset }, "*");
    });
  } else {
    // Standalone (not embedded): smooth-scroll same-page anchors normally.
    document.addEventListener("click", (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute("href").slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
})();
