document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('profileRoot');
  if (!root) return;
  const btn = document.getElementById('profileBtn');
  const menu = document.getElementById('profileMenu');

  function closeMenu() {
    root.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
  }

  function openMenu() {
    root.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
  }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (root.classList.contains('open')) closeMenu(); else openMenu();
  });

  // close when clicking outside
  document.addEventListener('click', (e) => {
    if (!root.contains(e.target)) closeMenu();
  });
});
