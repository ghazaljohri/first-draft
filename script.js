/* =========================================================
   AZELÉ — Self-playing image-sequence engine
   ========================================================= */

(() => {
  const FRAME_COUNT = 240;
  const FRAME_PATH = (i) => `frames/frame_${String(i).padStart(4, '0')}.jpg`;
  const BG_COLOR = '#A5A49F'; // must match --bg in styles.css / frame backdrop

  const canvas = document.getElementById('frame-canvas');
  const ctx = canvas.getContext('2d');
  const sequenceSection = document.getElementById('story');
  const progressFill = document.getElementById('progress-fill');
  const captions = Array.from(document.querySelectorAll('.stage-caption'));

  const images = new Array(FRAME_COUNT + 1); // 1-indexed

  // ---------- playback state ----------
  const CYCLE_MS = 12000; // full forward + reverse loop duration
  let cycleStart = null;
  let playing = false;

  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let canvasCssW = 0, canvasCssH = 0;

  // ---------- preload ----------
  function preloadFrames() {
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.src = FRAME_PATH(i);
      images[i] = img;
    }
  }

  // ---------- canvas sizing ----------
  function resizeCanvas() {
    canvasCssW = window.innerWidth;
    canvasCssH = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvasCssW * dpr);
    canvas.height = Math.round(canvasCssH * dpr);
    canvas.style.width = canvasCssW + 'px';
    canvas.style.height = canvasCssH + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // ---------- draw ----------
  function drawFrame(index) {
    const img = images[index];

    // fill background first so any letterboxed edge matches the page exactly
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvasCssW, canvasCssH);

    if (!img || !img.complete || img.naturalWidth === 0) return;

    // "cover" fit: fill the viewport, cropping overflow, no visible seam
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const canvasRatio = canvasCssW / canvasCssH;
    const imgRatio = iw / ih;

    let drawW, drawH, offsetX, offsetY;
    if (imgRatio > canvasRatio) {
      drawH = canvasCssH;
      drawW = drawH * imgRatio;
      offsetX = (canvasCssW - drawW) / 2;
      offsetY = 0;
    } else {
      drawW = canvasCssW;
      drawH = drawW / imgRatio;
      offsetX = 0;
      offsetY = (canvasCssH - drawH) / 2;
    }

    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
  }

  function updateCaptions(progress) {
    // beat windows: intro / mid / outro, same three narrative beats as before
    const beats = [
      { el: captions[0], from: 0.02, to: 0.30 },
      { el: captions[1], from: 0.38, to: 0.66 },
      { el: captions[2], from: 0.74, to: 0.98 },
    ];
    beats.forEach(b => {
      if (!b.el) return;
      const visible = progress >= b.from && progress <= b.to;
      b.el.classList.toggle('is-visible', visible);
    });
  }

  function easeInOutSine(x) {
    return 0.5 - 0.5 * Math.cos(Math.PI * x);
  }

  // ---------- self-playing loop: shadow -> gown -> shadow, forever ----------
  function tick(now) {
    if (playing) {
      if (cycleStart === null) cycleStart = now;
      const half = CYCLE_MS / 2;
      const elapsed = (now - cycleStart) % CYCLE_MS;
      const rawT = elapsed < half ? elapsed / half : (CYCLE_MS - elapsed) / half; // 0 -> 1 -> 0
      const progress = easeInOutSine(rawT);
      const frame = Math.round(1 + progress * (FRAME_COUNT - 1));

      drawFrame(frame);
      progressFill.style.width = (progress * 100).toFixed(2) + '%';
      updateCaptions(progress);
    }
    requestAnimationFrame(tick);
  }

  // ---------- pause the loop while the stage is off-screen ----------
  const stageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      playing = entry.isIntersecting;
      if (playing) cycleStart = null; // restart the cycle cleanly on re-entry
    });
  }, { threshold: 0.15 });
  stageObserver.observe(sequenceSection);

  // ---------- events ----------
  window.addEventListener('resize', resizeCanvas);

  // ---------- boot ----------
  resizeCanvas();
  drawFrame(1); // draw placeholder frame immediately so canvas is never blank
  preloadFrames();
  requestAnimationFrame(tick);
})();
