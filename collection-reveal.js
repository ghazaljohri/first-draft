/* =========================================================
   AZELÉ — Collection section cursor-following reveal
   Desktop/pointer devices only; mobile shows the default image.
   ========================================================= */

(() => {
  const media = document.querySelector('.offer-media');
  if (!media) return;

  const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!supportsHover) return;

  function setPosition(event) {
    const rect = media.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    media.style.setProperty('--mx', x + '%');
    media.style.setProperty('--my', y + '%');
  }

  media.addEventListener('mouseenter', (event) => {
    setPosition(event);
    media.classList.add('is-active');
  });

  media.addEventListener('mousemove', setPosition);

  media.addEventListener('mouseleave', () => {
    media.classList.remove('is-active');
  });
})();
