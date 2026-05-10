// Post-process the variance benchmark: for every academic-mode response,
// extract its REFS line and run each cite through Crossref verification.
// Compute per-model-tier verification rates.
//
// Output: appends `citation_verification` block to public/docs/data/benchmark-variance.json
// Run: node scripts/postprocess-cite-rates.mjs

import fs from 'node:fs/promises';
import { parseRefs, verifyCitation } from './verify-cite.mjs';

const FILE = '/Users/sparshsharma/akasha-pantheon/public/docs/data/benchmark-variance.json';

const data = JSON.parse(await fs.readFile(FILE, 'utf8'));
console.log(`[postprocess] reading ${data.results.length} results...`);

// Extract REFS line from each raw response
function extractRefs(raw) {
  if (!raw) return '';
  const m = raw.match(/^REFS:\s*(.+)$/im);
  return m ? m[1].trim() : '';
}

// Group: per-(model, run) → list of cites + verification statuses
const perResult = [];
for (const r of data.results) {
  if (!r.ok || !r.raw) continue;
  const refs = extractRefs(r.raw);
  if (!refs) {
    perResult.push({ model_tag: r.model_tag, run: r.run, question: r.question, refs: '', cites: [] });
    continue;
  }
  const cites = parseRefs(refs);
  const verified = [];
  for (const c of cites) {
    if (c.parseError) {
      verified.push({ raw: c.raw, status: 'unparseable' });
      continue;
    }
    try {
      const v = await verifyCitation(c);
      verified.push({ raw: c.raw, status: v.status, paper_year: v.paper?.year, paper_title: v.paper?.title?.slice(0, 80) || null, doi: v.paper?.doi || null });
    } catch (e) {
      verified.push({ raw: c.raw, status: 'api-error', detail: e.message });
    }
  }
  perResult.push({ model_tag: r.model_tag, run: r.run, question: r.question, refs, cites: verified });
  process.stdout.write('.');
}
console.log();

// Aggregate per model_tag
const byModel = {};
for (const r of perResult) {
  const m = byModel[r.model_tag] ??= { tag: r.model_tag, n_responses: 0, n_with_refs: 0, n_cites_total: 0, status_counts: {} };
  m.n_responses++;
  if (r.refs) m.n_with_refs++;
  for (const c of r.cites) {
    m.n_cites_total++;
    m.status_counts[c.status] = (m.status_counts[c.status] || 0) + 1;
  }
}
for (const m of Object.values(byModel)) {
  const total = m.n_cites_total || 1;
  m.rates = {};
  for (const [s, c] of Object.entries(m.status_counts)) {
    m.rates[s] = +(c / total).toFixed(3);
  }
  m.cites_per_response_mean = +(m.n_cites_total / m.n_responses).toFixed(2);
}

data.citation_verification = {
  meta: { processed_at: new Date().toISOString(), backend: 'crossref' },
  by_model: byModel,
  per_response: perResult,
};

await fs.writeFile(FILE, JSON.stringify(data, null, 2));
console.log('[postprocess] wrote citation_verification block');
console.log(JSON.stringify(byModel, null, 2));
