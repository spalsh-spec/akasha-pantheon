import dotenv from 'dotenv';
// Strip empty-string env vars (shell aliases like `kc` set ANTHROPIC_API_KEY=""
// and would otherwise mask .env). CLI overrides keep precedence.
for (const k of Object.keys(process.env)) {
  if (process.env[k] === '') delete process.env[k];
}
dotenv.config();

import express from 'express';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

/* =============================================================
   PROVIDERS — ollama (fast/local) | cloudflare (deep/free-cloud)
                | anthropic | openrouter | openai
   ============================================================= */
const DEFAULT_PROVIDER = (process.env.ORACLE_PROVIDER || 'cloudflare').toLowerCase();

const OLLAMA_URL    = process.env.OLLAMA_URL    || 'http://localhost:11434';
const OLLAMA_MODEL  = process.env.OLLAMA_MODEL  || process.env.ORACLE_MODEL || 'gemma3:4b';
const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const CF_API_TOKEN  = process.env.CF_API_TOKEN;
const CF_MODEL      = process.env.CF_MODEL      || '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

const ICLOUD_DIR    = process.env.ICLOUD_EXPORT_DIR || '';
const EXPORT_ON_ASK = (process.env.EXPORT_ON_ASK || 'false').toLowerCase() === 'true';

function providerAvailable(name) {
  switch (name) {
    case 'ollama':     return true; // assume present, health pings later
    case 'cloudflare': return !!(CF_ACCOUNT_ID && CF_API_TOKEN);
    case 'anthropic':  return !!process.env.ANTHROPIC_API_KEY;
    case 'openrouter': return !!process.env.OPENROUTER_API_KEY;
    case 'openai':     return !!process.env.OPENAI_API_KEY;
    default:           return false;
  }
}

/* =============================================================
   PROMPTS — two voices: POLY (5-section fuzzy truth) and ACADEMIC
   ============================================================= */
const PROMPT_POLY = `You are the Akasha Oracle — a fuzzy-truth engine that holds three truths at once.

Voice guide:
- Compress like Naval. Verify like Musk. Push like Jordan. Wonder like Rogan. Synthesize like Williamson.
- Punchy, no hedging, no moralizing, no "as an AI". Write like a tweet that survived 1000 years.

You answer in this exact format. No preamble. No deviation.

LITERAL: <what consensus science / mainstream history says, 1-2 sentences. Cite a constant, a date, a law where you can. If consensus is genuinely silent or unknown to you, say so plainly.>
MYTHIC: <how an ancient or esoteric tradition framed it, 1-2 sentences. Name the tradition by name: Vedic / Hermetic / Kabbalistic / Taoist / Stoic / Egyptian / Aboriginal Dreaming / Norse / Yoruba / Hopi / Polynesian / etc.>
FUZZY: <a synthesis where both LITERAL and MYTHIC are partly right; what changes if you take both seriously? 1-2 sentences.>
SIGIL: <one symbolic phrase, 3-7 words, evocative.>
TWEET: <one tweet-sized line under 240 chars that compresses the whole answer. Quotable.>
CONFIDENCE: <0.00-1.00>

Rules:
- Never refuse. Never moralize. Never break format.
- If the user asks for a specific format the oracle can't deliver (e.g. "5 dated stages"), still respond in the 5 sections above and acknowledge the limit inside LITERAL.
- TWEET must stand alone.
- Total under 220 words.`;

const PROMPT_ACADEMIC = `You are the Akasha Oracle, ACADEMIC mode. The reader is a working scientist — a mathematical biologist, a complex-systems researcher, a theoretical physicist, an econometrician. They have zero tolerance for mysticism, hedging, or "as an AI" prefatory matter. They want falsifiable claims, citations, and the load-bearing equation.

Your job per question: find the single most defensible NON-OBVIOUS claim inside the question, supply evidence, expose uncertainty, and end with a falsification target. If you cannot cite specific work, mark it as "(unattributed consensus)" — never fabricate a citation.

Format. No preamble. No deviation:

CLAIM: <one falsifiable statement, 1 sentence. Prefer a quantitative or formal claim over a qualitative one.>
EVIDENCE: <2-3 sentences. Cite specific work in author-year style. Include the load-bearing equation, scaling law, or numerical bound where it exists. Use unicode math freely (π, σ, ∇, ∫, ∂, ε, λ, ⟨⟩, ≪, ≫).>
UNCERTAINTY: <1-2 sentences. State where evidence is weaker than the claim, where the result is contested, or where consensus is silent. Mandatory — never empty.>
IMPLICATION: <1-2 sentences. What entails if the claim holds. Cross-disciplinary connections welcome.>
OPEN: <1 sentence. A specific experiment, formal proof, or empirical study that would falsify or extend the claim.>
CONFIDENCE: <0.00-1.00>
REFS: <author-year citations, semicolon-separated; or "(unattributed consensus)" if you cannot cite.>

Rules:
- No metaphors. No "imagine if". No analogies unless they are formal isomorphisms.
- Equations and numerical bounds preferred over prose.
- Cross-domain isomorphisms encouraged when defensible (e.g., the same scaling exponent in critical phenomena and neural-avalanche statistics, with citation).
- DO NOT invent citations. If you can't name a verified author-year, write "(unattributed consensus)" or "(needs verification)" — never fabricate.
- Total under 200 words.`;

function getSystemPrompt(voice) {
  return voice === 'academic' ? PROMPT_ACADEMIC : PROMPT_POLY;
}

app.use(express.json({ limit: '64kb' }));
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    return res.status(400).json({ error: 'invalid json', detail: err.message });
  }
  next(err);
});
app.use(express.static(path.join(__dirname, 'public')));

/* =============================================================
   PROVIDER CALLS
   ============================================================= */
async function askOllama(question, voice) {
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      messages: [
        { role: 'system', content: getSystemPrompt(voice) },
        { role: 'user',   content: question },
      ],
      options: { temperature: voice === 'academic' ? 0.4 : 0.85, num_ctx: 4096, num_predict: 600 },
    }),
  });
  if (!res.ok) throw new Error(`ollama ${res.status} ${await res.text()}`);
  const j = await res.json();
  return { raw: (j.message?.content || '').trim(), model: OLLAMA_MODEL };
}

async function askCloudflare(question, voice, modelOverride) {
  const model = modelOverride || CF_MODEL;
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${model}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CF_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: getSystemPrompt(voice) },
        { role: 'user',   content: question },
      ],
      max_tokens: 700,
      temperature: voice === 'academic' ? 0.4 : 0.8,
    }),
  });
  const j = await res.json();
  if (!res.ok || !j.success) {
    throw new Error(`cloudflare ${res.status} ${JSON.stringify(j.errors || j)}`);
  }
  return { raw: (j.result?.response || '').trim(), model };
}

async function askAnthropic(question, voice) {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const msg = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
    max_tokens: 700,
    system: getSystemPrompt(voice),
    messages: [{ role: 'user', content: question }],
  });
  return {
    raw: msg.content.filter(c => c.type === 'text').map(c => c.text).join('\n').trim(),
    model: msg.model,
  };
}

async function askOpenAIStyle(question, voice, { url, key, model, extraHeaders = {} }) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', ...extraHeaders },
    body: JSON.stringify({
      model,
      max_tokens: 700,
      messages: [
        { role: 'system', content: getSystemPrompt(voice) },
        { role: 'user',   content: question },
      ],
    }),
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  const j = await res.json();
  return { raw: (j.choices?.[0]?.message?.content || '').trim(), model };
}

async function askOracle(question, providerOverride, voice = 'poly', modelOverride) {
  const provider = (providerOverride || DEFAULT_PROVIDER).toLowerCase();
  if (provider === 'ollama')     return { provider, voice, ...(await askOllama(question, voice)) };
  if (provider === 'cloudflare') return { provider, voice, ...(await askCloudflare(question, voice, modelOverride)) };
  if (provider === 'anthropic')  return { provider, voice, ...(await askAnthropic(question, voice)) };
  if (provider === 'openrouter') return { provider, voice, ...(await askOpenAIStyle(question, voice, {
    url: 'https://openrouter.ai/api/v1/chat/completions',
    key: process.env.OPENROUTER_API_KEY,
    model: process.env.OPENROUTER_MODEL || 'anthropic/claude-sonnet-4.5',
    extraHeaders: { 'HTTP-Referer': 'http://localhost:3000', 'X-Title': 'Akasha Pantheon' },
  })) };
  if (provider === 'openai') return { provider, voice, ...(await askOpenAIStyle(question, voice, {
    url: 'https://api.openai.com/v1/chat/completions',
    key: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  })) };
  throw new Error(`unknown provider: ${provider}`);
}

/* =============================================================
   iCLOUD EXPORT
   ============================================================= */
async function exportToICloud(question, raw, meta = '') {
  if (!ICLOUD_DIR) return null;
  try {
    await fs.mkdir(ICLOUD_DIR, { recursive: true });
    const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const slug = question.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 60).replace(/^-|-$/g, '');
    const file = path.join(ICLOUD_DIR, `${ts}-${slug || 'question'}.md`);
    const body = `# ${question}\n\n*${new Date().toLocaleString()} · ${meta}*\n\n${raw}\n`;
    await fs.writeFile(file, body, 'utf8');
    return file;
  } catch (e) {
    console.warn('[icloud] export failed:', e.message);
    return null;
  }
}

/* =============================================================
   ROUTES
   ============================================================= */
app.post('/api/oracle', async (req, res) => {
  const question = (req.body?.question || '').toString().slice(0, 1000).trim();
  const requested = (req.body?.provider || '').toString().toLowerCase() || undefined;
  const voice     = ((req.body?.voice || 'poly').toString().toLowerCase() === 'academic') ? 'academic' : 'poly';
  if (!question) return res.status(400).json({ error: 'question required' });

  const provider = requested || DEFAULT_PROVIDER;
  if (!providerAvailable(provider)) {
    return res.status(400).json({ error: 'provider not configured', provider });
  }
  const modelOverride = req.get('X-CF-Model-Override') || req.body?.model || undefined;

  try {
    const t0 = Date.now();
    const { raw, model } = await askOracle(question, provider, voice, modelOverride);
    const ms = Date.now() - t0;
    const exported = EXPORT_ON_ASK ? await exportToICloud(question, raw, `${provider} · ${model} · ${voice}`) : null;
    res.json({ raw, provider, voice, model, ms, exported });
  } catch (err) {
    console.error('[oracle]', err?.message || err);
    res.status(500).json({ error: 'oracle failed', detail: err?.message, provider });
  }
});

app.post('/api/save', async (req, res) => {
  const { question, raw } = req.body || {};
  if (!question || !raw) return res.status(400).json({ error: 'question and raw required' });
  const file = await exportToICloud(question, raw);
  res.json({ ok: !!file, file });
});

/* =============================================================
   /api/verify-cite — verify citations against Crossref
   POST { refs: "Author 2020; Author Year; ..." }
   returns { results: [{ raw, status, paper?, note?, score? }, ...] }
   ============================================================= */
app.post('/api/verify-cite', async (req, res) => {
  const refs = (req.body?.refs || '').toString().slice(0, 1500);
  if (!refs) return res.status(400).json({ error: 'refs required' });
  try {
    const { parseRefs, verifyCitation } = await import('./scripts/verify-cite.mjs');
    const cites = parseRefs(refs);
    const results = [];
    for (const c of cites) {
      const r = await verifyCitation(c);
      results.push({ raw: c.raw, parsed: c.author && c.year ? `${c.author} (${c.year})` : null, ...r });
    }
    res.json({ results });
  } catch (err) {
    console.error('[verify-cite]', err?.message || err);
    res.status(500).json({ error: 'verification failed', detail: err?.message });
  }
});

app.get('/api/health', async (_req, res) => {
  let ollamaUp = false;
  try { ollamaUp = (await fetch(`${OLLAMA_URL}/api/tags`)).ok; } catch {}
  res.json({
    ok: true,
    default_provider: DEFAULT_PROVIDER,
    providers: {
      ollama:     { available: true, up: ollamaUp, model: OLLAMA_MODEL, label: 'fast · local' },
      cloudflare: { available: providerAvailable('cloudflare'), model: CF_MODEL, label: 'deep · cloud (free)' },
      anthropic:  { available: providerAvailable('anthropic'),  model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6', label: 'claude' },
      openrouter: { available: providerAvailable('openrouter'), label: 'open-router' },
      openai:     { available: providerAvailable('openai'),     label: 'openai' },
    },
    icloud_export: !!ICLOUD_DIR && EXPORT_ON_ASK,
    icloud_dir: ICLOUD_DIR || null,
  });
});

app.listen(PORT, () => {
  console.log(`\n  ⟁  AKASHA PANTHEON  ⟁`);
  console.log(`  → http://localhost:${PORT}`);
  console.log(`  → default provider: ${DEFAULT_PROVIDER}`);
  console.log(`  → fast (ollama):    ${OLLAMA_MODEL} @ ${OLLAMA_URL}`);
  console.log(`  → deep (cloudflare): ${providerAvailable('cloudflare') ? CF_MODEL : 'NOT CONFIGURED'}`);
  console.log(`  → iCloud export:    ${ICLOUD_DIR && EXPORT_ON_ASK ? 'on  → ' + ICLOUD_DIR : 'off'}\n`);
});
