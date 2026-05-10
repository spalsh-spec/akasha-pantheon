# Akasha — Brand Spec

> One design system. Screen, print, and feed all speak the same language.

---

## Voice

| | |
|---|---|
| **Posture** | Calm. Specific. Calibrated. Builder-not-prophet. |
| **Energy**  | Kalki-aesthetic, never Kalki-identity. The tool stands at the threshold of an age; *you* are the engineer who shipped it. |
| **Sentence shape** | Short. Concrete. Numbers preferred to adjectives. |
| **Forbidden words** | "revolutionary", "game-changer", "AGI", "groundbreaking", "disrupt", "synergy", "harness", "unlock the power of". |
| **Allowed flexes** | "shipped." · "two weeks. solo." · "open source. MIT." · "reproduce in one command." · the empirical numbers (12/12, 12/12, 8/12). |
| **House rule** | Every claim has a number, a citation, or a `(needs verification)` flag next to it. Never both vague and confident. |

---

## Colours (lock these in)

```
Cream paper     #faf9f5    (light bg, body text on dark)
Deep void       #0a0716    (cinematic bg)
Indigo bloom    #1c1133    (gradient pole, hero scenes)
Amber flame     #d97757    (primary accent — Anthropic orange-coded)
Ember glow      #f7d96b    (highlight, headline accent)
Soft amber      #f4dfd2    (callout backgrounds, italic text)
Slate          #2a4a6c    (academic-mode accent — claim card)
Mid grey       #b0aea5    (secondary text)
Forest green   #788c5d    (implication / synthesis accent)
```

Use cream-paper-on-amber for product/UI surfaces.
Use deep-void + amber + ember for cinematic / promo surfaces.

---

## Typography

| Role | Family | Weight |
|---|---|---|
| Display headlines | **Poppins** | 600–700 |
| Body / quotes | **Lora** | 400, 500 italic |
| Numbers / code / citations | **IBM Plex Mono** | 400, 500 |

Tracking: tracked-out caps for eyebrow labels (`A K A S H A · P A N T H E O N`, `letter-spacing: 0.34em`). All other text near zero.

---

## The glyph ⟁

`⟁` (U+27C1, "WHITE TRIANGLE CONTAINING SMALL WHITE TRIANGLE") in amber/ember on indigo. Stand-alone version at `/branding/glyph.svg` and `glyph.png`. Use as favicon, profile pic, watermark.

Always keep the glyph centered inside a thin amber ring at the cinematic scale; bare glyph is fine at icon scale.

---

## Layout primitives

- **Hero composition**: glyph centered at ~55–60% vertical, headline in upper third, tagline + numbers in lower third. URL pinned to bottom edge.
- **Sacred geometry overlay**: 7-circle Flower-of-Life behind glyph at 16% opacity. Always present in cinematic posters.
- **Glow halo**: radial amber gradient at 32px+ Gaussian blur for depth on dark backgrounds.

---

## What goes in every promo

1. The ⟁ glyph
2. The wordmark `A K A S H A · P A N T H E O N`
3. *One* italic tagline (default: *hold three truths at once.*)
4. The benchmark line `4B · 12/12   ·   8B · 12/12   ·   70B · 8/12`
5. The URL `github.com/spalsh-spec/akasha-pantheon`
6. Tiny credit `Sparsh Sharma · Melbourne · 2026`

If any one is missing, the post is off-brand. Run the checklist before publishing.

---

## File map

```
branding/
├── glyph.svg               · 256×256 mark
├── glyph.png               · rendered
├── brand-spec.md           · this file
├── posters/
│   ├── poster-portrait-1080x1350.svg|png   · IG feed
│   ├── poster-square-1080x1080.svg|png     · IG grid
│   ├── poster-story-1080x1920.svg|png      · IG / Snapchat / TikTok story
│   └── og-share-1200x630.svg|png           · Twitter / X / LinkedIn / Discord
├── captions/
│   ├── ig-launch.md        · the launch post
│   ├── ig-friday-builds.md · 4-week build-log calendar
│   └── twitter-thread.md   · X / Twitter thread
└── audio/
    └── teaser-script.md    · 60-s reel script + VO + audio cues
```
