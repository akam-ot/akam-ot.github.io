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
  const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    const revealPoint = 150;

    revealElements.forEach((element) => {
      const elementTop = element.getBoundingClientRect().top;
      if (elementTop < windowHeight - revealPoint) {
        element.classList.add("revealed");

        // Special handling for about section to ensure smooth animations
        if (element.id === "about") {
          const aboutElements = element.querySelectorAll(
            ".section-header, .about-content, .large-text, .about-details"
          );
          aboutElements.forEach((el, index) => {
            setTimeout(() => {
              el.style.opacity = "1";
              el.style.transform = "translateY(0)";
            }, index * 200); // Stagger the animations
          });
        }
      }
    });
  };

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
        
        #about .section-header,
        #about .about-content,
        #about .large-text,
        #about .about-details {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
    `;
  document.head.appendChild(style);

  revealOnScroll();
  window.addEventListener("scroll", revealOnScroll);
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".nav-link");
  const highlightNav = () => {
    let scrollPosition = window.scrollY;
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
