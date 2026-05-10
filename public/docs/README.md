# Akasha Pantheon — README

A fuzzy-truth oracle that holds three legitimate truths at once.
Local-first, free, and structurally pluralist by design.

— *Sparsh Sharma · Melbourne · 10 May 2026*

---

## What it is, in 60 seconds

You ask any question.
The oracle gives you back **five** things at once:

1. **Literal** — what science / mainstream history says.
2. **Mythic** — how a *named* tradition (Vedic, Hermetic, Yoruba, Hopi, …) framed it.
3. **Fuzzy** — the synthesis when both are taken seriously.
4. **Sigil** — a 3–7 word symbolic phrase.
5. **Tweet** — a 240-character compression you can stand behind.

Plus a self-reported confidence number 0.00 → 1.00 on every answer.

Every answer auto-saves to `~/iCloud Drive/Akasha/` as a markdown file you own.

---

## Why it matters

When the question is empirical, one answer is correct.
When the question is *between* registers — most real questions — collapsing it to one answer is dishonest.
The oracle holds three at once without science-washing the myth or myth-washing the science.

---

## Two modes, one toggle

| Mode | Engine | Where | Latency | Cost |
|---|---|---|---|---|
| **FAST** | Ollama gemma3:4b (3.3 GB) | your laptop, no internet | ~13 s | $0 |
| **DEEP** | Llama 3.3 70B FP8 Fast | Cloudflare free tier | ~5 s | $0 |

The toggle is right under the textarea. You pick per question.
FAST is private. DEEP is sharper.

---

## Run it

```bash
cd ~/akasha-pantheon
npm install         # one-time
npm run dev         # → http://localhost:3000
```

`.env` is configured. Ollama is assumed running locally (`ollama serve`). Cloudflare keys are configured if `CF_ACCOUNT_ID` and `CF_API_TOKEN` are present.

---

## Try it

Click any prompt pill, or type your own. Then `⌘+Enter`.

- *Why does π appear in probability?*
- *What is the physics of flow state?*
- *What did the builders of Göbekli Tepe know that we forgot?*
- *Why do all major religions have a flood myth?*
- *What is leverage, in physics and in life?*

After the answer:

- **PRESENT (PDF)** — opens a one-page printable report.
- **COPY MD** — markdown to clipboard.
- **COPY TWEET** — just the tweet line.
- **SAVE TO ICLOUD** — manual archive.

---

## Keyboard

| Key | Action |
|---|---|
| `/` | jump to oracle, focus textarea |
| `⌘+Enter` | submit question |
| `⌘+1..9` | jump to screen 1..9 |
| `⌘+0` | jump to oracle |

---

## Document set

The full case for Akasha lives at [`/docs/`](./index.html):

1. **[Executive Summary](./executive-summary.html)** — 1-page brief.
2. **[White Paper](./white-paper.html)** — first-principles epistemology.
3. **[Pitch Deck](./pitch-deck.html)** — 12 slides, arrow-key nav.
4. **[PDR](./pdr.html)** — preliminary design review.
5. **[Stats Report](./stats.html)** — N=10 benchmark with charts.
6. **README** — this file.

Every doc is print-ready (`⌘+P` → Save as PDF). They share the same Anthropic-spec design language so the screen and the PDF speak the same language.

---

## What it isn't

- **Not a forecaster.** Asked to predict the future, both models honestly say "consensus is silent" and lower their confidence. That's the point.
- **Not a chat assistant.** Format-locked output is bad for narrative or code. Use a general LLM for those.
- **Not a metaphysical claim.** The Mythic field is a *framing*, not an assertion that any tradition is empirically true.

---

## License

Source code MIT. Documents CC-BY-4.0.
Cite as: *Sharma, S. (2026). "Akasha Pantheon: A structural prior for epistemic pluralism in LLM interfaces." v0.2.0.*

---

## Maintainer

Sparsh Sharma  
sparshsharma219@gmail.com  
Melbourne, Australia
