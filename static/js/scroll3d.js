document.addEventListener('DOMContentLoaded', () => {
  const cards = Array.from(document.querySelectorAll('.glass-card'));
  if (!cards.length) return;

  const updateCards = () => {
    const viewportHeight = window.innerHeight;
    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.top + rect.height * 0.5;
      const progress = (viewportHeight * 0.55 - cardCenter) / viewportHeight;
      const rotateX = progress * 18;
      const rotateY = progress * 12;
      const translateZ = Math.max(-12, 36 - Math.abs(progress) * 42);
      const translateY = Math.max(-28, Math.min(28, -progress * 48));
      const opacity = 0.78 + Math.max(0, 1 - Math.abs(progress)) * 0.22;

      card.style.transform = `translate3d(0, ${translateY}px, ${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      card.style.opacity = opacity;
      if (Math.abs(progress) < 0.85) {
        card.dataset.scrollActive = 'true';
      } else {
        delete card.dataset.scrollActive;
      }
    });
  };

  let ticking = false;
  const scheduleUpdate = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateCards();
        ticking = false;
      });
      ticking = true;
    }
  };

  updateCards();
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('wheel', scheduleUpdate, { passive: true });
  window.addEventListener('touchmove', scheduleUpdate, { passive: true });
  window.addEventListener('resize', updateCards);
});
