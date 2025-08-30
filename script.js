document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 100,
          behavior: "smooth",
        });
      }
    });
  });

  const revealElements = document.querySelectorAll("section, .project");

  const style = document.createElement("style");
  style.textContent = `
    section, .project {
      opacity: 0;
      transform: translateY(30px);
      transition: opacity 0.8s ease, transform 0.8s ease;
    }
    section.revealed, .project.revealed {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(style);

  const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    const revealPoint = 150;
    revealElements.forEach((element) => {
      const elementTop = element.getBoundingClientRect().top;
      if (elementTop < windowHeight - revealPoint) {
        element.classList.add("revealed");
      }
    });
  };

  revealOnScroll();
  window.addEventListener("scroll", revealOnScroll);

  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".nav-link");

  const highlightNav = () => {
    const scrollPosition = window.scrollY;
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 150;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute("id");
      if (
        scrollPosition >= sectionTop &&
        scrollPosition < sectionTop + sectionHeight
      ) {
        navLinks.forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("href") === "#" + sectionId) {
            link.classList.add("active");
          }
        });
      }
    });
  };

  const navStyle = document.createElement("style");
  navStyle.textContent = `
    .nav-link.active {
      font-weight: 500;
    }
    .nav-link.active::after {
      width: 100%;
    }
  `;
  document.head.appendChild(navStyle);

  highlightNav();
  window.addEventListener("scroll", highlightNav);
});
