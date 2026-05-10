# Four-Friday build-log calendar

> Post every Friday at ~7 PM Melbourne time for four weeks.
> Same visual template (always the ⟁ glyph + amber on indigo).
> Each post = one specific update + one calibrated number + one open question.
> The point is *visual + voice consistency* — by week 4 the algorithm and humans will recognise your account on the glyph alone.

---

## FRIDAY 1 — *the launch*

> Visual: `posters/poster-portrait-1080x1350.png`
> Caption: see [`ig-launch.md`](./ig-launch.md)

---

## FRIDAY 2 — *the failure mode, in detail*

**Visual idea**: screenshot of the oracle screen with a 70B response that *omits* IMPLICATION. Crop to show just the slot where IMPLICATION should be and the obviously-empty space. Annotate with a red box if you want.

**Caption**:

```
week 2 · the structured failure mode

every time the 70B model breaks the schema, it breaks the SAME slot —
IMPLICATION. four omissions out of twelve, never random.

this is the actual finding worth a paper. binary JSON-mode adherence
benchmarks would call this an 8/12 success rate and move on. the
shape of the failure tells you something: larger models have learned
priors about answer structure that resist explicit format constraints.

next test: does the same model honour IMPLICATION if i merge it into
EVIDENCE? if yes, the slot is the issue. if no, the model is just
opinionated about how academic paragraphs should end.

⟁  github.com/spalsh-spec/akasha-pantheon

dms open. corrections welcome.
```

---

## FRIDAY 3 — *the citation honesty problem*

**Visual idea**: side-by-side screenshots — left, a 70B answer with a misdated citation; right, the corrected version with a `verify` flag. Caption: *"caught the model dating a 2014 paper to 2001."*

**Caption**:

```
week 3 · the citation problem

the model occasionally misdates papers. a 2014 royal society b paper
got 2001'd by the 70B last week.

the system prompt forbids fabrication. the system prompt does not
prevent misdating. that's a different failure surface.

added a flag: every academic-mode response gets a `cite plausible` /
`needs verification` annotation rendered next to each REF. the human
verifies on scholar; the model never claims certainty.

calibration ≠ correctness. the tool is a thinking discipline.
verification stays on the human.

⟁  github.com/spalsh-spec/akasha-pantheon

what citation classes break first when you ask your favourite model
to cite? (i'm collecting examples for the v1.0 paper.)
```

---

## FRIDAY 4 — *what's next*

**Visual idea**: the architecture diagram from `/public/docs/charts/architecture.svg` rendered cinematically (cream-paper card on indigo).

**Caption**:

```
week 4 · what's next

scaling N from 12 to 100 questions per model. running each question
in both POLY and ACADEMIC voice. running each combination 3 times to
get a stochastic-variance estimate.

if the non-monotonic-adherence finding survives N=600, that's a
4-page note worth submitting somewhere serious.

if it doesn't survive, that's also fine — i'd rather know now than
live in the wrong claim for six months.

methodology + raw json + harness all on github. fork it, run it on
models i can't afford (claude opus 4.6, gpt-4o, gemini 2.5), tell me
what you find.

i'll buy you a coffee in melbourne if you do.

⟁  github.com/spalsh-spec/akasha-pantheon
```

---

## What to NOT do during these four weeks

- Don't post anything else on this account. The four posts compound; mixing in selfies / unrelated content dilutes the brand signature.
- Don't reply to trolls. One-liners only ("thanks, that's not the finding"). Block fast.
- Don't oversell when DMs come in. Stay calibrated. *"It's a small empirical observation in a working prototype"* is the sentence that closes deals with the people who can actually pay.
- Don't post benchmark updates with no chart. Numbers + image > numbers alone.
