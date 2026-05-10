// Akasha benchmark — runs N questions through both providers, captures
// latency / confidence / format-adherence / length / tradition-cited / sigil.
// Output: public/docs/data/benchmark.json (canonical evidence file).

import fs from 'node:fs/promises';
import path from 'node:path';

const SERVER = process.env.SERVER || 'http://localhost:3000';
const OUT = '/Users/sparshsharma/akasha-pantheon/public/docs/data/benchmark.json';

const QUESTIONS = [
  'Why does π appear in probability?',
  'What is the physics of flow state?',
  'What did Jung mean by the collective unconscious — is it measurable?',
  'Why do all major religions have a flood myth?',
  'What is leverage, in physics and in life?',
];

const TRADITIONS = [
  'vedic','hermetic','kabbalistic','kabbalah','taoist','tao','stoic','egyptian',
  'aboriginal','dreaming','norse','yoruba','hopi','polynesian','sufi','gnostic',
  'mayan','inca','aztec','dogon','jain','buddhist','sikh','zoroastrian','rumi',
  'hindu','christian','islamic','jewish','greek','roman','plato','aristotle',
];

function adherence(raw) {
  const keys = ['LITERAL:', 'MYTHIC:', 'FUZZY:', 'SIGIL:', 'TWEET:', 'CONFIDENCE:'];
  const present = keys.filter(k => raw?.includes(k));
  return { count: present.length, total: keys.length, ratio: present.length / keys.length, missing: keys.filter(k => !raw?.includes(k)) };
}

function traditionCited(mythic) {
  const lc = (mythic || '').toLowerCase();
  return TRADITIONS.filter(t => lc.includes(t));
}

function parseField(raw, name) {
  const m = raw?.match(new RegExp(`${name}:\\s*([^\\n]+(?:\\n(?!(?:LITERAL|MYTHIC|FUZZY|SIGIL|TWEET|CONFIDENCE):)[^\\n]+)*)`, 'i'));
  return m ? m[1].trim() : '';
}

async function ask(question, provider) {
  const t0 = Date.now();
  const r = await fetch(`${SERVER}/api/oracle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, provider }),
  });
  const ms = Date.now() - t0;
  const j = await r.json();
  const raw = j.raw || '';
  const adh = adherence(raw);
  const literal = parseField(raw, 'LITERAL');
  const mythic = parseField(raw, 'MYTHIC');
  const fuzzy = parseField(raw, 'FUZZY');
  const sigil = parseField(raw, 'SIGIL');
  const tweet = parseField(raw, 'TWEET');
  const conf = parseFloat(parseField(raw, 'CONFIDENCE')) || null;
  const traditions = traditionCited(mythic);
  return {
    question, provider,
    model: j.model,
    ok: r.ok,
    ms,
    server_ms: j.ms,
    chars: raw.length,
    adherence: adh,
    confidence: conf,
    fields: { literal, mythic, fuzzy, sigil, tweet },
    tradition_cited: traditions,
    raw,
  };
}

const results = [];
const start = new Date().toISOString();
console.log(`[benchmark] start ${start}`);
for (const q of QUESTIONS) {
  for (const provider of ['ollama', 'cloudflare']) {
    const tag = `${provider}:${q.slice(0, 32)}…`;
    process.stdout.write(`  ${tag.padEnd(56)} `);
    try {
      const r = await ask(q, provider);
      console.log(`${r.ms}ms · adh ${r.adherence.count}/6 · conf ${r.confidence ?? '—'}`);
      results.push(r);
    } catch (e) {
      console.log(`FAIL ${e.message}`);
      results.push({ question: q, provider, ok: false, error: e.message });
    }
  }
}
const end = new Date().toISOString();
console.log(`[benchmark] end ${end}`);

const summary = {
  meta: { started: start, finished: end, server: SERVER, n_questions: QUESTIONS.length },
  byProvider: {},
};
for (const provider of ['ollama', 'cloudflare']) {
  const rs = results.filter(r => r.provider === provider && r.ok);
  if (!rs.length) continue;
  const lat = rs.map(r => r.ms).sort((a, b) => a - b);
  const conf = rs.map(r => r.confidence).filter(c => c != null);
  const adhAvg = rs.reduce((a, r) => a + r.adherence.ratio, 0) / rs.length;
  const tradAvg = rs.reduce((a, r) => a + r.tradition_cited.length, 0) / rs.length;
  summary.byProvider[provider] = {
    model: rs[0].model,
    n: rs.length,
    latency_ms: { min: lat[0], median: lat[Math.floor(lat.length/2)], max: lat[lat.length-1], mean: Math.round(lat.reduce((a,b)=>a+b)/lat.length) },
    confidence: { min: Math.min(...conf), max: Math.max(...conf), mean: +(conf.reduce((a,b)=>a+b,0)/conf.length).toFixed(3) },
    format_adherence: +adhAvg.toFixed(3),
    avg_traditions_cited_per_answer: +tradAvg.toFixed(2),
    avg_chars: Math.round(rs.reduce((a,r)=>a+r.chars,0)/rs.length),
  };
}

await fs.mkdir(path.dirname(OUT), { recursive: true });
await fs.writeFile(OUT, JSON.stringify({ summary, results }, null, 2));
console.log(`\n[benchmark] wrote ${OUT}`);
console.log(JSON.stringify(summary, null, 2));
