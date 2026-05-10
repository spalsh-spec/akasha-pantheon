# Akasha Pantheon

A structured-output prompting framework for large language models, with a working open-source prototype and a small empirical observation about format adherence across model scales.

> *"A 7-slot prompt schema (CLAIM · EVIDENCE · UNCERTAINTY · IMPLICATION · OPEN · REFS · CONFIDENCE) honoured 100% of the time on 4B and 8B models — but only 67% on a 70B model. All four 70B failures are the same omitted slot. Larger models override schemas with their own learned answer structure."*

— from the N=36 benchmark, May 2026.

---

## What this is

Two things in one repo:

1. **A small empirical study** of structural priors in LLM output, comparing format adherence across a 17.5× model-scale gap (4B local, 8B cloud, 70B cloud) on a 7-slot academic schema. Reproducible in one command.

2. **A working web UI** that wraps any LLM call in either a 5-slot pluralistic schema (LITERAL · MYTHIC · FUZZY · SIGIL · TWEET) for general use, or a 7-slot academic schema (CLAIM · EVIDENCE · UNCERTAINTY · IMPLICATION · OPEN · REFS · CONFIDENCE) for technical use. Runs on any laptop with Ollama plus optional Cloudflare Workers AI for larger models.

Documents (each one print-ready, one ⌘+P away from a PDF) live in [`/public/docs/`](./public/docs/index.html).

---

## Quick start

```bash
git clone <this-repo>
cd akasha-pantheon
cp .env.example .env             # add CF_ACCOUNT_ID + CF_API_TOKEN if you want DEEP mode
npm install
ollama pull gemma3:4b            # for FAST mode (local)
npm run dev                      # → http://localhost:3000
```

---

## Reproduce the benchmark

```bash
node scripts/benchmark2.mjs           # 12 questions × 3 models, ~17 min
node scripts/benchmark3-variance.mjs  # 12 × 3 models × 3 runs, ~50 min
node scripts/charts2.mjs              # regenerate SVG charts
open http://localhost:3000/docs/stats.html
```

Output lands in `public/docs/data/benchmark.json` (and `benchmark-variance.json` for the stochastic-variance run).

## Verify any model's citations

The academic mode automatically verifies every REF in every response against the public Crossref database. Each cite gets a colour-coded badge:

| | |
|---|---|
| **✓ verified** | exact author + year match (e.g., Bock Axelsen & Manrubia 2014 → DOI 10.1098/rspb.2014.1179) |
| **⚠ partial** | author group is real but the year is off — model may have misdated |
| **✗ unverified** | no Crossref match — likely a fabricated citation |
| **? unparseable** | couldn't extract author/year from the cite string |

You can also use the verifier as a CLI tool against any author-year string:

```bash
node scripts/verify-cite.mjs "Bock Axelsen and Manrubia 2014; Abrams Strogatz 2003"
```

---

## The empirical claim, in one paragraph

We force every LLM response into a fixed seven-slot academic schema enforced via system prompt and verified at parse time. Across N=36 runs (3 models × 12 questions), format adherence is **non-monotonic in model scale**: 4B and 8B both honour the schema 12/12, while a 70B model drops to 8/12. Every 70B failure is the same omitted slot (IMPLICATION). The 95% Wilson CI on the 70B adherence is [0.39, 0.86]; the smaller-model CI is [0.76, 1.00]; the intervals do not overlap. The pattern is consistent with the hypothesis that larger models carry stronger learned priors about answer structure that resist explicit format constraints — a structured failure mode invisible to binary JSON-mode adherence benchmarks.

---

## Documents in this set

| Document | For whom | Length |
|---|---|---|
| [Academic Brief](./public/docs/academic-brief.html) | working scientists | 1 page |
| [Stats Report](./public/docs/stats.html) | sceptics who want the receipts | live data + 3 charts |
| [White Paper](./public/docs/white-paper.html) | methodological reviewers | ~12 pages |
| [Pitch Deck](./public/docs/pitch-deck.html) | broader audience | 12 slides |
| [PDR](./public/docs/pdr.html) | engineers verifying architecture | 16-test matrix |
| [Cover Letter Template](./public/docs/cover-letter.html) | outreach to academics | 180 words |
| [Jacob Demo](./public/docs/jacob-demo.html) | one specific researcher | 3 questions × his papers |
| [Executive Summary](./public/docs/executive-summary.html) | general audience | 600 words |

All documents share the same Anthropic-spec design system (Lora/Poppins, cream paper, Anthropic palette) so screen + PDF speak the same language.

---

## Architecture

```
user → web UI → /api/oracle → provider router → ollama | cloudflare | (anthropic)
                                                ↓
                                   parse 7-slot output
                                                ↓
                                   render + iCloud archive (.md)
```

Stateless Express server. ≈ 250 lines server-side, ≈ 1,200 lines frontend. No build step. No framework dependency.

---

## Honest limits

- N=36 is small. The 95% Wilson CI on a 100% adherence point estimate at N=12 is [0.76, 1.00]. Larger N would tighten this; the methodology and harness are in place to scale it.
- Self-reported confidence is not validated against ground-truth correctness. A calibration study against a labelled set is the obvious next step.
- Smaller models occasionally violate the "do not fabricate citations" constraint. The prompt is hardened but not infallible. Sample inspection of REFS is the user's responsibility.
- The interface cannot forecast events. Neither model has post-cutoff knowledge or live web access. When asked to predict, models honestly say "consensus is silent" and lower confidence.
- The schema is restrictive by design. It is a poor fit for narrative, code generation, or open-ended chat.

---

## License

MIT. See [LICENSE](./LICENSE).

---

## Cite as

> Sharma, S. (2026). *Akasha Pantheon: A structured-output prompting framework with an empirical observation of non-monotonic format adherence across LLM scales.* v0.2.0.

---

## Author

Sparsh Sharma · Melbourne · sparshsharma219@gmail.com
