document.addEventListener('DOMContentLoaded', () => {
  const navLinks = [...document.querySelectorAll('.top-nav .nav-link[data-target]')];
  const sections = [...document.querySelectorAll('.section[data-section]')];
  const progressBar = document.querySelector('.scroll-progress__bar');
  const heroContent = document.querySelector('.hero-copy-wrapper');
  const heroHeadline = document.querySelector('.hero-headline');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const getSectionById = (id) => document.querySelector(id);

  if (navLinks.length) {
    navLinks.forEach((link) => {
      const target = link.dataset.target;
      link.addEventListener('click', (event) => {
        const section = getSectionById(target);
        if (section) {
          event.preventDefault();
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  const observerOptions = { threshold: [0.35, 0.6] };
  const activeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.target.dataset.section) return;
      const id = entry.target.dataset.section;
      const link = navLinks.find((item) => item.dataset.target === `#${id}`);
      if (entry.isIntersecting) {
        navLinks.forEach((item) => item.classList.toggle('active', item === link));
      }
    });
  }, observerOptions);

  sections.forEach((section) => activeObserver.observe(section));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.28 });

  document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

  const updateProgress = () => {
    if (!progressBar) return;
    const scrollY = window.scrollY;
    const max = document.body.scrollHeight - window.innerHeight;
    const progress = max > 0 ? (scrollY / max) * 100 : 0;
    progressBar.style.width = `${progress}%`;
  };

  const updateHero = () => {
    if (!heroContent || !heroHeadline) return;
    const scrollY = Math.min(window.scrollY, 420);
    const fade = Math.max(0, 1 - scrollY / 420);
    heroContent.style.opacity = fade;
    heroHeadline.style.transform = `translateY(${scrollY * -0.14}px)`;
  };

  if (!prefersReduced) {
    window.addEventListener('scroll', () => {
      window.requestAnimationFrame(() => {
        updateProgress();
        updateHero();
      });
    }, { passive: true });
  } else {
    document.body.classList.add('reduced-motion');
  }

  updateProgress();
  updateHero();
});
