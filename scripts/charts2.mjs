// Regenerate SVG charts from the expanded benchmark.
// Reads public/docs/data/benchmark.json (new schema with byModel).
// Writes public/docs/charts/*.svg.
import fs from 'node:fs/promises';

const DATA = '/Users/sparshsharma/akasha-pantheon/public/docs/data/benchmark.json';
const OUT  = '/Users/sparshsharma/akasha-pantheon/public/docs/charts';

const C = {
  dark:'#141413', text:'#3d3a32', dim:'#6b6960', mute:'#97948a',
  border:'#d6d2bf',
  small:  '#6a9bcc',  // 4B  · blue
  medium: '#788c5d',  // 8B  · green
  large:  '#d97757',  // 70B · orange
};

const $ = await fs.readFile(DATA, 'utf8').then(JSON.parse);
const isNewSchema = !!$.summary?.byModel;
const models = isNewSchema ? $.summary.byModel : null;
const RESULTS = $.results;

if (!isNewSchema) {
  console.log('benchmark.json is the old (pilot) schema — skipping new charts. Use charts.mjs for old format.');
  process.exit(0);
}

function svg(w, h, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="auto" font-family="'IBM Plex Mono', ui-monospace, monospace" style="display:block;">${body}</svg>`;
}

const TIERS = ['small','medium','large'];

/* 1. LATENCY · 3-tier with p10–p90 IQR ---------------------- */
function chartLatency() {
  const w = 720, h = 320, pad = { l: 110, r: 30, t: 28, b: 60 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const allLat = TIERS.flatMap(t => Object.values(models[t]?.latency_ms || {}));
  const max = Math.max(...allLat) * 1.1;
  const tickStep = max > 60000 ? 20000 : max > 30000 ? 10000 : 5000;
  const ticks = []; for (let v = 0; v <= max; v += tickStep) ticks.push(v);
  const y = v => pad.t + innerH - (v / max) * innerH;
  const rowH = innerH / TIERS.length;

  const body = `
    ${ticks.map(v => `
      <line x1="${pad.l}" x2="${w - pad.r}" y1="${y(v)}" y2="${y(v)}" stroke="${C.border}" stroke-dasharray="2 4" />
      <text x="${pad.l - 8}" y="${y(v) + 4}" text-anchor="end" fill="${C.dim}" font-size="11">${(v/1000).toFixed(0)}s</text>
    `).join('')}
    ${TIERS.map((t, i) => {
      const m = models[t]; if (!m) return '';
      const baseY = pad.t + rowH * (i + 0.5);
      const cx = pad.l + innerW / 2;
      // horizontal box-plot style at this row
      const yp10 = y(m.latency_ms.p10);
      const yp90 = y(m.latency_ms.p90);
      const ymed = y(m.latency_ms.median);
      return ''; // we'll draw vertical bars instead
    }).join('')}
    ${TIERS.map((t, i) => {
      const m = models[t]; if (!m) return '';
      const groupCx = pad.l + innerW * (i + 0.5) / TIERS.length;
      const barW = 50;
      const ymed = y(m.latency_ms.median);
      const yp10 = y(m.latency_ms.p10);
      const yp90 = y(m.latency_ms.p90);
      const color = C[t];
      return `
        <line x1="${groupCx}" x2="${groupCx}" y1="${yp10}" y2="${yp90}" stroke="${color}" stroke-width="2" />
        <line x1="${groupCx - barW/2}" x2="${groupCx + barW/2}" y1="${yp10}" y2="${yp10}" stroke="${color}" stroke-width="2" />
        <line x1="${groupCx - barW/2}" x2="${groupCx + barW/2}" y1="${yp90}" y2="${yp90}" stroke="${color}" stroke-width="2" />
        <rect x="${groupCx - barW/2}" y="${ymed - 6}" width="${barW}" height="12" fill="${color}" />
        <text x="${groupCx}" y="${ymed - 12}" text-anchor="middle" fill="${color}" font-size="11" font-weight="600">${(m.latency_ms.median/1000).toFixed(1)}s</text>
        <text x="${groupCx}" y="${h - pad.b + 16}" text-anchor="middle" fill="${C.text}" font-size="11" font-weight="500">${m.label.replace(/^.*?·\\s/,'').replace(/\\s·\\s.*/,'')}</text>
        <text x="${groupCx}" y="${h - pad.b + 32}" text-anchor="middle" fill="${C.dim}" font-size="9">n=${m.n} · p10–p90 ${(m.latency_ms.p10/1000).toFixed(1)}–${(m.latency_ms.p90/1000).toFixed(1)}s</text>
      `;
    }).join('')}
    <line x1="${pad.l}" x2="${pad.l}" y1="${pad.t}" y2="${h - pad.b}" stroke="${C.dark}" />
    <line x1="${pad.l}" x2="${w - pad.r}" y1="${h - pad.b}" y2="${h - pad.b}" stroke="${C.dark}" />
    <text x="${pad.l - 60}" y="${pad.t + innerH/2}" fill="${C.dim}" font-size="11" transform="rotate(-90 ${pad.l - 60} ${pad.t + innerH/2})" text-anchor="middle">latency · ms</text>
  `;
  return svg(w, h, body);
}

/* 2. CONFIDENCE PER QUESTION · 3-tier strip ----------------- */
function chartConfidence() {
  const w = 720, h = 360, pad = { l: 60, r: 30, t: 24, b: 110 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const questions = [...new Set(RESULTS.filter(r => r.ok).map(r => r.question))];
  const groupW = innerW / questions.length;
  const y = v => pad.t + innerH - v * innerH;
  const yAxis = [0, 0.25, 0.5, 0.75, 1.0];
  const dotR = 4.5;
  const offset = { small: -10, medium: 0, large: 10 };
  const body = `
    ${yAxis.map(v => `
      <line x1="${pad.l}" x2="${w - pad.r}" y1="${y(v)}" y2="${y(v)}" stroke="${C.border}" stroke-dasharray="2 4" />
      <text x="${pad.l - 8}" y="${y(v) + 4}" text-anchor="end" fill="${C.dim}" font-size="11">${(v*100).toFixed(0)}%</text>
    `).join('')}
    ${questions.map((q, i) => {
      const cx = pad.l + groupW * (i + 0.5);
      const truncQ = q.length > 32 ? q.slice(0, 30) + '…' : q;
      return TIERS.map(t => {
        const r = RESULTS.find(rr => rr.model_tag === t && rr.question === q && rr.ok && rr.confidence != null);
        if (!r) return '';
        return `<circle cx="${cx + offset[t]}" cy="${y(r.confidence)}" r="${dotR}" fill="${C[t]}" stroke="${C.dark}" stroke-width="0.5" opacity="0.85" />`;
      }).join('') +
      `<text x="${cx}" y="${h - pad.b + 14}" text-anchor="end" fill="${C.dim}" font-size="9" transform="rotate(-32 ${cx} ${h - pad.b + 14})">${truncQ}</text>`;
    }).join('')}
    <line x1="${pad.l}" x2="${pad.l}" y1="${pad.t}" y2="${h - pad.b}" stroke="${C.dark}" />
    <line x1="${pad.l}" x2="${w - pad.r}" y1="${h - pad.b}" y2="${h - pad.b}" stroke="${C.dark}" />
    <g transform="translate(${pad.l + 8},${pad.t + 4})">
      ${TIERS.map((t, i) => `
        <circle cx="${i * 90 + 6}" cy="0" r="5" fill="${C[t]}" />
        <text x="${i * 90 + 16}" y="4" fill="${C.text}" font-size="10">${t === 'small' ? '4B' : t === 'medium' ? '8B' : '70B'}</text>
      `).join('')}
    </g>
    <text x="${pad.l - 36}" y="${pad.t + innerH/2}" fill="${C.dim}" font-size="11" transform="rotate(-90 ${pad.l - 36} ${pad.t + innerH/2})" text-anchor="middle">self-reported confidence</text>
  `;
  return svg(w, h, body);
}

/* 3. FORMAT ADHERENCE · 3-tier with 95% binomial CIs -------- */
function chartAdherence() {
  const w = 720, h = 280, pad = { l: 110, r: 30, t: 30, b: 50 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const y = v => pad.t + innerH - v * innerH;
  const yAxis = [0, 0.25, 0.5, 0.75, 1.0];
  const body = `
    ${yAxis.map(v => `
      <line x1="${pad.l}" x2="${w - pad.r}" y1="${y(v)}" y2="${y(v)}" stroke="${C.border}" stroke-dasharray="2 4" />
      <text x="${pad.l - 8}" y="${y(v) + 4}" text-anchor="end" fill="${C.dim}" font-size="11">${(v*100).toFixed(0)}%</text>
    `).join('')}
    ${TIERS.map((t, i) => {
      const m = models[t]; if (!m) return '';
      const cx = pad.l + innerW * (i + 0.5) / TIERS.length;
      const fa = m.format_adherence_full;
      const yp = y(fa.p);
      const ylo = y(fa.ci95.lo);
      const yhi = y(fa.ci95.hi);
      const barW = 64;
      return `
        <rect x="${cx - barW/2}" y="${yp}" width="${barW}" height="${innerH - (yp - pad.t)}" fill="${C[t]}" opacity="0.85" />
        <line x1="${cx}" x2="${cx}" y1="${ylo}" y2="${yhi}" stroke="${C.dark}" stroke-width="2" />
        <line x1="${cx - 10}" x2="${cx + 10}" y1="${ylo}" y2="${ylo}" stroke="${C.dark}" stroke-width="2" />
        <line x1="${cx - 10}" x2="${cx + 10}" y1="${yhi}" y2="${yhi}" stroke="${C.dark}" stroke-width="2" />
        <text x="${cx}" y="${yp - 8}" text-anchor="middle" fill="${C.dark}" font-size="12" font-weight="600">${(fa.p*100).toFixed(0)}%</text>
        <text x="${cx}" y="${h - pad.b + 16}" text-anchor="middle" fill="${C.text}" font-size="11" font-weight="500">${m.label.replace(/^.*?·\\s/,'').replace(/\\s·\\s.*/,'')}</text>
        <text x="${cx}" y="${h - pad.b + 30}" text-anchor="middle" fill="${C.dim}" font-size="9">k=${fa.k}/n=${fa.n} · 95% CI [${(fa.ci95.lo*100).toFixed(0)}, ${(fa.ci95.hi*100).toFixed(0)}]</text>
      `;
    }).join('')}
    <line x1="${pad.l}" x2="${pad.l}" y1="${pad.t}" y2="${h - pad.b}" stroke="${C.dark}" />
    <line x1="${pad.l}" x2="${w - pad.r}" y1="${h - pad.b}" y2="${h - pad.b}" stroke="${C.dark}" />
    <text x="${pad.l - 60}" y="${pad.t + innerH/2}" fill="${C.dim}" font-size="11" transform="rotate(-90 ${pad.l - 60} ${pad.t + innerH/2})" text-anchor="middle">format adherence (full)</text>
  `;
  return svg(w, h, body);
}

await fs.mkdir(OUT, { recursive: true });
await fs.writeFile(`${OUT}/latency.svg`, chartLatency());
await fs.writeFile(`${OUT}/confidence.svg`, chartConfidence());
await fs.writeFile(`${OUT}/adherence.svg`, chartAdherence());
console.log('wrote 3 charts to', OUT);
console.log('  latency.svg     · 3-tier latency with p10/p50/p90');
console.log('  confidence.svg  · per-question confidence by model tier');
console.log('  adherence.svg   · format adherence with 95% binomial CIs');
