/* ============================================================
   AKASHA · BACKGROUND
   Stars + matrix rain + sacred geometry — composited.
   ============================================================ */
(function () {
  const canvas = document.getElementById('bg');
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);

  const GLYPHS = '∴∵∞⊙⊚⊛⌬⌘⌖⟁⟁⟁ॐ卐卍ᚠᚢᚦᚨᚱᚲ𓂀𓆣𓏏𓊃𓂘אבגדהוזחטיכלמ☉☽☿♀♂♃♄☥✶✷✸✹✺✻❂❉⚙';

  // Stars
  const stars = [];
  // Matrix columns
  let cols = [];
  // Sacred geometry rotation
  let geoT = 0;

  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    // rebuild stars
    stars.length = 0;
    const N = Math.min(280, Math.floor((W * H) / 6500));
    for (let i = 0; i < N; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.4 + 0.2,
        a: Math.random(),
        s: 0.002 + Math.random() * 0.012,
        hue: Math.random() < 0.85 ? 50 : (Math.random() < 0.5 ? 30 : 200),
      });
    }
    // rebuild matrix columns
    const colW = 18;
    const C = Math.ceil(W / colW);
    cols = new Array(C).fill(0).map(() => ({
      y: Math.random() * -H,
      speed: 0.6 + Math.random() * 1.2,
      glyph: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
      bright: Math.random() < 0.06,
    }));
  }

  function drawStars() {
    for (const s of stars) {
      s.a += s.s;
      const tw = (Math.sin(s.a) + 1) / 2;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${s.hue}, 80%, ${50 + tw * 30}%, ${0.3 + tw * 0.55})`;
      ctx.fill();
    }
  }

  function drawMatrix() {
    ctx.font = '14px IBM Plex Mono, Menlo, monospace';
    const colW = 18;
    for (let i = 0; i < cols.length; i++) {
      const c = cols[i];
      const x = i * colW;
      ctx.fillStyle = c.bright ? 'rgba(247,217,107,0.85)' : 'rgba(212,175,55,0.18)';
      ctx.fillText(c.glyph, x, c.y);
      c.y += c.speed;
      if (c.y > H + 14) {
        c.y = -20;
        c.glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        c.bright = Math.random() < 0.06;
      } else if (Math.random() < 0.02) {
        c.glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
    }
  }

  function drawSacredGeometry() {
    geoT += 0.0015;
    const cx = W / 2, cy = H / 2;
    const baseR = Math.min(W, H) * 0.18;

    // Flower of Life — 7 circles
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(geoT);
    ctx.strokeStyle = 'rgba(212,175,55,0.10)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * baseR, Math.sin(a) * baseR, baseR, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(0, 0, baseR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Outer dodecagon, counter-rotating
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-geoT * 0.6);
    ctx.strokeStyle = 'rgba(247,217,107,0.06)';
    ctx.beginPath();
    const R = baseR * 2.4;
    for (let i = 0; i <= 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const x = Math.cos(a) * R, y = Math.sin(a) * R;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  let running = true;

  function frame() {
    if (!running) return;
    // soft trail
    ctx.fillStyle = 'rgba(5,3,10,0.28)';
    ctx.fillRect(0, 0, W, H);

    drawSacredGeometry();
    drawStars();
    drawMatrix();

    requestAnimationFrame(frame);
  }

  // pause when tab hidden — saves battery on M1 laptops
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      running = false;
    } else if (!running) {
      running = true;
      frame();
    }
  });

  // respect prefers-reduced-motion — render once and stop
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    resize();
    drawSacredGeometry();
    drawStars();
    drawMatrix();
    return;
  }

  window.addEventListener('resize', resize);
  resize();
  frame();
})();
