/* =========================================================
   AZELÉ — Shared nav blur-on-scroll behavior (all pages)
   ========================================================= */

(() => {
  const nav = document.getElementById('site-nav');
  if (!nav) return;

  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
