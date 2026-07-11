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
})();
