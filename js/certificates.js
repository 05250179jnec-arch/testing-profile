// ==========================================================
// Certificates: filter buttons + full-size viewer (lightbox)
// ==========================================================
(function () {
  // ---------- Filter ----------
  const buttons = document.querySelectorAll(".cert-filter");
  const tiles = document.querySelectorAll(".cert-tile");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const cat = btn.dataset.cert;
      tiles.forEach((tile) => {
        const show = cat === "all" || tile.dataset.cat === cat;
        tile.classList.toggle("hide", !show);
        if (show) {
          tile.classList.remove("pop");
          void tile.offsetWidth; // restart the animation
          tile.classList.add("pop");
        }
      });
    });
  });

  // ---------- Lightbox viewer ----------
  const box = document.getElementById("lightbox");
  const img = document.getElementById("lbImg");
  const caption = document.getElementById("lbCaption");
  const closeBtn = document.getElementById("lbClose");
  let lastFocus = null;

  function open(src, title) {
    lastFocus = document.activeElement;
    img.src = src;
    img.alt = title;
    caption.textContent = title;
    box.hidden = false;
    document.body.classList.add("lb-open");
    closeBtn.focus();
  }
  function close() {
    box.hidden = true;
    document.body.classList.remove("lb-open");
    if (lastFocus) lastFocus.focus();
  }

  document.querySelectorAll(".cert-thumb, .photo-thumb").forEach((thumb) => {
    thumb.addEventListener("click", () => open(thumb.dataset.full, thumb.dataset.title));
  });
  closeBtn.addEventListener("click", close);
  box.addEventListener("click", (e) => { if (e.target === box) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !box.hidden) close(); });
})();
