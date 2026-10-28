// ==========================================================
// Motion effects: boot intro, scroll progress, cursor glow,
// rotating role text, animated counters, staggered reveals,
// and 3D tilt + spotlight on cards.
// ==========================================================
(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let countersStarted = false; // declared first: the intro can finish (and start the counters) immediately

  // ---------- 1. Boot intro ----------
  const loader = document.getElementById("loader");
  function finishLoading() {
    if (!loader || loader.classList.contains("done")) return;
    loader.classList.add("done");
    document.body.classList.remove("is-loading");
    startCounters();
  }
  if (reduceMotion || sessionStorageGet("booted")) {
    // Show the intro only once per visit
    finishLoading();
  } else {
    setTimeout(finishLoading, 2000);
    loader.addEventListener("click", finishLoading);
    sessionStorageSet("booted", "1");
  }

  function sessionStorageGet(key) {
    try { return sessionStorage.getItem(key); } catch (e) { return null; }
  }
  function sessionStorageSet(key, value) {
    try { sessionStorage.setItem(key, value); } catch (e) { /* storage unavailable */ }
  }

  // ---------- 2. Scroll progress bar ----------
  const progress = document.getElementById("scrollProgress");
  function updateProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  // ---------- 3. Cursor glow (desktop only) ----------
  const glow = document.getElementById("cursorGlow");
  if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
    window.addEventListener("mousemove", (e) => {
      glow.classList.add("on");
      glow.style.transform = "translate(" + (e.clientX - 210) + "px," + (e.clientY - 210) + "px)";
    }, { passive: true });
    document.addEventListener("mouseleave", () => glow.classList.remove("on"));
  }

  // ---------- 4. Rotating role text ----------
  const roleEl = document.getElementById("role");
  const roles = ["build networks", "secure systems", "configure routers", "write JavaScript", "solve CTF challenges"];
  let roleIndex = 0;
  let charIndex = roles[0].length;
  let deleting = true;

  function roleLoop() {
    const word = roles[roleIndex];
    roleEl.textContent = word.slice(0, charIndex);
    if (deleting) {
      if (charIndex > 0) { charIndex--; return setTimeout(roleLoop, 40); }
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      return setTimeout(roleLoop, 250);
    }
    const next = roles[roleIndex];
    if (charIndex < next.length) { charIndex++; return setTimeout(roleLoop, 80); }
    deleting = true;
    setTimeout(roleLoop, 1800);
  }
  if (!reduceMotion) setTimeout(roleLoop, 2600);

  // ---------- 5. Counters count up ----------
  function startCounters() {
    if (countersStarted) return;
    countersStarted = true;
    document.querySelectorAll(".stat-num").forEach((el) => {
      const target = Number(el.dataset.count);
      if (reduceMotion) { el.textContent = target; return; }
      const start = performance.now();
      const duration = 1200;
      (function tick(now) {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(target * eased);
        if (t < 1) requestAnimationFrame(tick);
      })(start);
    });
  }

  // ---------- 6. Stagger reveals inside grids ----------
  document.querySelectorAll(".skills-grid, .projects-grid, .lab-grid, .cert-grid").forEach((grid) => {
    [...grid.children].forEach((child, i) => {
      child.style.setProperty("--d", i % 4);
      // drop the delay once revealed so hover effects respond instantly
      child.addEventListener("transitionend", () => child.style.setProperty("--d", 0), { once: true });
    });
  });

  // Skill filter: replay a small pop animation on the cards that stay visible
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".skill-card:not(.hide)").forEach((card) => {
        card.classList.remove("pop");
        void card.offsetWidth;
        card.classList.add("pop");
      });
    });
  });

  // ---------- 7. Spotlight + 3D tilt on cards ----------
  if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".project-card, .skill-card, .lab-card").forEach((card) => {
      const tilt = card.classList.contains("project-card") && !card.classList.contains("wide");
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        card.style.setProperty("--mx", x + "px");
        card.style.setProperty("--my", y + "px");
        if (tilt) {
          card.style.setProperty("--ry", ((x / r.width - 0.5) * 10).toFixed(2) + "deg");
          card.style.setProperty("--rx", ((0.5 - y / r.height) * 10).toFixed(2) + "deg");
        }
      });
      card.addEventListener("mouseleave", () => {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    });
  }
})();
