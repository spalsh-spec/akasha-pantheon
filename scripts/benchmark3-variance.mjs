// Stochastic-variance benchmark — same 12 questions × 3 models × 3 runs
// to compute mean ± SEM for adherence and confidence at each model scale.
// Output: public/docs/data/benchmark-variance.json
// Run: node scripts/benchmark3-variance.mjs (in background — takes ~15 min)

import fs from 'node:fs/promises';

const SERVER = process.env.SERVER || 'http://localhost:3000';
const VOICE  = 'academic';
const N_RUNS = 3;
const OUT    = '/Users/sparshsharma/akasha-pantheon/public/docs/data/benchmark-variance.json';

const MODELS = [
  { tag: 'small',  provider: 'ollama',     model: 'gemma3:4b',                                label: '4B · gemma3:4b · local',         override: null },
  { tag: 'medium', provider: 'cloudflare', model: '@cf/meta/llama-3.1-8b-instruct',           label: '8B · llama-3.1-8b · CF',         override: '@cf/meta/llama-3.1-8b-instruct' },
  { tag: 'large',  provider: 'cloudflare', model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast', label: '70B · llama-3.3-70b-fp8 · CF',   override: null },
];

const QUESTIONS = [
  'Why does π appear in the Gaussian normalisation constant?',
  'What is the physical meaning of the fine-structure constant α ≈ 1/137?',
  'Why does the central limit theorem hold so universally?',
  'What is the relationship between entropy and information?',
  'How do power laws emerge in self-organised criticality?',
  'What is the role of network topology in epidemic spreading?',
  'Why does the Lotka-Volterra model produce limit cycles?',
  'Why do allometric scaling laws hold across orders of magnitude?',
  'What is the neural basis of flow state?',
  'What is the predictive coding theory of perception?',
  'What is the demarcation problem in philosophy of science?',
  'Why do flood myths appear across geographically isolated cultures?',
];

const ACAD_KEYS = ['CLAIM:', 'EVIDENCE:', 'UNCERTAINTY:', 'IMPLICATION:', 'OPEN:', 'CONFIDENCE:', 'REFS:'];
function adherence(raw) {
  const present = ACAD_KEYS.filter(k => raw?.includes(k));
  return { count: present.length, total: ACAD_KEYS.length, ratio: present.length / ACAD_KEYS.length, missing: ACAD_KEYS.filter(k => !raw?.includes(k)) };
}
function confValue(raw) {
  const m = raw?.match(/CONFIDENCE:\s*([0-9]*\.?[0-9]+)/i);
  return m ? parseFloat(m[1]) : null;
}

async function ask(question, model) {
  const t0 = Date.now();
  const headers = { 'Content-Type': 'application/json' };
  if (model.override) headers['X-CF-Model-Override'] = model.override;
  const r = await fetch(`${SERVER}/api/oracle`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ question, provider: model.provider, voice: VOICE }),
  });
  const ms = Date.now() - t0;
  const j = await r.json();
  if (!r.ok) return { ok: false, ms, error: j.error };
  const raw = j.raw || '';
  return { ok: true, ms, chars: raw.length, adherence: adherence(raw), confidence: confValue(raw), raw };
}

console.log(`[bench3] start · ${QUESTIONS.length}q × ${MODELS.length}m × ${N_RUNS} runs = ${QUESTIONS.length*MODELS.length*N_RUNS} calls · voice=${VOICE}`);
const start = new Date().toISOString();

const results = [];
let i = 0;
const total = QUESTIONS.length * MODELS.length * N_RUNS;
for (const m of MODELS) {
  for (const q of QUESTIONS) {
    for (let run = 1; run <= N_RUNS; run++) {
      i++;
      const r = await ask(q, m);
      const tag = `${m.tag}/run${run}: ${q.slice(0, 36)}…`;
      if (r.ok) {
        console.log(`  ${i.toString().padStart(3)}/${total} ${tag.padEnd(54)} ${r.ms}ms · adh ${r.adherence.count}/${r.adherence.total} · conf ${r.confidence ?? '—'}`);
      } else {
        console.log(`  ${i.toString().padStart(3)} ${tag.padEnd(54)} FAIL ${r.error}`);
      }
      results.push({ question: q, model_tag: m.tag, model: m.model, run, ...r });
    }
  }
}
const finish = new Date().toISOString();

// stats: per (model, question) compute mean adherence ratio + SEM, mean confidence + SEM
function mean(a) { return a.reduce((s, x) => s + x, 0) / a.length; }
function sem(a) { if (a.length < 2) return 0; const m = mean(a); const v = mean(a.map(x => (x-m)**2)); return Math.sqrt(v / a.length); }

const summary = { meta: { started: start, finished: finish, n_questions: QUESTIONS.length, n_models: MODELS.length, n_runs_per_combo: N_RUNS, voice: VOICE }, byModel: {} };
for (const m of MODELS) {
  const rs = results.filter(r => r.model_tag === m.tag && r.ok);
  if (!rs.length) continue;
  const adh = rs.map(r => r.adherence.ratio);
  const conf = rs.map(r => r.confidence).filter(c => c != null);
  const lat = rs.map(r => r.ms);

  // per-question variance: did the same question + model give consistent adherence across runs?
  const perQ = QUESTIONS.map(q => {
    const rq = rs.filter(r => r.question === q).map(r => r.adherence.ratio);
    return { q: q.slice(0, 40), runs: rq, mean: rq.length ? +mean(rq).toFixed(2) : null, allMatch: rq.every(v => v === rq[0]) };
  });
  const inconsistentQs = perQ.filter(p => !p.allMatch).length;

  summary.byModel[m.tag] = {
    label: m.label, model: m.model, n: rs.length,
    adherence: { mean: +mean(adh).toFixed(3), sem: +sem(adh).toFixed(3), perfect_rate: +(rs.filter(r => r.adherence.ratio === 1).length / rs.length).toFixed(3) },
    confidence: { mean: +mean(conf).toFixed(3), sem: +sem(conf).toFixed(3) },
    latency_ms: { mean: Math.round(mean(lat)), sem: Math.round(sem(lat)) },
    questions_with_inconsistent_runs: inconsistentQs,
    per_question: perQ,
  };
}

await fs.writeFile(OUT, JSON.stringify({ summary, results }, null, 2));
console.log(`\n[bench3] wrote ${OUT}`);
console.log(JSON.stringify(summary, null, 2));
