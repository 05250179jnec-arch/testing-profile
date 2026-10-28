// ==========================================================
// Animated network topology background (HTML Canvas)
// Nodes drift slowly, nearby nodes are linked, and small
// "packets" travel along the links.
// ==========================================================
(function () {
  const canvas = document.getElementById("netCanvas");
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const LINK_DISTANCE = 150;
  let nodes = [];
  let packets = [];
  let width = 0;
  let height = 0;

  function accentColor() {
    return getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#38bdf8";
  }

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Fewer nodes on small screens keeps phones smooth
    const count = Math.min(70, Math.floor((width * height) / 18000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.8 + 1.2
    }));
    packets = [];
  }

  function spawnPacket() {
    const a = nodes[Math.floor(Math.random() * nodes.length)];
    let nearest = null;
    let best = LINK_DISTANCE;
    nodes.forEach((b) => {
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (b !== a && d < best) { best = d; nearest = b; }
    });
    if (nearest) packets.push({ from: a, to: nearest, t: 0 });
  }

  function draw() {
    const color = accentColor();
    ctx.clearRect(0, 0, width, height);

    // Links between nearby nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK_DISTANCE) {
          ctx.globalAlpha = (1 - d / LINK_DISTANCE) * 0.35;
          ctx.strokeStyle = color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // Nodes
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = color;
    nodes.forEach((n) => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Packets
    ctx.globalAlpha = 1;
    packets.forEach((p) => {
      const x = p.from.x + (p.to.x - p.from.x) * p.t;
      const y = p.from.y + (p.to.y - p.from.y) * p.t;
      ctx.fillRect(x - 2, y - 2, 4, 4);
    });
  }

  function step() {
    nodes.forEach((n) => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;
    });
    packets.forEach((p) => (p.t += 0.02));
    packets = packets.filter((p) => p.t < 1);
    if (packets.length < 8 && Math.random() < 0.05) spawnPacket();

    draw();
    requestAnimationFrame(step);
  }

  resize();
  window.addEventListener("resize", resize);

  if (reduceMotion) {
    draw(); // one still frame, no animation
  } else {
    requestAnimationFrame(step);
  }
})();
