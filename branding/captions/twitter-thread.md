# Twitter / X launch thread

> Post the OG share card (`posters/og-share-1200x630.png`) on the FIRST tweet so the preview card is the cinematic image. Each subsequent tweet attaches the relevant chart as image (rendered from the SVGs in `/public/docs/charts/`).
> Total: 8 tweets. Reads in ≈ 90 seconds. Designed to be screenshot-able as a single thread.

---

## 1/ HOOK

```
shipped a small empirical study of structured-output prompting on LLMs.

found two things, in opposite directions:

format adherence (does the model fill all 7 schema slots?)
  4B  → 100%   8B  → 100%   70B → 94.4%
citation accuracy (does the model cite real papers?)
  4B  → 7.5%   8B  → 11.4%  70B → 36.4%

smaller models follow the schema and fabricate inside it.
larger models break the schema and cite real papers. ↓
```
Attach: `posters/og-share-1200x630.png`

---

## 2/ THE SCHEMA

```
the framework wraps any LLM call in a 7-slot academic schema:

CLAIM · EVIDENCE · UNCERTAINTY · IMPLICATION · OPEN · REFS · CONFIDENCE

enforced via system prompt, verified at parse time. non-conformant
outputs are not displayed as answers — they fall back to a "raw" panel.
```

---

## 3/ THE NUMBERS

```
variance run · N = 108 (3 models × 12 questions × 3 repeated runs)

format adherence:
  4B local  ·  36/36  ·  100%   ·  SEM 0.000
  8B cloud  ·  36/36  ·  100%   ·  SEM 0.000
  70B cloud ·  mean 0.944  ·  SEM 0.012  ·  perfect-rate 22/36

5 of 12 questions gave INCONSISTENT adherence at 70B across the 3
runs. same prompt, same temperature. partly stochastic.

an earlier single-run benchmark reported 67% for the 70B. it was an
outlier. single-run benchmarks of structured-output adherence systematically
over-state failure rates. replicate.
```
Attach: `/public/docs/charts/adherence.svg`.

---

## 4/ THE OPPOSITE-DIRECTION FINDING — citation accuracy

```
every academic-mode response auto-verifies its REFS against Crossref.
combined verified-plus-partial-match rates across the 211 cites
the bench produced:

  4B  →  7.5% real     (most cites have no Crossref match)
  8B  →  11.4% real
  70B →  36.4% real    (and produces more cites per response)

larger models break the schema slightly more often AND cite real
papers far more often. smaller models comply and fabricate. neither
is purely better — they are different axes of model honesty.
```

---

## 5/ THE COUNTER-INTUITIVE BIT

```
i predicted the opposite. the obvious prior is "bigger model = better
instruction-following = higher format adherence."

the data says the inverse.

this was the moment two days before publishing where i caught myself
about to ship the wrong claim. open-source benchmarks save you from
your own priors.
```

---

## 6/ THE LIMITS

```
honest limits, upfront:

- N=12 per model is small. CI on 12/12 is [0.76, 1.00]. need N≥100 for
  publication-grade.
- self-reported confidence is not validated against ground truth.
  calibration study is the obvious next step.
- the tool cannot fold RNA, simulate networks, or forecast events.
  it's a *thinking discipline*, not a research tool. don't oversell.
```

---

## 7/ THE SAFETY NET

```
small models occasionally invent citations. the system prompt forbids
fabrication but doesn't prevent it.

so every academic-mode answer now auto-queries Crossref at render time
and tags every REF as ✓ verified / ⚠ year-mismatch / ✗ unverified,
with the matched paper's title and DOI link.

caught a real case in testing: a 2014 RSB paper got dated as 2001
by the 70B. flagged. the human catches what the prompt can't.
```

---

## 8/ REPRODUCE

```
open source MIT. benchmark JSON, harness, prompt, parser, citation
verifier, and a working web UI.

git clone github.com/spalsh-spec/akasha-pantheon
./scripts/run-full-evaluation.sh

run it on a model i can't afford (claude opus, gpt-4o, gemini).
tell me what you find. v1.0 writeup needs a third dataset.
```

---

## 9/ THE ASK

```
working with two complex-systems researchers on the writeup.
shipped the full prototype solo in two weeks in melbourne.

happy to plug it into anything serious anyone is building.

dms open. forks open.

⟁  github.com/spalsh-spec/akasha-pantheon
```

---

## Quote-tweet replies (for engagement)

When the thread gets ratio'd or quote-tweeted, here are the calibrated replies you can keep ready:

| Common reply | Your calibrated comeback |
|---|---|
| *"this is just structured prompting"* | *"correct — that's stated explicitly in the abstract. the contribution is the empirical observation about adherence, not the prompting technique itself."* |
| *"N=12 is too small"* | *"agreed — explicitly stated as a limit. methodology + harness are in the repo so you can replicate at any N."* |
| *"the 70B failure is just because of the schema specifically"* | *"that's exactly what i'd want to test next. forking it and trying schemas without IMPLICATION would falsify or extend the claim. PR welcome."* |
| *"why open-source it / how do you make money"* | *"the artefact is the credibility. money comes from working with people who care about calibration in their own tools — happy to talk if you're building one."* |
| *"this is overhyped"* | *(don't reply. block if persistent.)* |

---

## Pinning strategy

Pin the launch thread to your X profile for two weeks. Update with a "comments locked, see Friday updates →" tweet on day 14. Reset on the next finding.
