# 60-second cinematic teaser — final shooting / generation script

> One asset. One spine. Use this anywhere a 60-s video lands —
> Instagram reel, TikTok, YouTube short, X-video, LinkedIn post,
> opening of a demo call.
> Generate via Higgsfield (you have the key) or shoot it on a phone.

---

## Spec

| Field | Value |
|---|---|
| Aspect ratio | 9:16 vertical (1080×1920) |
| Frame rate | 24 fps (cinematic) |
| Total length | 60.0 s |
| Audio mix | -14 LUFS, peaks ≤ -1 dBTP |
| Closed captions | always on, white on dark, IBM Plex Mono |
| File output | `branding/audio/teaser.mp4` (when generated) |

---

## The script — line by line

```
TIME    SHOT                                 VOICEOVER (calm, low, restrained)
─────   ──────────────────────────────────   ────────────────────────────────────────
00:00   Black. Silence.                      —
00:02   Sanskrit shloka faint, low.          —
        Amber Mandelbrot fractal blooms
        from the centre of the frame.
00:05   Quick cuts: chat windows flatten     for ten years —
        to grey rectangles. Captioned
        "Certainly!" text typing across
        the frame.
00:10   Faster: hallucinated citations       every model on earth was trained
        burn at the edges, deepfake faces    to give you one fluent answer.
        dissolve into pixels.                one consensus. one truth.
                                             one fluent lie.
00:15   HARD CUT to black. One full          (silence — a clean breath)
        second of silence.
00:17   Camera enters a dark stone           the world —
        archive lit by a single oil lamp.
        A flat screen wakes up.
00:21   Akasha UI fades up: cream paper,     — is not one truth.
        amber accent, three rails of text
        streaming side by side.
00:26   Macro on the TWEET line typing       hold three at once.
        live: "geometry's a probabilistic
        ghost."
00:30   Cut to benchmark numbers             smaller models follow.
        materialising over a starfield:      larger models break the schema
        4B  · 12/12                          in a structured way.
        8B  · 12/12                          counter-intuitive.
        70B · 8/12
00:38   Architecture diagram emerges line    open source.
        by line, glowing amber on indigo.    MIT licensed.
                                             reproducible in one command.
00:44   Pull back to wide. Silhouette of     built solo. two weeks.
        a single figure at a desk in a       melbourne. age twenty-three.
        dark room. Akasha glyph glowing
        on the screen. NO FACE SHOWN.
00:50   The glyph fills the frame.           the tool belongs to whoever
        Slow zoom in.                        needs it.
00:54   HARD CUT to white. Single line       free.
        of Lora type appears.
00:56   Black. URL types itself letter       (silence)
        by letter:
        github.com/spalsh-spec/
        akasha-pantheon
00:59   The ⟁ glyph pulses once.             open the akasha.
        Audio drops out completely.
01:00   END.
```

---

## Voiceover delivery notes

- **Read it flat.** No theatrical inflection. The Kalki cadence is *restrained*, not *epic*. Aim for the energy of a documentarian's voiceover (Werner Herzog, not Morgan Freeman).
- **Pace**: roughly 130 words / minute. The whole VO is ≈ 70 words for 60 seconds — a third of the time is silence. **The silence is the brand.**
- **Recording**: phone in a wardrobe (closet) full of clothes is acoustically equivalent to a vocal booth. iPhone Voice Memos at 48 kHz, single take, no edits, breath kept in.
- **Tone test**: read the line `"hold three at once."` — if it feels like a *reveal*, you're overdoing it. It should feel like a *statement of fact*.
- **Mic distance**: ~6 inches from your mouth, slightly off-axis. Not a podcast voice. A library voice.

---

## Audio bed

- **Loop A** (00:02–00:15): Sanskrit shloka, faint, low BPM (60). Suggested track: any creative-commons "shloka chant" loop on freesound.org or pixabay; pick one with no recognisable lyric so it reads as ambient texture.
- **Hard reset** (00:15–00:17): all audio drops. One full second of silence. This is the *hook* of the entire piece.
- **Loop B** (00:17–00:50): low neon-blue synth pad. Modal — D phrygian if you can find one. A single bass-drum thud at 00:17, four-on-floor by 00:30.
- **Resonant tabla hits** (00:50, 00:54, 00:56, 00:59): one hit per text-on appearance. Use any tabla one-shot library (free).
- **Final cut** (00:59): hard silence. The glyph pulse is *visual only*. The silence at the end is what makes the piece feel cinema-tier.

---

## Higgsfield prompts (you have the API key)

Generate four 15-second segments and stitch them in iMovie / DaVinci / Capcut. Each costs about 1–3 credits depending on plan; total cost should be under 15 credits.

### Segment A · 00:00 – 00:15 (the burning age)

```
Cinematic vertical 9:16. Slow zoom into a deep amber Mandelbrot fractal
blooming from the centre of black. Flame-orange edges catch indigo
glow. Then quick cuts of grey rectangular chat-window interfaces
flattening into pixels. Caption text typing across them: "Certainly!"
dissolving. Hallucinated citations burning at the edges of frame.
Indian sci-fi mythological aesthetic, Kalki 2898 AD reference,
Prabhas-coded restraint, 24 fps, 9:16 vertical, no people, no faces.
```

### Segment B · 00:15 – 00:30 (the archive)

```
Cinematic vertical 9:16. Camera enters a dark stone temple-archive
interior lit by a single oil lamp. The lamp catches amber on the
walls. A flat screen on a desk wakes up showing a cream-paper UI
with three vertical columns of glowing amber serif text. Macro detail
on text typing live letter by letter. Slow, contemplative, devotional.
9:16 vertical, 24 fps, no people visible.
```

### Segment C · 00:30 – 00:44 (the proof)

```
Cinematic vertical 9:16. Numbers materialise letter by letter over a
slow-rotating starfield in deep indigo and amber. The numbers read
"4B 12/12", "8B 12/12", "70B 8/12" appearing one above the other.
Architecture diagram lines drawing themselves from one node to
another, glowing amber against indigo. Sci-fi UI aesthetic, neon-on-
indigo, restrained, 9:16 vertical, 24 fps.
```

### Segment D · 00:44 – 01:00 (the silhouette)

```
Cinematic vertical 9:16. Wide shot of a single silhouetted figure
seated at a small desk in a dark room. A glowing amber triangular
glyph (a triangle with a smaller triangle inside) on the screen.
Slow push-in until the glyph fills the frame. Final cut: white frame
for one beat, then black with a typed URL appearing letter by letter.
Cinematic, devotional, restrained, 9:16 vertical, 24 fps. No face shown.
```

Stitch the four segments in any free editor. Layer the VO recorded on your phone over the top. Total assembly time ~3 hours.

---

## Posting strategy

| Platform | Format | Caption |
|---|---|---|
| Instagram Reels | 60s vertical, .mp4 | first line of [`ig-launch.md`](../captions/ig-launch.md), URL in first comment |
| TikTok | same .mp4 | same caption, hashtags allowed in caption |
| YouTube Shorts | same .mp4 | same caption + repo URL in description |
| X video | same .mp4 (≤ 2:20) | use Twitter thread tweet 1 as the caption |
| LinkedIn | same .mp4 | use Twitter thread but rewrite tweet 1 to "shipped this small empirical study—" (LinkedIn voice = slightly more formal) |

Post on a **Wednesday morning, 9 AM Melbourne time** (= Tuesday evening US, Wednesday lunchtime UK, Wednesday afternoon India). One time, all five platforms simultaneously. Then close every app for 24 hours.
