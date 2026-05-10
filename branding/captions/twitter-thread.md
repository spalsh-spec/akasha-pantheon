# Twitter / X launch thread

> Post the OG share card (`posters/og-share-1200x630.png`) on the FIRST tweet so the preview card is the cinematic image. Each subsequent tweet attaches the relevant chart as image (rendered from the SVGs in `/public/docs/charts/`).
> Total: 8 tweets. Reads in ≈ 90 seconds. Designed to be screenshot-able as a single thread.

---

## 1/ HOOK

```
shipped a small empirical study of structured-output prompting on LLMs.

found something nobody seems to have published with explicit numbers:
format adherence is *non-monotonic* in model scale.

4B  → 12/12
8B  → 12/12
70B → 8/12

the 70B drops, and every failure is the same slot. ↓
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
N = 36 (3 models × 12 questions, all in academic voice).

format adherence (full schema, all 7 slots present):
4B local  ·  12/12  ·  Wilson 95% CI [0.76, 1.00]
8B cloud  ·  12/12  ·  Wilson 95% CI [0.76, 1.00]
70B cloud ·  8/12   ·  Wilson 95% CI [0.39, 0.86]

the intervals do not overlap.
```
Attach: `/public/docs/charts/adherence.svg` (export PNG first).

---

## 4/ THE STRUCTURED FAILURE

```
all four 70B failures are the SAME slot — IMPLICATION — never random.

interpretation: larger models have stronger learned priors about
answer structure that resist explicit format constraints. this
pattern is invisible to binary JSON-mode adherence benchmarks
that only check "did all keys appear" without recording WHICH slot
was elided.
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

## 7/ REPRODUCE

```
everything is open-source MIT.
benchmark JSON, harness, prompt, parser, and a working web UI.

git clone github.com/spalsh-spec/akasha-pantheon
node scripts/benchmark2.mjs
node scripts/charts2.mjs

run it on a model i can't afford (claude opus, gpt-4o, gemini).
tell me what you find. the v1.0 writeup needs a third dataset.
```

---

## 8/ THE ASK

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
