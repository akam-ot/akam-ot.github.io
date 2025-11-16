document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const htmlElement = document.documentElement;

  const langSwitcher = document.querySelector("[data-lang-switcher]");
  const langButton = langSwitcher?.querySelector(".lang-button");
  const langLabel = langSwitcher?.querySelector(".lang-label");
  const langMenu = langSwitcher?.querySelector(".lang-menu");
  const langOptions = langMenu?.querySelectorAll(".lang-option") || [];
  
  const langDisplay = {
    en: "EN",
    ku: "KU",
    ckb: "کو"
  };
  const rtlLanguages = ["ckb"];
  let currentLang = localStorage.getItem("lang") || "en";
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

  if (langButton) {
    langButton.addEventListener("click", (event) => {
      event.stopPropagation();
      if (isLangMenuOpen) {
        closeLangMenu();
      } else {
        openLangMenu();
      }
    });
  }

  langOptions.forEach((option) => {
    option.addEventListener("click", (event) => {
      event.stopPropagation();
      const lang = option.getAttribute("data-lang");
      if (lang) {
        setLanguage(lang);
        localStorage.setItem("lang", lang);
        closeLangMenu();
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (
      isLangMenuOpen &&
      langSwitcher &&
      !langSwitcher.contains(event.target)
    ) {
      closeLangMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isLangMenuOpen) {
      closeLangMenu();
    }
  });

  async function setLanguage(lang) {
    try {
      const response = await fetch(`locales/${lang}.json`);
      const translations = await response.json();

      if (langLabel) {
        langLabel.textContent = langDisplay[lang] || lang.toUpperCase();
      }

      langOptions.forEach((option) => {
        const isActive = option.getAttribute("data-lang") === lang;
        option.setAttribute("aria-selected", isActive.toString());
      });

      if (rtlLanguages.includes(lang)) {
        htmlElement.setAttribute("dir", "rtl");
        body.setAttribute("dir", "rtl");
      } else {
        htmlElement.setAttribute("dir", "ltr");
        body.setAttribute("dir", "ltr");
      }

      htmlElement.setAttribute("lang", lang);

      updateContent(translations);
      currentLang = lang;
    } catch (error) {
      console.error("Error loading language file:", error);
    }
  }

  function updateContent(translations) {
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.getAttribute("data-i18n");
      if (translations[key]) {
        element.textContent = translations[key];
      }
    });

    document.querySelectorAll("[data-i18n-html]").forEach((element) => {
      const key = element.getAttribute("data-i18n-html");
      if (translations[key]) {
        element.innerHTML = translations[key];
      }
    });
  }

  setLanguage(currentLang);

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const headerOffset = 100;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    });
  });

  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  function highlightNav() {
    let scrollPosition = window.scrollY + 150;
    let current = "";

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute("id");

      if (
        scrollPosition >= sectionTop - 100 &&
        scrollPosition < sectionTop + sectionHeight - 100
      ) {
        current = sectionId;
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");
      const href = link.getAttribute("href");
      if (href === "#" + current || (current === "" && href === "#hero")) {
        link.classList.add("active");
      }
    });
  }

  window.addEventListener("scroll", highlightNav);
  highlightNav();
});
