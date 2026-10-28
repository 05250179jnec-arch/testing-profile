// ==========================================================
// DRUK SPORTS: pitch-deck slideshow + survey counters
// ==========================================================
(function () {
  const carousel = document.getElementById("dsCarousel");
  if (!carousel) return;
  const slides = carousel.querySelectorAll(".ds-slide");
  const dots = carousel.querySelectorAll(".ds-dot");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let index = 0;
  let timer = null;

  function show(i) {
    index = (i + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle("active", k === index));
    dots.forEach((d, k) => d.classList.toggle("active", k === index));
  }
  function start() {
    if (reduceMotion) return;
    stop();
    timer = setInterval(() => show(index + 1), 3500);
  }
  function stop() { if (timer) clearInterval(timer); }

  document.getElementById("dsPrev").addEventListener("click", () => { show(index - 1); start(); });
  document.getElementById("dsNext").addEventListener("click", () => { show(index + 1); start(); });
  dots.forEach((d, k) => d.addEventListener("click", () => { show(k); start(); }));
  carousel.addEventListener("mouseenter", stop);
  carousel.addEventListener("mouseleave", start);
  start();

  // Survey numbers count up the first time the card scrolls into view
  const nums = document.querySelectorAll(".ds-stats b[data-count]");
  function countUp() {
    nums.forEach((el) => {
      const target = Number(el.dataset.count);
      if (reduceMotion) { el.textContent = target; return; }
      const t0 = performance.now();
      (function tick(now) {
        const t = Math.min(1, (now - t0) / 1400);
        el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
        if (t < 1) requestAnimationFrame(tick);
      })(t0);
    });
  }
  if ("IntersectionObserver" in window) {
    const obs = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { countUp(); obs.disconnect(); }
    }, { threshold: 0.4 });
    obs.observe(document.querySelector(".ds-stats"));
  } else {
    countUp();
  }
})();
