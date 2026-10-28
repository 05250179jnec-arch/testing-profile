// ==========================================================
// Interactive terminal in the hero section
// Supports command history (↑/↓), Tab completion and
// commands that navigate the page or print information.
// ==========================================================
(function () {
  const output = document.getElementById("termOutput");
  const form = document.getElementById("termForm");
  const input = document.getElementById("termInput");
  const body = document.getElementById("termBody");

  const history = [];
  let historyIndex = 0;
  let busy = false;

  // ---------- Output helpers ----------
  // Each line is [text, cssClass]; text is always set with textContent
  // so nothing a visitor types can inject HTML.
  function print(text, cls = "out") {
    const p = document.createElement("p");
    p.className = cls;
    p.textContent = text;
    output.appendChild(p);
    body.scrollTop = body.scrollHeight;
  }
  function printLines(lines) {
    lines.forEach((line) => (Array.isArray(line) ? print(line[0], line[1]) : print(line)));
  }
  function printLink(label, href) {
    const p = document.createElement("p");
    p.className = "out";
    const a = document.createElement("a");
    a.href = href;
    a.textContent = label;
    if (href.startsWith("http")) { a.target = "_blank"; a.rel = "noopener"; }
    p.appendChild(a);
    output.appendChild(p);
  }
  function goTo(id) {
    document.getElementById(id).scrollIntoView({ behavior: "smooth" });
  }
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // ---------- Commands ----------
  const commands = {
    help: {
      desc: "list available commands",
      run() {
        print("Available commands:");
        Object.keys(commands).forEach((name) => {
          print("  " + name.padEnd(11) + commands[name].desc, "out");
        });
        print("Tip: use ↑/↓ for history and Tab to autocomplete.", "warn");
      }
    },
    whoami: {
      desc: "who I am",
      run() {
        printLines([
          ["Kuenzang Lhamo", "ok"],
          "Diploma student — Computer System & Network",
          "Jigme Namgyel Engineering College, Bhutan",
          "Focus: networking · cybersecurity · web development"
        ]);
      }
    },
    about: {
      desc: "jump to About Me",
      run() { print("cd ~/about ...", "ok"); goTo("about"); }
    },
    skills: {
      desc: "print my skills",
      run() {
        printLines([
          ["[network]  ", "kw"],
          "  Packet Tracer, BGP/eBGP, ACLs, DHCP, subnetting",
          ["[systems]  ", "kw"],
          "  Ubuntu Server, Linux server admin, VirtualBox",
          ["[web]      ", "kw"],
          "  HTML, CSS, JavaScript, Node.js/Express, PHP/Laravel, MySQL, Git",
          ["[python]   ", "kw"],
          "  Tkinter GUI apps",
          ["[iot]      ", "kw"],
          "  Arduino Uno, PIR & ultrasonic sensors, servos, relays",
          ["[security] ", "kw"],
          "  1st place, National CTF 2026; practice on CyLab & TryHackMe"
        ]);
      }
    },
    projects: {
      desc: "list my projects",
      run() {
        printLines([
          "0. AutoConnection (in progress) React + Node + MySQL",
          "1. JNEC Events Hub ............ HTML/CSS/JS",
          "2. Task Manager (Task API) .... Express + MySQL",
          "3. Bank Network ............... eBGP + ACL",
          "4. DHCP Server Lab ............ Ubuntu Server",
          "5. Smart Room Automation ...... Arduino + sensors",
          "6. DRUK SPORTS (hackathon) .... startup pitch"
        ]);
        print("Scrolling to projects...", "ok");
        goTo("projects");
      }
    },
    certs: {
      desc: "list my certificates",
      run() {
        printLines([
          ["[cisco]    ", "kw"],
          "  CCNA: Introduction to Networks ............ Jul 2026",
          "  CCNA: Switching, Routing & Wireless ....... Jul 2026",
          ["[coursera] ", "kw"],
          "  Becoming a Linux Server Admin ............. Sep 2026",
          "  Full-Stack Web Dev with Laravel & PHP ..... Sep 2026",
          "  Python Tkinter: GUIs ...................... Sep 2026"
        ]);
        print("Scrolling to certificates...", "ok");
        goTo("certificates");
      }
    },
    experience: {
      desc: "show my volunteer experience",
      run() {
        printLines([
          ["Industry Study Tour — Oct 2026", "ok"],
          "GovTech · IT Park · aBIT · NUK9 · Dragon Coders · Selise",
          "",
          ["Student Volunteer — PRF-26", "ok"],
          "26th APT Policy and Regulatory Forum",
          "Le Méridien, Paro · 15–17 Sep 2026",
          "Worked with the GovTech Agency Protocol Team",
          "",
          ["🏆 Winner (1st place) — National CTF 2026", "ok"],
          "2-day cybersecurity CTF · GCIT vs JNEC vs CST",
          "",
          ["Participant — JST exchange program, Japan", "ok"],
          "Science & technology exchange (Japan Science and Technology Agency)"
        ]);
        goTo("experience");
      }
    },
    education: {
      desc: "jump to Education",
      run() { print("cd ~/education ...", "ok"); goTo("education"); }
    },
    lab: {
      desc: "open the network lab tools",
      run() { print("Opening subnet calculator & ACL simulator...", "ok"); goTo("lab"); }
    },
    contact: {
      desc: "show contact details",
      run() {
        print("email:", "kw");
        printLink("  klhamo2414@gmail.com", "mailto:klhamo2414@gmail.com");
        print("location: Taba, Thimphu, Bhutan");
      }
    },
    ping: {
      desc: "ping a host, e.g. ping jnec.edu.bt",
      async run(args) {
        const host = args[0] || "jnec.edu.bt";
        print("PING " + host + " 56(84) bytes of data. (simulated)");
        const times = [];
        for (let seq = 1; seq <= 4; seq++) {
          await wait(450);
          const ms = (8 + Math.random() * 30).toFixed(1);
          times.push(Number(ms));
          print("64 bytes from " + host + ": icmp_seq=" + seq + " ttl=57 time=" + ms + " ms");
        }
        const avg = (times.reduce((a, b) => a + b, 0) / times.length).toFixed(1);
        print("--- " + host + " ping statistics ---");
        print("4 packets transmitted, 4 received, 0% packet loss, avg " + avg + " ms", "ok");
      }
    },
    ipconfig: {
      desc: "show my lab interface (simulated)",
      run() {
        printLines([
          "Ethernet adapter LAB-LAN:   (simulated)",
          "   IPv4 Address . . . . : 192.168.10.25",
          "   Subnet Mask  . . . . : 255.255.255.192  (/26)",
          "   Default Gateway  . . : 192.168.10.1",
          "   DHCP Server  . . . . : 192.168.10.2",
          ["Try the subnet calculator: type 'lab'", "warn"]
        ]);
      }
    },
    traceroute: {
      desc: "trace a route, e.g. traceroute isp",
      async run(args) {
        const host = args[0] || "isp-gateway";
        print("traceroute to " + host + ", 30 hops max (simulated)");
        const hops = ["192.168.10.1  (LAN gateway)", "10.0.0.1      (bank edge router)", "203.0.113.1   (ISP — eBGP peer)", host];
        for (let i = 0; i < hops.length; i++) {
          await wait(500);
          print(" " + (i + 1) + "  " + hops[i] + "  " + (2 + i * 6 + Math.random() * 3).toFixed(2) + " ms");
        }
      }
    },
    theme: {
      desc: "switch dark / light theme",
      run() {
        document.getElementById("themeToggle").click();
        print("Theme set to " + document.documentElement.getAttribute("data-theme") + ".", "ok");
      }
    },
    date: {
      desc: "show the current date and time",
      run() { print(new Date().toString()); }
    },
    echo: {
      desc: "print text back",
      run(args) { print(args.join(" ")); }
    },
    sudo: {
      desc: "try it ;)",
      run() { print("kuenzang is not in the sudoers file. This incident will be reported.", "err"); }
    },
    clear: {
      desc: "clear the screen",
      run() { output.innerHTML = ""; }
    }
  };

  // ---------- Running a command ----------
  async function execute(raw) {
    const line = raw.trim();
    print("kuenzang@jnec:~$ " + line, "cmd");
    if (!line) return;

    history.push(line);
    historyIndex = history.length;

    const [name, ...args] = line.split(/\s+/);
    const command = commands[name.toLowerCase()];
    if (!command) {
      print(name + ": command not found. Type 'help' for a list.", "err");
      return;
    }
    busy = true;
    input.disabled = true;
    try {
      await command.run(args);
    } finally {
      busy = false;
      input.disabled = false;
      body.scrollTop = body.scrollHeight;
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (busy) return;
    const value = input.value;
    input.value = "";
    await execute(value);
    input.focus({ preventScroll: true });
  });

  // History and Tab completion
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" && history.length) {
      e.preventDefault();
      historyIndex = Math.max(0, historyIndex - 1);
      input.value = history[historyIndex];
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      historyIndex = Math.min(history.length, historyIndex + 1);
      input.value = history[historyIndex] || "";
    } else if (e.key === "Tab") {
      e.preventDefault();
      const matches = Object.keys(commands).filter((c) => c.startsWith(input.value.toLowerCase()));
      if (matches.length === 1) input.value = matches[0] + " ";
      else if (matches.length > 1) print(matches.join("  "), "warn");
    }
  });

  // Clicking anywhere in the terminal focuses the input
  body.addEventListener("click", () => input.focus({ preventScroll: true }));

  // Quick command buttons
  document.querySelectorAll(".term-chips button").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!busy) execute(btn.dataset.cmd);
    });
  });
})();
