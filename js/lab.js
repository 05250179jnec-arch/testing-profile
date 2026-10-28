// ==========================================================
// Network Lab tools
// 1. IPv4 subnet calculator (bitwise operations)
// 2. Extended ACL packet simulator
// ==========================================================
(function () {
  // ---------------- 1. Subnet calculator ----------------
  const subnetForm = document.getElementById("subnetForm");
  const ipInput = document.getElementById("ipInput");
  const cidrInput = document.getElementById("cidrInput");
  const errorEl = document.getElementById("subnetError");
  const resultEl = document.getElementById("subnetResult");
  const bitsEl = document.getElementById("bitsView");

  // "192.168.1.10" -> 32-bit unsigned integer, or null if invalid
  function ipToInt(ip) {
    const parts = ip.trim().split(".");
    if (parts.length !== 4) return null;
    let n = 0;
    for (const part of parts) {
      if (!/^\d{1,3}$/.test(part) || Number(part) > 255) return null;
      n = (n << 8) + Number(part);
    }
    return n >>> 0;
  }

  function intToIp(n) {
    return [24, 16, 8, 0].map((shift) => (n >>> shift) & 255).join(".");
  }

  function ipClass(firstOctet) {
    if (firstOctet < 128) return "A";
    if (firstOctet < 192) return "B";
    if (firstOctet < 224) return "C";
    if (firstOctet < 240) return "D (multicast)";
    return "E (reserved)";
  }

  function isPrivate(n) {
    const a = n >>> 24;
    const b = (n >>> 16) & 255;
    return a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
  }

  function calculate() {
    const ip = ipToInt(ipInput.value);
    const cidr = Number(cidrInput.value);

    if (ip === null) { errorEl.textContent = "Enter a valid IPv4 address, e.g. 192.168.10.25"; return; }
    if (!Number.isInteger(cidr) || cidr < 0 || cidr > 32) { errorEl.textContent = "Prefix must be a whole number from 0 to 32."; return; }
    errorEl.textContent = "";

    const mask = cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0;
    const wildcard = ~mask >>> 0;
    const network = (ip & mask) >>> 0;
    const broadcast = (network | wildcard) >>> 0;
    const total = 2 ** (32 - cidr);

    let firstHost, lastHost, usable;
    if (cidr === 32) { firstHost = lastHost = network; usable = 1; }
    else if (cidr === 31) { firstHost = network; lastHost = broadcast; usable = 2; } // point-to-point links (RFC 3021)
    else { firstHost = network + 1; lastHost = broadcast - 1; usable = total - 2; }

    const rows = [
      ["Network", intToIp(network) + "/" + cidr],
      ["Subnet mask", intToIp(mask)],
      ["Wildcard mask", intToIp(wildcard)],
      ["Broadcast", intToIp(broadcast)],
      ["Host range", intToIp(firstHost) + " – " + intToIp(lastHost)],
      ["Usable hosts", usable.toLocaleString()],
      ["Class / type", ipClass(ip >>> 24) + " · " + (isPrivate(ip) ? "private" : "public")]
    ];
    resultEl.innerHTML = "";
    rows.forEach(([label, value]) => {
      const dt = document.createElement("dt");
      const dd = document.createElement("dd");
      dt.textContent = label;
      dd.textContent = value;
      resultEl.append(dt, dd);
    });

    // Binary view: network bits highlighted, host bits plain
    bitsEl.innerHTML = "";
    const binary = ip.toString(2).padStart(32, "0");
    for (let o = 0; o < 4; o++) {
      const octet = document.createElement("span");
      octet.className = "octet";
      for (let i = o * 8; i < o * 8 + 8; i++) {
        const bit = document.createElement("span");
        bit.className = "b " + (i < cidr ? "n" : "h");
        bit.textContent = binary[i];
        octet.appendChild(bit);
      }
      bitsEl.appendChild(octet);
    }
  }

  subnetForm.addEventListener("submit", (e) => { e.preventDefault(); calculate(); });
  cidrInput.addEventListener("input", calculate);
  calculate();

  // ---------------- 2. ACL packet simulator ----------------
  // Extended ACL applied inbound on the bank's edge router.
  const rules = [
    { text: "10 permit tcp 192.168.10.0 0.0.0.255 host 192.168.20.10 eq 3306", action: "permit", src: "staff", dst: "db", port: 3306 },
    { text: "20 deny   tcp any host 192.168.20.10 eq 3306", action: "deny", src: "any", dst: "db", port: 3306 },
    { text: "30 permit tcp any host 192.168.20.5 eq 443", action: "permit", src: "any", dst: "web", port: 443 },
    { text: "40 deny   ip any any", action: "deny", src: "any", dst: "any", port: "any" }
  ];
  const packets = [
    { src: "staff", dst: "web", port: 443, label: "Staff PC → Web server :443" },
    { src: "internet", dst: "db", port: 3306, label: "Internet → DB server :3306" },
    { src: "staff", dst: "db", port: 3306, label: "Staff PC → DB server :3306" },
    { src: "internet", dst: "web", port: 23, label: "Internet → Web server :23" }
  ];

  const aclEl = document.getElementById("aclRules");
  const select = document.getElementById("packetSelect");
  const runBtn = document.getElementById("aclRun");
  const verdict = document.getElementById("aclVerdict");
  const packet1 = document.getElementById("packet");
  const packet2 = document.getElementById("packet2");
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // Render the ACL like router config
  const header = document.createElement("span");
  header.className = "c";
  header.textContent = "R1(config)# ip access-list extended BANK-EDGE";
  aclEl.appendChild(header);
  const ruleEls = rules.map((rule) => {
    const el = document.createElement("span");
    el.className = "rule";
    el.textContent = " " + rule.text;
    aclEl.appendChild(el);
    return el;
  });

  function matches(rule, pkt) {
    const srcOk = rule.src === "any" || rule.src === pkt.src;
    const dstOk = rule.dst === "any" || rule.dst === pkt.dst;
    const portOk = rule.port === "any" || rule.port === pkt.port;
    return srcOk && dstOk && portOk;
  }

  function resetAnim(el) {
    el.className = "packet";
    void el.offsetWidth; // restart CSS animation
  }

  runBtn.addEventListener("click", async () => {
    runBtn.disabled = true;
    const pkt = packets[Number(select.value)];
    ruleEls.forEach((el) => (el.className = "rule"));
    verdict.className = "acl-verdict";
    verdict.textContent = "Packet arriving at R1...";
    resetAnim(packet1);
    resetAnim(packet2);

    packet1.classList.add("go");
    await wait(850);

    // Check rules top-down; first match wins
    let matched = null;
    for (let i = 0; i < rules.length; i++) {
      ruleEls[i].classList.add("checking");
      verdict.textContent = "Checking rule " + rules[i].text.split(" ")[0] + "...";
      await wait(550);
      ruleEls[i].classList.remove("checking");
      if (matches(rules[i], pkt)) { matched = i; break; }
    }

    const rule = rules[matched];
    ruleEls[matched].classList.add(rule.action === "permit" ? "match-permit" : "match-deny");

    if (rule.action === "permit") {
      packet2.classList.add("go");
      verdict.classList.add("permit");
      verdict.textContent = "✔ PERMITTED by rule " + rule.text.split(" ")[0] + " — " + pkt.label + " delivered.";
    } else {
      packet1.className = "packet dropped";
      verdict.classList.add("deny");
      verdict.textContent = "✖ DENIED by rule " + rule.text.split(" ")[0] + " — " + pkt.label + " dropped.";
    }
    runBtn.disabled = false;
  });
})();
