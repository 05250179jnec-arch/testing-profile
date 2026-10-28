// ==========================================================
// Interactive Skill Map
// A network-style diagram: me → skill categories → skills.
// Click a category to expand it, click a skill to see where
// I've used it (projects, certificates, experience).
// ==========================================================
(function () {
  const svg = document.getElementById("skillMap");
  if (!svg) return;

  const NS = "http://www.w3.org/2000/svg";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Evidence: where each skill was used ----------
  const E = {
    autoconnection: ["AutoConnection (in progress)", "#proj-autoconnection", "project"],
    events: ["JNEC Events Hub", "#proj-events", "project"],
    task: ["Task Manager (Task API)", "#proj-task", "project"],
    bank: ["Bank Network with eBGP & ACLs", "#proj-bank", "project"],
    dhcp: ["DHCP Server Setup & Verification", "#proj-dhcp", "project"],
    iot: ["Smart Room Automation", "#proj-iot", "project"],
    druk: ["DRUK SPORTS hackathon pitch", "#proj-druk", "project"],
    subnetLab: ["Subnet Calculator (this site)", "#lab-subnet", "lab"],
    aclLab: ["ACL Packet Simulator (this site)", "#lab-acl", "lab"],
    portfolio: ["This portfolio website", "#home", "project"],
    itn: ["CCNA: Introduction to Networks", "#cert-ccna-itn", "cert"],
    srwe: ["CCNA: Switching, Routing & Wireless", "#cert-ccna-srwe", "cert"],
    linux: ["Becoming a Linux Server Admin", "#cert-linux", "cert"],
    laravel: ["Laravel & PHP course", "#cert-laravel", "cert"],
    tkinter: ["Python Tkinter course", "#cert-tkinter", "cert"],
    ctf: ["1st place, National CTF 2026", "#exp-ctf", "experience"],
    prf: ["PRF-26 student volunteer", "#exp-prf", "experience"],
    tour: ["Industry study tour", "#exp-tour", "experience"],
    jst: ["JST exchange, Japan", "#exp-jst", "experience"],
    eldp: ["ELDP training", "#training-eldp", "training"]
  };

  // ---------- Categories and skills ----------
  const icons = {
    network: '<path d="M12 3v6M5 15v-3h14v3"/><rect x="9" y="3" width="6" height="4" rx="1"/><rect x="2" y="15" width="6" height="5" rx="1"/><rect x="16" y="15" width="6" height="5" rx="1"/>',
    systems: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9l3 3-3 3M13 15h4"/>',
    web: '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5"/>',
    git: '<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="9" r="2"/><path d="M6 7v10M18 11a6 6 0 0 1-6 6H8"/>',
    iot: '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
    security: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><rect x="9" y="11" width="6" height="5" rx="1"/><path d="M10 11V9a2 2 0 0 1 4 0v2"/>',
    tools: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 9v12"/>',
    lang: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    soft: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20a6 6 0 0 1 12 0M14 20a4.5 4.5 0 0 1 8 0"/>'
  };

  const categories = [
    { id: "network", name: "Networking", color: "#38bdf8", desc: "Designing, configuring and troubleshooting networks, from my CCNA courses to my eBGP project.",
      skills: [["Cisco Packet Tracer", ["bank", "itn", "srwe"]], ["BGP / eBGP", ["bank", "aclLab"]], ["Access Control Lists", ["bank", "aclLab"]], ["DHCP", ["dhcp", "itn"]], ["Subnetting", ["subnetLab", "itn"]], ["Routing & Switching", ["srwe", "bank"]], ["Wireless LANs", ["srwe"]]] },
    { id: "systems", name: "Systems", color: "#22d3ee", desc: "Running and administering Linux servers and virtual machines.",
      skills: [["Ubuntu Server", ["dhcp", "linux"]], ["Linux Server Admin", ["linux"]], ["Linux Command Line", ["linux", "dhcp"]], ["VirtualBox", ["dhcp"]]] },
    { id: "web", name: "Web Development", color: "#a78bfa", desc: "Building websites and full-stack web apps, front end to database.",
      skills: [["HTML5 & CSS3", ["events", "portfolio"]], ["JavaScript", ["portfolio", "events", "task"]], ["Node.js & Express", ["task", "autoconnection"]], ["React", ["autoconnection"]], ["PHP & Laravel", ["laravel"]], ["Python (Tkinter)", ["tkinter"]], ["MySQL", ["task", "autoconnection"]], ["REST APIs", ["task", "autoconnection"]]] },
    { id: "git", name: "Version Control", color: "#f472b6", desc: "Tracking work with Git and publishing it on GitHub.",
      skills: [["Git", ["task", "portfolio"]], ["GitHub", ["task", "portfolio"]], ["GitHub Pages", ["portfolio"]]] },
    { id: "iot", name: "IoT & Electronics", color: "#facc15", desc: "Connecting sensors and actuators to microcontrollers to automate real spaces.",
      skills: [["Arduino Uno", ["iot"]], ["Arduino IDE (C++)", ["iot"]], ["PIR Sensor", ["iot"]], ["Ultrasonic Sensor", ["iot"]], ["Servo Motors", ["iot"]], ["Relay Modules", ["iot"]]] },
    { id: "security", name: "Cybersecurity", color: "#4ade80", desc: "Thinking like attackers and defenders, proven in competition.",
      skills: [["Capture the Flag", ["ctf"]], ["Attack & Defence Mindset", ["ctf", "aclLab"], "Attack & Defence"], ["Digital Forensics (basics)", ["ctf"], "Forensics"], ["Reverse Engineering (basics)", ["ctf"], "Reverse Eng."], ["Secure Auth (JWT, bcrypt)", ["autoconnection"], "Secure Auth"]] },
    { id: "tools", name: "Productivity", color: "#fb923c", desc: "The everyday tools I use for reports, data and presentations.",
      skills: [["Microsoft Word", []], ["Excel", []], ["PowerPoint", ["druk", "autoconnection"]], ["Google Workspace", []], ["Figma", ["autoconnection"]], ["Postman", ["autoconnection"]]] },
    { id: "lang", name: "Languages", color: "#2dd4bf", desc: "Languages I speak.",
      skills: [["English", []], ["Dzongkha", []], ["Nepali", []], ["Hindi", []]] },
    { id: "soft", name: "Soft Skills", color: "#f87171", desc: "How I work with people, from team competitions to international events.",
      skills: [["Leadership", ["eldp"]], ["Entrepreneurship", ["eldp", "druk"]], ["Teamwork", ["ctf", "autoconnection", "druk"]], ["Presentation", ["druk", "dhcp"]], ["Time Management", []], ["Analytical Thinking", ["ctf"]], ["Working Under Pressure", ["ctf", "prf"], "Under Pressure"]] }
  ];

  const W = 700, CX = 350, CY = 275;
  const hubLayer = document.getElementById("smHubs");
  const skillLayer = document.getElementById("smSkills");
  const linkLayer = document.getElementById("smLinks");
  const panel = document.getElementById("skillPanel");
  const search = document.getElementById("skillSearch");
  const datalist = document.getElementById("skillList");

  const state = { cat: null, skill: null };
  const hubEls = {};
  const skillEls = {}; // key "cat|index"

  function el(name, attrs, parent) {
    const n = document.createElementNS(NS, name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function place(node, x, y, s, o) {
    node.style.transform = "translate(" + x + "px," + y + "px) scale(" + s + ")";
    if (o !== undefined) node.style.opacity = o;
  }
  function makeButton(node, label, handler) {
    node.setAttribute("tabindex", "0");
    node.setAttribute("role", "button");
    node.setAttribute("aria-label", label);
    node.addEventListener("click", handler);
    node.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handler(); } });
  }

  // ---------- Build nodes ----------
  const me = el("g", { class: "sm-me" }, hubLayer);
  el("circle", { r: 58, class: "sm-me-ring" }, me);
  el("circle", { r: 46, class: "sm-me-core" }, me);
  const meText = el("text", { class: "sm-me-text", y: 8 }, me);
  meText.textContent = "KL";
  const meSub = el("text", { class: "sm-me-sub", y: 76 }, me);
  meSub.textContent = "Kuenzang";
  makeButton(me, "Show all skill categories", () => select(null));

  categories.forEach((cat) => {
    const g = el("g", { class: "sm-hub" }, hubLayer);
    g.style.setProperty("--c", cat.color);
    el("circle", { r: 36, class: "sm-hub-ring" }, g);
    el("circle", { r: 30, class: "sm-hub-core" }, g);
    const ic = el("g", { class: "sm-hub-icon", transform: "translate(-13 -13) scale(1.08)" }, g);
    ic.innerHTML = icons[cat.id];
    const label = el("text", { class: "sm-hub-label", y: 56 }, g);
    label.textContent = cat.name;
    const tip = el("title", {}, g);
    tip.textContent = cat.name + " (" + cat.skills.length + " skills)";
    const badge = el("g", { class: "sm-badge", transform: "translate(25 -25)" }, g);
    el("circle", { r: 11 }, badge);
    const bt = el("text", { y: 4 }, badge);
    bt.textContent = cat.skills.length;
    makeButton(g, "Explore " + cat.name + " skills", () => select(state.cat === cat ? null : cat));
    hubEls[cat.id] = g;

    cat.skills.forEach(([name, , short], i) => {
      const s = el("g", { class: "sm-skill" }, skillLayer);
      s.style.setProperty("--c", cat.color);
      el("circle", { r: 13, class: "sm-skill-halo" }, s);
      el("circle", { r: 8, class: "sm-skill-dot" }, s);
      const t = el("text", { class: "sm-skill-label" }, s);
      t.textContent = short || name;
      makeButton(s, name + " — see where I used it", () => selectSkill(cat, i));
      s.addEventListener("mouseenter", () => { if (state.cat === cat) highlight(i); });
      s.addEventListener("mouseleave", () => { if (state.cat === cat) highlight(state.skill); });
      skillEls[cat.id + "|" + i] = s;

      const opt = document.createElement("option");
      opt.value = name;
      datalist.appendChild(opt);
    });
  });

  // ---------- Layout ----------
  function ringPos(i, n, r, cx, cy, start) {
    const a = (start !== undefined ? start : -Math.PI / 2) + (i / n) * Math.PI * 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a), a];
  }

  function line(x1, y1, x2, y2, color, delay) {
    const l = el("line", { x1, y1, x2, y2, class: "sm-link" }, linkLayer);
    l.style.setProperty("--c", color);
    l.style.animationDelay = delay + "s";
    return l;
  }

  function layout() {
    linkLayer.innerHTML = "";
    const n = categories.length;

    if (!state.cat) {
      // Overview: me in the centre, categories around me
      place(me, CX, CY, 1, 1);
      me.classList.remove("faded");
      categories.forEach((cat, i) => {
        const [x, y] = ringPos(i, n, 205, CX, CY);
        place(hubEls[cat.id], x, y, 1, 1);
        hubEls[cat.id].classList.remove("active", "mini");
        line(CX, CY, x, y, cat.color, i * 0.15);
        cat.skills.forEach((_, k) => {
          const node = skillEls[cat.id + "|" + k];
          node.classList.remove("shown", "active", "left");
          place(node, x, y, 0.2, 0);
        });
      });
      return;
    }

    // Focused: selected category in the centre, its skills around it,
    // other categories as small shortcuts along the bottom.
    place(me, CX, CY, 0.4, 0);
    me.classList.add("faded");
    const others = categories.filter((c) => c !== state.cat);
    others.forEach((cat, i) => {
      const x = 60 + i * ((W - 120) / (others.length - 1));
      place(hubEls[cat.id], x, 572, 0.62, 0.75);
      hubEls[cat.id].classList.remove("active");
      hubEls[cat.id].classList.add("mini");
      cat.skills.forEach((_, k) => {
        const node = skillEls[cat.id + "|" + k];
        node.classList.remove("shown", "active", "left");
        place(node, x, 572, 0.2, 0);
      });
    });

    const hub = hubEls[state.cat.id];
    hub.classList.add("active");
    hub.classList.remove("mini");
    place(hub, CX, CY - 20, 1.35, 1);

    const list = state.cat.skills;
    const narrow = svg.getBoundingClientRect().width < 480;
    list.forEach((_, k) => {
      const a = -Math.PI / 2 + (narrow ? 0 : Math.PI / list.length) + (k / list.length) * Math.PI * 2;
      // phones: an oval with names centred under each dot so nothing is cut off
      const x = CX + (narrow ? 185 : 175) * Math.cos(a);
      const y = CY - 20 + (narrow ? 205 : 175) * Math.sin(a);
      const node = skillEls[state.cat.id + "|" + k];
      node.classList.add("shown");
      node.classList.toggle("below", narrow);
      node.classList.toggle("left", !narrow && Math.cos(a) < -0.2);
      node.classList.toggle("center", !narrow && Math.abs(Math.cos(a)) <= 0.2);
      node.style.transitionDelay = reduceMotion ? "0s" : 0.05 * k + "s";
      place(node, x, y, 1, 1);
      line(CX, CY - 20, x, y, state.cat.color, k * 0.12);
    });
    highlight(state.skill);
  }

  function highlight(i) {
    if (!state.cat) return;
    state.cat.skills.forEach((_, k) => {
      skillEls[state.cat.id + "|" + k].classList.toggle("active", k === i);
    });
    [...linkLayer.children].forEach((l, k) => l.classList.toggle("hot", k === i));
  }

  // ---------- Panel ----------
  function renderPanel() {
    panel.innerHTML = "";
    if (!state.cat) {
      const total = categories.reduce((n, c) => n + c.skills.length, 0);
      panel.innerHTML =
        '<p class="sp-kicker">~/skills --overview</p>' +
        "<h3>" + total + " skills across " + categories.length + " areas</h3>" +
        '<p class="sp-desc">Every skill here links to the project, certificate or experience where I used it. Pick an area to start.</p>';
      const grid = document.createElement("div");
      grid.className = "sp-cats";
      categories.forEach((cat) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "sp-cat";
        b.style.setProperty("--c", cat.color);
        b.innerHTML = '<span class="sp-cat-dot"></span><span></span><small></small>';
        b.children[1].textContent = cat.name;
        b.children[2].textContent = cat.skills.length;
        b.addEventListener("click", () => select(cat));
        grid.appendChild(b);
      });
      panel.appendChild(grid);
      return;
    }

    const cat = state.cat;
    const head = document.createElement("div");
    head.className = "sp-head";
    head.style.setProperty("--c", cat.color);
    head.innerHTML = '<span class="sp-icon"><svg viewBox="0 0 24 24">' + icons[cat.id] + "</svg></span><div><p class='sp-kicker'></p><h3></h3></div>";
    head.querySelector(".sp-kicker").textContent = "~/skills/" + cat.id;
    head.querySelector("h3").textContent = cat.name;
    panel.appendChild(head);

    const desc = document.createElement("p");
    desc.className = "sp-desc";
    desc.textContent = cat.desc;
    panel.appendChild(desc);

    const chips = document.createElement("div");
    chips.className = "sp-chips";
    cat.skills.forEach(([name], k) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "sp-chip" + (k === state.skill ? " active" : "");
      b.style.setProperty("--c", cat.color);
      b.textContent = name;
      b.addEventListener("click", () => selectSkill(cat, k));
      b.addEventListener("mouseenter", () => highlight(k));
      b.addEventListener("mouseleave", () => highlight(state.skill));
      chips.appendChild(b);
    });
    panel.appendChild(chips);

    const ev = document.createElement("div");
    ev.className = "sp-evidence";
    if (state.skill === null) {
      ev.innerHTML = '<p class="sp-empty">Select a skill to see where I\'ve used it.</p>';
    } else {
      const [name, refs] = cat.skills[state.skill];
      const h = document.createElement("p");
      h.className = "sp-ev-title";
      h.textContent = refs.length ? "Where I've used " + name : name;
      ev.appendChild(h);
      if (!refs.length) {
        const p = document.createElement("p");
        p.className = "sp-empty";
        p.textContent = cat.id === "lang" ? "A language I speak." : "One of my everyday tools.";
        ev.appendChild(p);
      }
      refs.forEach((key, k) => {
        const [label, href, type] = E[key];
        const a = document.createElement("a");
        a.href = href;
        a.className = "sp-ev";
        a.style.animationDelay = k * 0.08 + "s";
        a.innerHTML = '<span class="sp-ev-type"></span><span class="sp-ev-label"></span><span class="sp-ev-go">→</span>';
        a.querySelector(".sp-ev-type").textContent = type;
        a.querySelector(".sp-ev-type").dataset.type = type;
        a.querySelector(".sp-ev-label").textContent = label;
        a.addEventListener("click", (e) => {
          const target = document.querySelector(href);
          if (!target) return;
          e.preventDefault();
          target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
          target.classList.remove("flash");
          void target.offsetWidth;
          target.classList.add("flash");
        });
        ev.appendChild(a);
      });
    }
    panel.appendChild(ev);

    const back = document.createElement("button");
    back.type = "button";
    back.className = "sp-back";
    back.textContent = "← All areas";
    back.addEventListener("click", () => select(null));
    panel.appendChild(back);
  }

  // ---------- State changes ----------
  function select(cat) {
    state.cat = cat;
    state.skill = null;
    layout();
    renderPanel();
  }
  function selectSkill(cat, i) {
    if (state.cat !== cat) { state.cat = cat; layout(); }
    state.skill = i;
    highlight(i);
    renderPanel();
  }

  // ---------- Search ----------
  search.addEventListener("input", () => {
    const q = search.value.trim().toLowerCase();
    if (q.length < 2) return;
    for (const cat of categories) {
      const i = cat.skills.findIndex(([name]) => name.toLowerCase().includes(q));
      if (i !== -1) {
        if (document.getElementById("skillmapView").hidden) setView("map");
        selectSkill(cat, i);
        return;
      }
    }
  });

  // ---------- Map / cards toggle ----------
  const mapView = document.getElementById("skillmapView");
  const cardsView = document.getElementById("skillsCards");
  function setView(v) {
    mapView.hidden = v !== "map";
    cardsView.hidden = v !== "cards";
    document.querySelectorAll(".view-btn").forEach((b) => {
      const on = b.dataset.view === v;
      b.classList.toggle("active", on);
      b.setAttribute("aria-selected", on);
    });
  }
  document.querySelectorAll(".view-btn").forEach((b) => b.addEventListener("click", () => setView(b.dataset.view)));

  // ---------- Start: everything bursts out of the centre ----------
  place(me, CX, CY, 0.6, 0);
  categories.forEach((cat) => {
    place(hubEls[cat.id], CX, CY, 0.2, 0);
    cat.skills.forEach((_, k) => place(skillEls[cat.id + "|" + k], CX, CY, 0.2, 0));
  });
  renderPanel();

  let resizeTimer;
  window.addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { if (state.cat) layout(); }, 200); });

  function start() { requestAnimationFrame(() => requestAnimationFrame(layout)); }
  if (reduceMotion || !("IntersectionObserver" in window)) {
    start();
  } else {
    const obs = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { start(); obs.disconnect(); }
    }, { threshold: 0.25 });
    obs.observe(svg);
  }
})();
