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
      if (a.download) {
        btn.href = `/api/download?url=${encodeURIComponent(a.href)}&name=${encodeURIComponent(a.filename || "download.png")}`;
        btn.setAttribute("download", a.filename || "");
      } else {
        btn.href = a.href;
        btn.target = "_blank";
        btn.rel = "noopener noreferrer";
      }
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
      { key: logos.markOnly, desc: "A compact version of the Global Gathering mark for places where the full event name appears nearby.", onNavy: false, filename: "global-gathering-logo-mark.png" },
      { key: logos.transparent, desc: "The full event logo with a transparent background, useful for most websites, graphics, and digital materials.", onNavy: false, filename: "global-gathering-logo-transparent.png" },
      { key: logos.whiteBackground, desc: "The full logo on white, ready to use in documents, presentations, email graphics, and light-background layouts.", onNavy: false, filename: "global-gathering-logo-white-background.png" },
      { key: logos.navyBackground, desc: "The full logo on deep navy, useful for dark-background layouts and branded sections.", onNavy: true, filename: "global-gathering-logo-navy-background.png" }
    ];
    entries.forEach((entry, i) => {
      grid.appendChild(
        card({
          title: entry.key.title,
          desc: entry.desc,
          previewUrl: entry.key.url,
          previewOnNavy: entry.onNavy,
          accentIndex: i,
          actions: [{ href: entry.key.url, label: "Download (PNG)", download: true, filename: entry.filename }]
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
        desc: "A ready-to-use banner featuring the Global Gathering identity and event information.",
        previewUrl: b.url,
        accentIndex: 0,
        actions: [{ href: b.url, label: "Download (PNG)", download: true, filename: "global-gathering-event-banner.png" }]
      })
    );
  }

  function renderGraphics() {
    const grid = document.getElementById("graphics-grid");
    if (!grid) return;
    const g = globalGatheringMediaAssets.promotionalGraphics;
    const entries = [
      { data: g.presenter, title: "Share Your Participation as a Presenter", desc: "For confirmed presenters who want to share that they are part of the 2026 Global Gathering program.", filename: "global-gathering-presenter-graphic.png" },
      { data: g.attendee, title: "Invite Others to Attend", desc: "A ready-to-use graphic for sharing that registration is open and inviting colleagues, teams, and networks to explore the Gathering.", filename: "global-gathering-attendee-graphic.png" },
      { data: g.partner, title: "Share as a Community or Organizational Partner", desc: "For organizations, community partners, and networks that are connected to the Gathering or helping spread the word.", filename: "global-gathering-partner-graphic.png" }
    ];
    entries.forEach((entry, i) => {
      grid.appendChild(
        card({
          title: entry.title,
          desc: entry.desc,
          previewUrl: entry.data.imageUrl,
          accentIndex: i + 1,
          actions: [
            { href: entry.data.imageUrl, label: "Download (PNG)", download: true, filename: entry.filename },
            { href: entry.data.canvaTemplateUrl, label: "Customize in Canva", secondary: true }
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

  // Converts a rich-text block (paragraphs, lists, <br>) into plain text with
  // a blank line between paragraphs/list items, since element.innerText
  // collapses adjacent block boundaries to a single newline in most browsers
  // and loses the paragraph spacing when pasted into an email client.
  function blockToPlainText(node) {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent;
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    if (node.tagName === "BR") return "\n";
    if (node.tagName === "OL" || node.tagName === "UL") {
      return Array.from(node.children)
        .map((li) => Array.from(li.childNodes).map(blockToPlainText).join("").trim())
        .join("\n\n");
    }
    return Array.from(node.childNodes).map(blockToPlainText).join("");
  }

  function richTextToPlainText(container) {
    return Array.from(container.children)
      .map((child) => blockToPlainText(child).trim())
      .join("\n\n");
  }

  // Copy buttons for the sample emails, event description versions, and social posts
  document.querySelectorAll("[data-copy-block]").forEach((btn) => {
    const card = btn.closest(".gg-copy-block");
    const body = card && card.querySelector("[data-copy-block-body]");
    const status = card && card.querySelector("[data-copy-block-status]");
    if (!body) return;
    btn.addEventListener("click", async () => {
      const subjectEl = card.querySelector(".gg-email-subject");
      const bodyText = richTextToPlainText(body);
      const plainText = subjectEl ? `Subject: ${subjectEl.textContent}\n\n${bodyText}` : bodyText;
      const html = subjectEl ? `<p><strong>Subject:</strong> ${subjectEl.textContent}</p>${body.innerHTML}` : body.innerHTML;
      const ok = await copyToClipboard(plainText, html);
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
