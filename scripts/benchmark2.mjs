// Expanded benchmark — 30 questions × 3 model scales, ACADEMIC voice.
// Output: public/docs/data/benchmark.json (overwrites v1).
// Run: node scripts/benchmark2.mjs
//
// Models:
//   1. gemma3:4b           — 4B params, local M1 via Ollama
//   2. llama-3.1-8b        — 8B params, Cloudflare Workers AI
//   3. llama-3.3-70b-fp8   — 70B params, Cloudflare Workers AI

import fs from 'node:fs/promises';

const SERVER = process.env.SERVER || 'http://localhost:3000';
const VOICE  = process.env.VOICE  || 'academic';
const OUT    = '/Users/sparshsharma/akasha-pantheon/public/docs/data/benchmark.json';

const MODELS = [
  { tag: 'small',  provider: 'ollama',     label: '4B · gemma3:4b · local',          modelLabel: 'gemma3:4b' },
  { tag: 'medium', provider: 'cloudflare-8b', label: '8B · llama-3.1-8b · CF',        modelLabel: '@cf/meta/llama-3.1-8b-instruct' },
  { tag: 'large',  provider: 'cloudflare',  label: '70B · llama-3.3-70b-fp8 · CF',   modelLabel: '@cf/meta/llama-3.3-70b-instruct-fp8-fast' },
];

const QUESTIONS = [
  // physics / math (4)
  'Why does π appear in the Gaussian normalisation constant?',
  'What is the physical meaning of the fine-structure constant α ≈ 1/137?',
  'Why does the central limit theorem hold so universally?',
  'What is the relationship between entropy and information?',
  // complex systems / biology (4)
  'How do power laws emerge in self-organised criticality?',
  'What is the role of network topology in epidemic spreading?',
  'Why does the Lotka-Volterra model produce limit cycles?',
  'Why do allometric scaling laws hold across orders of magnitude?',
  // cognition / philosophy / cross-cultural (4)
  'What is the neural basis of flow state?',
  'What is the predictive coding theory of perception?',
  'What is the demarcation problem in philosophy of science?',
  'Why do flood myths appear across geographically isolated cultures?',
];

const TRADITIONS = [
  'vedic','hermetic','kabbalistic','kabbalah','taoist','tao','stoic','egyptian',
  'aboriginal','dreaming','norse','yoruba','hopi','polynesian','sufi','gnostic',
  'mayan','inca','aztec','dogon','jain','buddhist','sikh','zoroastrian','rumi',
  'hindu','christian','islamic','jewish','greek','roman','plato','aristotle',
];

function adherence(raw, voice) {
  const polyKeys = ['LITERAL:', 'MYTHIC:', 'FUZZY:', 'SIGIL:', 'TWEET:', 'CONFIDENCE:'];
  const acadKeys = ['CLAIM:', 'EVIDENCE:', 'UNCERTAINTY:', 'IMPLICATION:', 'OPEN:', 'CONFIDENCE:', 'REFS:'];
  const keys = voice === 'academic' ? acadKeys : polyKeys;
  const present = keys.filter(k => raw?.includes(k));
  return { count: present.length, total: keys.length, ratio: present.length / keys.length, missing: keys.filter(k => !raw?.includes(k)) };
}
function parseField(raw, name) {
  const m = raw?.match(new RegExp(`^\\s*\\**\\s*${name}\\**\\s*[:：]\\s*([^\\n]+(?:\\n(?!(?:LITERAL|MYTHIC|FUZZY|SIGIL|TWEET|CLAIM|EVIDENCE|UNCERTAINTY|IMPLICATION|OPEN|CONFIDENCE|REFS):)[^\\n]+)*)`, 'im'));
  return m ? m[1].trim() : '';
}
function traditionCited(text) {
  const lc = (text || '').toLowerCase();
  return TRADITIONS.filter(t => lc.includes(t));
}
function citationsCount(text) {
  if (!text) return 0;
  // count author-year patterns like "Smith 2010" or "(Jones et al. 2020)"
  const m = text.match(/[A-Z][a-z]+(?:\s(?:et al\.?|&|and)\s[A-Z][a-z]+)?[,.]?\s*\(?(?:19|20)\d{2}\)?/g);
  return m ? m.length : 0;
}

async function ask(question, providerTag, voice) {
  const t0 = Date.now();
  // Map our pseudo-providers to the real ones via env override on a per-call basis is messy.
  // Instead: use HTTP header trick — pass provider+modelOverride via body.
  const provider = providerTag === 'cloudflare-8b' ? 'cloudflare' : providerTag;
  const body = { question, provider, voice };
  if (providerTag === 'cloudflare-8b') body._modelOverride = '@cf/meta/llama-3.1-8b-instruct';

  // Since the server doesn't accept _modelOverride, switch via env restart per group.
  // Simpler: hit the server with provider only; for cloudflare-8b, use a side-channel.
  const r = await fetch(`${SERVER}/api/oracle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-CF-Model-Override': body._modelOverride || '' },
    body: JSON.stringify({ question, provider, voice }),
  });
  const ms = Date.now() - t0;
  const j = await r.json();
  if (!r.ok) return { ok: false, ms, error: j.error || 'http ' + r.status, detail: j.detail };
  const raw = j.raw || '';
  const adh = adherence(raw, voice);
  const claim = voice === 'academic' ? parseField(raw, 'CLAIM') : parseField(raw, 'LITERAL');
  const evidence = parseField(raw, 'EVIDENCE');
  const mythic = parseField(raw, 'MYTHIC');
  const conf = parseFloat(parseField(raw, 'CONFIDENCE')) || null;
  return {
    ok: true,
    ms,
    chars: raw.length,
    adherence: adh,
    confidence: conf,
    citations: citationsCount(evidence) + citationsCount(parseField(raw, 'REFS')),
    traditions_cited: traditionCited(mythic).length,
    raw,
  };
}

const start = new Date().toISOString();
console.log(`[bench2] start ${start} · ${QUESTIONS.length}q × ${MODELS.length} models · voice=${VOICE}`);

const results = [];
let i = 0;
for (const m of MODELS) {
  console.log(`\n— MODEL: ${m.label} —`);
  for (const q of QUESTIONS) {
    i++;
    const r = await ask(q, m.provider, VOICE);
    const tag = `${m.tag}:${q.slice(0, 38).replace(/\n/g,' ')}…`;
    if (r.ok) console.log(`  ${i.toString().padStart(3)}/${QUESTIONS.length * MODELS.length} ${tag.padEnd(48)} ${r.ms}ms · adh ${r.adherence.count}/${r.adherence.total} · conf ${r.confidence ?? '—'} · cite ${r.citations}`);
    else      console.log(`  ${i.toString().padStart(3)} ${tag.padEnd(48)} FAIL ${r.error} ${r.detail || ''}`);
    results.push({ question: q, model_tag: m.tag, model_label: m.modelLabel, voice: VOICE, ...r });
  }
}

const finish = new Date().toISOString();

// summary
function pct(arr, p) { const s=[...arr].sort((a,b)=>a-b); return s[Math.min(s.length-1, Math.floor(s.length * p))]; }
function mean(arr) { return arr.reduce((a,b)=>a+b,0)/arr.length; }
function ciBinomial(k, n, z=1.96) {
  const p = k/n; const denom = 1 + z*z/n; const centre = p + z*z/(2*n);
  const margin = z * Math.sqrt(p*(1-p)/n + z*z/(4*n*n));
  return { lo: (centre - margin)/denom, hi: (centre + margin)/denom };
}

const summary = { meta: { started: start, finished: finish, voice: VOICE, n_questions: QUESTIONS.length, n_models: MODELS.length }, byModel: {} };
for (const m of MODELS) {
  const rs = results.filter(r => r.model_tag === m.tag && r.ok);
  if (!rs.length) continue;
  const lat = rs.map(r => r.ms);
  const conf = rs.map(r => r.confidence).filter(c => c != null);
  const fullAdh = rs.filter(r => r.adherence.ratio === 1).length;
  const adhCI = ciBinomial(fullAdh, rs.length);
  summary.byModel[m.tag] = {
    label: m.label,
    model: m.modelLabel,
    n: rs.length,
    latency_ms: { p10: pct(lat, 0.1), median: pct(lat, 0.5), p90: pct(lat, 0.9), mean: Math.round(mean(lat)) },
    confidence: { mean: +mean(conf).toFixed(3), p10: +pct(conf, 0.1).toFixed(2), median: +pct(conf, 0.5).toFixed(2), p90: +pct(conf, 0.9).toFixed(2) },
    format_adherence_full: { k: fullAdh, n: rs.length, p: +(fullAdh/rs.length).toFixed(3), ci95: { lo: +adhCI.lo.toFixed(3), hi: +adhCI.hi.toFixed(3) } },
    citations_per_answer_mean: +mean(rs.map(r => r.citations)).toFixed(2),
    chars_mean: Math.round(mean(rs.map(r => r.chars))),
  };
}

await fs.writeFile(OUT, JSON.stringify({ summary, results }, null, 2));
console.log(`\n[bench2] wrote ${OUT}`);
console.log(JSON.stringify(summary, null, 2));
