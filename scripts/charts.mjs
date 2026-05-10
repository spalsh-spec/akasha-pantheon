// Generate SVG charts from benchmark data → public/docs/charts/*.svg
// Pure SVG, no deps. Anthropic palette.
import fs from 'node:fs/promises';

const DATA = '/Users/sparshsharma/akasha-pantheon/public/docs/data/benchmark.json';
const OUT  = '/Users/sparshsharma/akasha-pantheon/public/docs/charts';

const C = { dark:'#141413', text:'#3d3a32', dim:'#6b6960', mute:'#97948a',
  bg:'#fbf8ef', border:'#d6d2bf', orange:'#d97757', blue:'#6a9bcc', green:'#788c5d', soft:'#f4dfd2' };

const $ = await fs.readFile(DATA, 'utf8').then(JSON.parse);
const FAST = $.summary.byProvider.ollama;
const DEEP = $.summary.byProvider.cloudflare;
const RESULTS = $.results;

function svgWrap(w, h, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="auto" font-family="'IBM Plex Mono', ui-monospace, monospace" style="display:block;">${body}</svg>`;
}

/* 1. LATENCY COMPARISON ------------------------------------- */
function chartLatency() {
  const w = 700, h = 280, pad = { l: 90, r: 30, t: 30, b: 60 };
  const max = Math.max(FAST.latency_ms.max, DEEP.latency_ms.max) * 1.1;
  const barW = 36;
  const groups = [
    { label: 'min',    fast: FAST.latency_ms.min,    deep: DEEP.latency_ms.min },
    { label: 'median', fast: FAST.latency_ms.median, deep: DEEP.latency_ms.median },
    { label: 'mean',   fast: FAST.latency_ms.mean,   deep: DEEP.latency_ms.mean },
    { label: 'max',    fast: FAST.latency_ms.max,    deep: DEEP.latency_ms.max },
  ];
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const groupW = innerW / groups.length;
  const y = v => pad.t + innerH - (v / max) * innerH;
  const yAxis = [0, 5000, 10000, 15000, 20000].filter(v => v <= max);
  const body = `
    ${yAxis.map(v => `
      <line x1="${pad.l}" x2="${w - pad.r}" y1="${y(v)}" y2="${y(v)}" stroke="${C.border}" stroke-dasharray="2 4" />
      <text x="${pad.l - 8}" y="${y(v) + 4}" text-anchor="end" fill="${C.dim}" font-size="11">${(v/1000).toFixed(0)}s</text>
    `).join('')}
    ${groups.map((g, i) => {
      const cx = pad.l + groupW * (i + 0.5);
      return `
        <rect x="${cx - barW - 4}" y="${y(g.fast)}" width="${barW}" height="${innerH - (y(g.fast) - pad.t)}" fill="${C.blue}" />
        <rect x="${cx + 4}" y="${y(g.deep)}" width="${barW}" height="${innerH - (y(g.deep) - pad.t)}" fill="${C.orange}" />
        <text x="${cx - barW/2 - 4}" y="${y(g.fast) - 6}" text-anchor="middle" fill="${C.text}" font-size="10">${(g.fast/1000).toFixed(1)}</text>
        <text x="${cx + barW/2 + 4}" y="${y(g.deep) - 6}" text-anchor="middle" fill="${C.text}" font-size="10">${(g.deep/1000).toFixed(1)}</text>
        <text x="${cx}" y="${h - pad.b + 18}" text-anchor="middle" fill="${C.dim}" font-size="11" font-weight="500">${g.label}</text>
      `;
    }).join('')}
    <line x1="${pad.l}" x2="${pad.l}" y1="${pad.t}" y2="${h - pad.b}" stroke="${C.dark}" />
    <line x1="${pad.l}" x2="${w - pad.r}" y1="${h - pad.b}" y2="${h - pad.b}" stroke="${C.dark}" />
    <g transform="translate(${pad.l + 8},${h - 12})">
      <rect x="0" y="-9" width="12" height="9" fill="${C.blue}" /><text x="18" y="-1" fill="${C.text}" font-size="11">FAST · gemma3:4b · local M1</text>
      <rect x="220" y="-9" width="12" height="9" fill="${C.orange}" /><text x="238" y="-1" fill="${C.text}" font-size="11">DEEP · llama 3.3 70B · cloud</text>
    </g>
  `;
  return svgWrap(w, h, body);
}

/* 2. CONFIDENCE DISTRIBUTION (per question) ---------------- */
function chartConfidence() {
  const w = 700, h = 320, pad = { l: 60, r: 30, t: 24, b: 90 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const questions = [...new Set(RESULTS.filter(r => r.ok).map(r => r.question))];
  const groupW = innerW / questions.length;
  const y = v => pad.t + innerH - v * innerH;
  const yAxis = [0, 0.25, 0.5, 0.75, 1.0];
  const body = `
    ${yAxis.map(v => `
      <line x1="${pad.l}" x2="${w - pad.r}" y1="${y(v)}" y2="${y(v)}" stroke="${C.border}" stroke-dasharray="2 4" />
      <text x="${pad.l - 8}" y="${y(v) + 4}" text-anchor="end" fill="${C.dim}" font-size="11">${(v*100).toFixed(0)}%</text>
    `).join('')}
    ${questions.map((q, i) => {
      const cx = pad.l + groupW * (i + 0.5);
      const fast = RESULTS.find(r => r.provider === 'ollama' && r.question === q && r.ok);
      const deep = RESULTS.find(r => r.provider === 'cloudflare' && r.question === q && r.ok);
      const dotR = 8;
      const truncQ = q.length > 26 ? q.slice(0, 24) + '…' : q;
      return `
        ${fast ? `<circle cx="${cx - 9}" cy="${y(fast.confidence)}" r="${dotR}" fill="${C.blue}" stroke="${C.dark}" stroke-width="0.8" />` : ''}
        ${deep ? `<circle cx="${cx + 9}" cy="${y(deep.confidence)}" r="${dotR}" fill="${C.orange}" stroke="${C.dark}" stroke-width="0.8" />` : ''}
        <text x="${cx}" y="${h - pad.b + 14}" text-anchor="end" fill="${C.dim}" font-size="10" transform="rotate(-25 ${cx} ${h - pad.b + 14})">${truncQ}</text>
      `;
    }).join('')}
    <line x1="${pad.l}" x2="${pad.l}" y1="${pad.t}" y2="${h - pad.b}" stroke="${C.dark}" />
    <line x1="${pad.l}" x2="${w - pad.r}" y1="${h - pad.b}" y2="${h - pad.b}" stroke="${C.dark}" />
    <text x="${pad.l - 38}" y="${pad.t + innerH/2}" fill="${C.dim}" font-size="11" transform="rotate(-90 ${pad.l - 38} ${pad.t + innerH/2})" text-anchor="middle">self-reported confidence</text>
    <g transform="translate(${pad.l + 8},${pad.t - 4})">
      <circle cx="6" cy="-2" r="6" fill="${C.blue}" /><text x="16" y="2" fill="${C.text}" font-size="11">FAST</text>
      <circle cx="68" cy="-2" r="6" fill="${C.orange}" /><text x="78" y="2" fill="${C.text}" font-size="11">DEEP</text>
    </g>
  `;
  return svgWrap(w, h, body);
}

/* 3. FORMAT ADHERENCE + TRADITION COVERAGE ---------------- */
function chartCoverage() {
  const w = 700, h = 240, pad = { l: 100, r: 30, t: 28, b: 30 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const rows = [
    { label:'Format adherence (6/6 keys)', fast: FAST.format_adherence, deep: DEEP.format_adherence, fmt: v => (v*100).toFixed(0) + '%' },
    { label:'Tradition cited per answer', fast: FAST.avg_traditions_cited_per_answer / 3, deep: DEEP.avg_traditions_cited_per_answer / 3, fmt: v => (v*3).toFixed(1) },
    { label:'Mean confidence (calibration)', fast: FAST.confidence.mean, deep: DEEP.confidence.mean, fmt: v => v.toFixed(2) },
    { label:'Avg chars (compactness)',     fast: 1 - FAST.avg_chars/1500, deep: 1 - DEEP.avg_chars/1500, fmt: v => Math.round((1-v)*1500) + 'c' },
  ];
  const rowH = innerH / rows.length;
  const body = `
    ${rows.map((r, i) => {
      const yMid = pad.t + rowH * (i + 0.5);
      const barFastW = r.fast * (innerW * 0.5 - 14);
      const barDeepW = r.deep * (innerW * 0.5 - 14);
      const cx = pad.l + innerW * 0.5;
      return `
        <text x="${pad.l - 12}" y="${yMid + 4}" text-anchor="end" fill="${C.text}" font-size="12">${r.label}</text>
        <rect x="${cx - barFastW}" y="${yMid - 11}" width="${barFastW}" height="9" fill="${C.blue}" />
        <rect x="${cx}" y="${yMid + 2}" width="${barDeepW}" height="9" fill="${C.orange}" />
        <text x="${cx - barFastW - 6}" y="${yMid - 4}" text-anchor="end" fill="${C.dim}" font-size="11">${r.fmt(r.fast)}</text>
        <text x="${cx + barDeepW + 6}" y="${yMid + 9}" fill="${C.dim}" font-size="11">${r.fmt(r.deep)}</text>
      `;
    }).join('')}
    <line x1="${pad.l + innerW * 0.5}" x2="${pad.l + innerW * 0.5}" y1="${pad.t}" y2="${h - pad.b}" stroke="${C.dark}" />
  `;
  return svgWrap(w, h, body);
}

/* 4. THE ARCHITECTURE DIAGRAM ----------------------------- */
function chartArchitecture() {
  const w = 720, h = 380;
  const box = (x, y, bw, bh, label, sub, color = C.bg) => `
    <rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="8" fill="${color}" stroke="${C.border_strong || C.border}" stroke-width="1.5"/>
    <text x="${x + bw/2}" y="${y + 22}" text-anchor="middle" font-size="13" font-weight="600" fill="${C.dark}" font-family="Poppins,sans-serif">${label}</text>
    ${sub ? `<text x="${x + bw/2}" y="${y + bh - 10}" text-anchor="middle" font-size="10" fill="${C.dim}">${sub}</text>` : ''}
  `;
  const arrow = (x1, y1, x2, y2, label) => `
    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${C.dark}" stroke-width="1.4" marker-end="url(#arr)" />
    ${label ? `<text x="${(x1+x2)/2}" y="${(y1+y2)/2 - 6}" text-anchor="middle" font-size="10" fill="${C.dim}" font-style="italic">${label}</text>` : ''}
  `;
  const body = `
    <defs>
      <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="${C.dark}"/>
      </marker>
    </defs>
    ${box(40, 30, 200, 60, 'User',  'browser · keyboard · / shortcut')}
    ${box(40, 130, 200, 60, 'Akasha UI', 'Lora/Poppins · Anthropic palette')}
    ${box(40, 240, 200, 60, 'iCloud archive',  '~/iCloud Drive/Akasha/*.md', C.soft)}
    ${box(290, 130, 160, 60, 'Express server', 'localhost:3000', C.bg)}
    ${box(490, 70, 200, 60, 'FAST', 'Ollama gemma3:4b · local M1', C.bg)}
    ${box(490, 170, 200, 60, 'DEEP', 'Cloudflare Llama 3.3 70B', C.bg)}
    ${box(490, 270, 200, 60, '5-section format prior', 'Literal · Mythic · Fuzzy · Sigil · Tweet', C.soft)}
    ${arrow(140, 90, 140, 130, 'question')}
    ${arrow(140, 190, 140, 240, 'auto-save')}
    ${arrow(240, 160, 290, 160, '/api/oracle')}
    ${arrow(450, 160, 490, 110, 'fast')}
    ${arrow(450, 160, 490, 200, 'deep')}
    ${arrow(370, 190, 510, 270, 'enforced')}
  `;
  return svgWrap(w, h, body);
}

await fs.mkdir(OUT, { recursive: true });
await fs.writeFile(`${OUT}/latency.svg`, chartLatency());
await fs.writeFile(`${OUT}/confidence.svg`, chartConfidence());
await fs.writeFile(`${OUT}/coverage.svg`, chartCoverage());
await fs.writeFile(`${OUT}/architecture.svg`, chartArchitecture());

console.log('wrote 4 charts to', OUT);
