document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const htmlElement = document.documentElement;
  const header = document.querySelector(".site-header");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Anchor links use native smooth scrolling; CSS scroll-padding clears the header
  const headerOffset = () => (header ? header.offsetHeight : 80);

  /* ===================================
     REVEAL ON SCROLL
     Content only starts hidden once this script is running, and anything
     already on screen is revealed straight away.
     =================================== */
  if (!reduceMotion && "IntersectionObserver" in window) {
    const groups = [
      ".section-title",
      ".split-label",
      ".pub",
      ".prose",
      ".entry",
      ".skill-list",
      ".contact",
    ];
    document.querySelectorAll(groups.join(",")).forEach((el) => el.classList.add("reveal"));

    // Cards rise one after another within each grid
    document.querySelectorAll(".card-grid").forEach((grid) => {
      grid.querySelectorAll(".card").forEach((card, i) => {
        card.classList.add("reveal");
        card.style.setProperty("--reveal-delay", `${(i % 2) * 90}ms`);
      });
    });

    htmlElement.classList.add("motion");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
  }

  /* ===================================
     HEADER + ACTIVE NAV INDICATOR
     =================================== */
  const sections = document.querySelectorAll("main section[id]");
  const navMenu = document.querySelector(".nav-menu");
  const navLinks = document.querySelectorAll(".nav-link");

  const indicator = document.createElement("span");
  indicator.className = "nav-indicator";
  indicator.setAttribute("aria-hidden", "true");
  navMenu?.prepend(indicator);

  function moveIndicator() {
    const active = document.querySelector(".nav-link.active");
    if (!active || !navMenu) {
      indicator.style.opacity = "0";
      return;
    }
    const linkBox = active.getBoundingClientRect();
    const menuBox = navMenu.getBoundingClientRect();
    indicator.style.opacity = "1";
    indicator.style.width = `${linkBox.width}px`;
    indicator.style.transform = `translateX(${linkBox.left - menuBox.left}px)`;
  }

  // Section positions are cached and only re-measured on resize or language change
  let sectionBounds = [];
  function measureSections() {
    sectionBounds = [...sections].map((section) => ({
      id: section.id,
      top: section.offsetTop,
      bottom: section.offsetTop + section.offsetHeight,
    }));
  }

  function updateOnScroll() {
    header?.classList.toggle("scrolled", window.scrollY > 12);

    const probe = window.scrollY + headerOffset() + window.innerHeight * 0.25;
    const current = sectionBounds.find((s) => probe >= s.top && probe < s.bottom)?.id || "";

    let changed = false;
    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${current}`;
      if (link.classList.contains("active") !== isActive) changed = true;
      link.classList.toggle("active", isActive);
    });
    if (changed) moveIndicator();
  }

  // At most one update per frame, however often the browser fires scroll
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateOnScroll();
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    measureSections();
    onScroll();
  });
  window.addEventListener("load", measureSections);
  measureSections();
  updateOnScroll();
  moveIndicator();

  window.addEventListener("resize", moveIndicator);
  // Link widths change when the language or its web font loads
  if ("ResizeObserver" in window && navMenu) {
    const ro = new ResizeObserver(() => moveIndicator());
    navLinks.forEach((link) => ro.observe(link));
  }
  document.fonts?.ready.then(moveIndicator);

  /* ===================================
     LANGUAGE SWITCHER
     =================================== */
  const langSwitcher = document.querySelector("[data-lang-switcher]");
  const langButton = langSwitcher?.querySelector(".lang-button");
  const langLabel = langSwitcher?.querySelector(".lang-label");
  const langMenu = langSwitcher?.querySelector(".lang-menu");
  const langOptions = langMenu?.querySelectorAll(".lang-option") || [];

  const langDisplay = { en: "EN", ku: "KU", ckb: "کو" };
  const rtlLanguages = ["ckb"];
  let currentLang = "en";
  try {
    currentLang = localStorage.getItem("lang") || "en";
  } catch (e) {}
  let isLangMenuOpen = false;

  const openLangMenu = () => {
    if (!langSwitcher || !langButton) return;
    langSwitcher.classList.add("open");
    langButton.setAttribute("aria-expanded", "true");
    isLangMenuOpen = true;
  };

  const closeLangMenu = () => {
    if (!langSwitcher || !langButton) return;
    langSwitcher.classList.remove("open");
    langButton.setAttribute("aria-expanded", "false");
    isLangMenuOpen = false;
  };

  langButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    isLangMenuOpen ? closeLangMenu() : openLangMenu();
  });

  langOptions.forEach((option) => {
    option.addEventListener("click", (event) => {
      event.stopPropagation();
      const lang = option.getAttribute("data-lang");
      if (!lang) return;
      closeLangMenu();
      if (lang === currentLang) return;
      setLanguage(lang, true);
      try {
        localStorage.setItem("lang", lang);
      } catch (e) {}
    });
  });

  document.addEventListener("click", (event) => {
    if (isLangMenuOpen && langSwitcher && !langSwitcher.contains(event.target)) {
      closeLangMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isLangMenuOpen) closeLangMenu();
  });

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function setLanguage(lang, animate = false) {
    try {
      const response = await fetch(`locales/${lang}.json`);
      const translations = await response.json();

      // Fade the page out, swap the text, fade back in
      if (animate && !reduceMotion) {
        htmlElement.classList.add("lang-switching");
        await wait(220);
      }

      if (langLabel) langLabel.textContent = langDisplay[lang] || lang.toUpperCase();
      langOptions.forEach((option) => {
        option.setAttribute("aria-selected", String(option.getAttribute("data-lang") === lang));
      });

      const dir = rtlLanguages.includes(lang) ? "rtl" : "ltr";
      htmlElement.setAttribute("dir", dir);
      body.setAttribute("dir", dir);
      htmlElement.setAttribute("lang", lang);

      updateContent(translations);
      currentLang = lang;
      requestAnimationFrame(() => {
        measureSections();
        moveIndicator();
      });
    } catch (error) {
      console.error("Error loading language file:", error);
    } finally {
      htmlElement.classList.remove("i18n-pending");
      htmlElement.classList.remove("lang-switching");
    }
  }

  function updateContent(translations) {
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.getAttribute("data-i18n");
      if (translations[key]) element.textContent = translations[key];
    });
  }

  setLanguage(currentLang);
});
