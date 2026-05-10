/* ============================================================
   AKASHA · FRACTALS
   Mandelbrot · Julia · Sierpinski · Flower of Life · Metatron
   ============================================================ */
window.AKASHA_FRACTALS = (function () {
  function ctxOf(canvas) {
    return canvas.getContext('2d', { willReadFrequently: false });
  }
  function clear(canvas, color = '#000') {
    const ctx = ctxOf(canvas);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Cancel any in-flight animation when switching fractals
  let activeRAF = null;
  function cancelActive() {
    if (activeRAF != null) { cancelAnimationFrame(activeRAF); activeRAF = null; }
  }

  // Palette: dark indigo → crimson → gold → cream
  function palette(t) {
    if (t >= 1) return [5, 3, 10];
    const stops = [
      [0.00, [10, 6, 30]],
      [0.25, [42, 27, 93]],
      [0.50, [139, 30, 43]],
      [0.75, [212, 175, 55]],
      [1.00, [247, 217, 107]],
    ];
    for (let i = 0; i < stops.length - 1; i++) {
      const [a, ca] = stops[i], [b, cb] = stops[i + 1];
      if (t >= a && t <= b) {
        const k = (t - a) / (b - a);
        return [
          ca[0] + (cb[0] - ca[0]) * k | 0,
          ca[1] + (cb[1] - ca[1]) * k | 0,
          ca[2] + (cb[2] - ca[2]) * k | 0,
        ];
      }
    }
    return [247, 217, 107];
  }

  // ---------- MANDELBROT ----------
  function mandelbrot(canvas) {
    cancelActive();
    const ctx = ctxOf(canvas);
    const W = canvas.width, H = canvas.height;
    const img = ctx.createImageData(W, H);
    const data = img.data;
    const maxIter = 120;
    const xmin = -2.2, xmax = 1.0, ymin = -1.2, ymax = 1.2;
    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        const x0 = xmin + (px / W) * (xmax - xmin);
        const y0 = ymin + (py / H) * (ymax - ymin);
        let x = 0, y = 0, i = 0;
        while (x * x + y * y <= 4 && i < maxIter) {
          const xt = x * x - y * y + x0;
          y = 2 * x * y + y0;
          x = xt;
          i++;
        }
        const t = i === maxIter ? 1 : i / maxIter;
        const [r, g, b] = palette(1 - t);
        const idx = (py * W + px) * 4;
        data[idx]   = r;
        data[idx+1] = g;
        data[idx+2] = b;
        data[idx+3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  // ---------- JULIA ----------
  function julia(canvas, cre = -0.8, cim = 0.156) {
    cancelActive();
    const ctx = ctxOf(canvas);
    const W = canvas.width, H = canvas.height;
    const img = ctx.createImageData(W, H);
    const data = img.data;
    const maxIter = 140;
    const span = 1.6;
    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        let x = (px / W) * (span * 2) - span;
        let y = (py / H) * (span * 2) - span;
        let i = 0;
        while (x * x + y * y <= 4 && i < maxIter) {
          const xt = x * x - y * y + cre;
          y = 2 * x * y + cim;
          x = xt;
          i++;
        }
        const t = i === maxIter ? 1 : i / maxIter;
        const [r, g, b] = palette(t);
        const idx = (py * W + px) * 4;
        data[idx]   = r;
        data[idx+1] = g;
        data[idx+2] = b;
        data[idx+3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  // ---------- SIERPINSKI ----------
  function sierpinski(canvas) {
    cancelActive();
    clear(canvas, '#05030a');
    const ctx = ctxOf(canvas);
    const W = canvas.width, H = canvas.height;
    const verts = [
      { x: W / 2,  y: 20 },
      { x: 20,     y: H - 20 },
      { x: W - 20, y: H - 20 },
    ];
    let p = { x: W / 2, y: H / 2 };
    const N = 60000;
    const data = ctx.createImageData(W, H);
    const pix = data.data;
    for (let i = 0; i < N; i++) {
      const v = verts[(Math.random() * 3) | 0];
      p = { x: (p.x + v.x) / 2, y: (p.y + v.y) / 2 };
      const t = i / N;
      const [r, g, b] = palette(t);
      const idx = ((p.y | 0) * W + (p.x | 0)) * 4;
      pix[idx]   = Math.min(255, pix[idx]   + r);
      pix[idx+1] = Math.min(255, pix[idx+1] + g);
      pix[idx+2] = Math.min(255, pix[idx+2] + b);
      pix[idx+3] = 255;
    }
    ctx.putImageData(data, 0, 0);
  }

  // ---------- FLOWER OF LIFE ----------
  function flower(canvas) {
    cancelActive();
    clear(canvas, '#05030a');
    const ctx = ctxOf(canvas);
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const r = Math.min(W, H) / 8;

    ctx.lineWidth = 1.2;
    function ring(rings, alpha) {
      ctx.strokeStyle = `rgba(247,217,107,${alpha})`;
      for (let q = 0; q < rings; q++) {
        const layerR = r * q;
        const count = q === 0 ? 1 : 6 * q;
        for (let i = 0; i < count; i++) {
          const a = (i / count) * Math.PI * 2;
          const x = cx + Math.cos(a) * layerR;
          const y = cy + Math.sin(a) * layerR;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }
    ring(4, 0.45);
    ring(3, 0.85);

    // outer enclosing circle
    ctx.strokeStyle = 'rgba(212,175,55,0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 3.2, 0, Math.PI * 2);
    ctx.stroke();
  }

  // ---------- METATRON'S CUBE ----------
  function metatron(canvas) {
    cancelActive();
    clear(canvas, '#05030a');
    const ctx = ctxOf(canvas);
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const R = Math.min(W, H) * 0.36;

    // 13 nodes: 1 center + 6 inner hex + 6 outer hex
    const nodes = [{ x: cx, y: cy }];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
      nodes.push({ x: cx + Math.cos(a) * R * 0.5, y: cy + Math.sin(a) * R * 0.5 });
    }
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
      nodes.push({ x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R });
    }

    // every line between every pair
    ctx.strokeStyle = 'rgba(212,175,55,0.28)';
    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
      }
    }

    // 13 circles on each node
    ctx.strokeStyle = 'rgba(247,217,107,0.85)';
    ctx.lineWidth = 1.4;
    const cr = R * 0.18;
    for (const n of nodes) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, cr, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // ---------- CHAOS GAME (animated Sierpinski) ----------
  // Same algorithm as sierpinski() but watchable: ~90 dots per animation
  // frame so you see the fractal emerge from random midpoint jumps.
  function chaosGame(canvas) {
    cancelActive();
    clear(canvas, '#05030a');
    const ctx = ctxOf(canvas);
    const W = canvas.width, H = canvas.height;
    const margin = 36;
    const verts = [
      { x: W / 2,      y: margin,     label: 'A' },
      { x: margin,     y: H - margin, label: 'B' },
      { x: W - margin, y: H - margin, label: 'C' },
    ];

    // Draw the three vertices as gold dots with labels
    ctx.font = "bold 16px 'IBM Plex Mono', ui-monospace, monospace";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const v of verts) {
      ctx.fillStyle = 'rgba(247,217,107,0.95)';
      ctx.beginPath();
      ctx.arc(v.x, v.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(247,217,107,0.85)';
      const lx = v.x === W / 2 ? v.x : (v.x < W / 2 ? v.x - 18 : v.x + 18);
      const ly = v.y < H / 2 ? v.y - 18 : v.y + 18;
      ctx.fillText(v.label, lx, ly);
    }

    let p = { x: W / 2, y: H / 2 };
    const N_TOTAL = 22000;
    const PER_FRAME = 110;
    let i = 0;

    function step() {
      for (let k = 0; k < PER_FRAME && i < N_TOTAL; k++, i++) {
        const v = verts[(Math.random() * 3) | 0];
        p = { x: (p.x + v.x) / 2, y: (p.y + v.y) / 2 };
        const t = i / N_TOTAL;
        const [r, g, b] = palette(t);
        ctx.fillStyle = `rgba(${r},${g},${b},0.85)`;
        ctx.fillRect(p.x | 0, p.y | 0, 2, 2);
      }
      // Footer counter
      ctx.fillStyle = 'rgba(5,3,10,0.85)';
      ctx.fillRect(W - 130, H - 28, 122, 22);
      ctx.fillStyle = 'rgba(247,217,107,0.9)';
      ctx.font = "11px 'IBM Plex Mono', ui-monospace, monospace";
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(`n = ${i.toLocaleString()}`, W - 14, H - 17);

      if (i < N_TOTAL) activeRAF = requestAnimationFrame(step);
      else activeRAF = null;
    }
    step();
  }

  return { mandelbrot, julia, sierpinski, flower, metatron, chaosGame };
})();
