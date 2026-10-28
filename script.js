// ==========================================================
// Kuenzang Lhamo — Portfolio interactions
// ==========================================================

const root = document.documentElement;

// ---------- 1. Theme toggle (remembers the choice) ----------
const themeToggle = document.getElementById("themeToggle");

function getSavedTheme() {
  try { return localStorage.getItem("theme"); } catch (e) { return null; }
}
function saveTheme(theme) {
  try { localStorage.setItem("theme", theme); } catch (e) { /* storage unavailable */ }
}

const savedTheme = getSavedTheme();
// Dark is the default look; a visitor's own choice is remembered
if (savedTheme) root.setAttribute("data-theme", savedTheme);

themeToggle.addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", next);
  saveTheme(next);
});

// ---------- 2. Mobile navigation menu ----------
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

menuBtn.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuBtn.classList.toggle("open", isOpen);
  menuBtn.setAttribute("aria-expanded", isOpen);
});

// Close the menu after choosing a link
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuBtn.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
  });
});

// ---------- 3. Navbar shadow, active link & back-to-top on scroll ----------
const navbar = document.getElementById("navbar");
const backTop = document.getElementById("backTop");
const sections = document.querySelectorAll("main section[id]");

function onScroll() {
  const y = window.scrollY;
  navbar.classList.toggle("scrolled", y > 20);
  backTop.classList.toggle("show", y > 500);

  // Highlight the nav link for the section currently on screen
  let current = "home";
  sections.forEach((section) => {
    if (y >= section.offsetTop - 120) current = section.id;
  });
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === "#" + current);
  });
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// ---------- 4. Terminal, network background and lab tools live in js/ ----------

// ---------- 5. Skill category filter ----------
const filterBtns = document.querySelectorAll(".filter-btn");
const skillCards = document.querySelectorAll(".skill-card");

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const filter = btn.dataset.filter;
    skillCards.forEach((card) => {
      const show = filter === "all" || card.dataset.category === filter;
      card.classList.toggle("hide", !show);
    });
  });
});

// ---------- 6. Reveal sections as they scroll into view ----------
const revealEls = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => observer.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("visible"));
}

// ---------- 7. Contact form validation ----------
// GitHub Pages has no server, so a valid form opens the visitor's
// email app with the message already filled in.
const form = document.getElementById("contactForm");
const statusEl = document.getElementById("formStatus");
const MY_EMAIL = "klhamo2414@gmail.com";

function setError(input, message) {
  const field = input.parentElement;
  field.classList.toggle("invalid", Boolean(message));
  field.querySelector(".error").textContent = message;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const messageInput = document.getElementById("message");
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const message = messageInput.value.trim();
  let valid = true;

  if (name.length < 2) { setError(nameInput, "Please enter your name."); valid = false; }
  else setError(nameInput, "");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError(emailInput, "Please enter a valid email address."); valid = false; }
  else setError(emailInput, "");

  if (message.length < 10) { setError(messageInput, "Message should be at least 10 characters."); valid = false; }
  else setError(messageInput, "");

  if (!valid) { statusEl.textContent = ""; return; }

  const subject = encodeURIComponent("Portfolio message from " + name);
  const body = encodeURIComponent(message + "\n\nFrom: " + name + " (" + email + ")");
  window.location.href = "mailto:" + MY_EMAIL + "?subject=" + subject + "&body=" + body;

  statusEl.textContent = "Thank you, " + name + "! Your email app is opening to send the message.";
  form.reset();
});

// ---------- 8. Footer year ----------
document.getElementById("year").textContent = new Date().getFullYear();
