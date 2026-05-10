/* ============================================================
   AKASHA · APP
   Navigation, render, boot, state, keyboard, iCloud, tweet.
   ============================================================ */
(function () {
  const D = window.AKASHA;
  const F = window.AKASHA_FRACTALS;
  const O = window.AKASHA_ORACLE;

  const SCREENS = [
    { id: 'boot',        label: 'Boot' },
    { id: 'pantheon',    label: 'Pantheon' },
    { id: 'religions',   label: 'Religions' },
    { id: 'languages',   label: 'Languages' },
    { id: 'mysteries',   label: 'Mysteries' },
    { id: 'constants',   label: 'Constants' },
    { id: 'forces',      label: 'Forces' },
    { id: 'laws',        label: 'Laws' },
    { id: 'models',      label: 'Models' },
    { id: 'mindset',     label: 'Mindset' },
    { id: 'oracle',      label: 'Oracle' },
  ];

  // ---------- NAV ----------
  const navEl = document.getElementById('nav');
  for (const s of SCREENS) {
    if (s.id === 'boot') continue;
    const b = document.createElement('button');
    b.textContent = s.label;
    b.dataset.target = s.id;
    b.addEventListener('click', () => show(s.id));
    navEl.appendChild(b);
  }

  function show(id) {
    document.querySelectorAll('.screen').forEach((el) => {
      el.classList.toggle('active', el.dataset.screen === id);
    });
    document.querySelectorAll('.nav button').forEach((el) => {
      el.classList.toggle('active', el.dataset.target === id);
    });
    if (id === 'oracle') ensureFractal();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  // ---------- STATUS ----------
  const statusEl = document.getElementById('status');
  const oracleMetaEl = document.getElementById('oracle-meta');
  fetch('/api/health').then((r) => r.json()).then((j) => {
    const def = j.default_provider || 'ollama';
    const ps = j.providers || {};
    const fast = ps.ollama || {};
    const deep = ps.cloudflare || {};
    const fastOK = fast.up;
    const deepOK = deep.available;
    let tag;
    if (def === 'cloudflare' && deepOK) tag = `deep · ${deep.model?.replace('@cf/meta/','').replace('-fp8-fast','')}`;
    else if (def === 'ollama' && fastOK) tag = `fast · ${fast.model}`;
    else if (deepOK) tag = `deep · cloudflare`;
    else if (fastOK) tag = `fast · ${fast.model}`;
    else tag = 'offline';
    statusEl.textContent = tag;
    oracleMetaEl.textContent = `default ${def}  ·  fast ${fastOK ? '✓' : '×'}  ·  deep ${deepOK ? '✓' : '×'}` + (j.icloud_export ? '  ·  iCloud sync on' : '');
    if (def === 'ollama' && !fastOK) {
      statusEl.style.color = 'var(--crimson)';
      statusEl.textContent = 'ollama down — run: ollama serve';
    }
  }).catch(() => { statusEl.textContent = 'offline'; });

  // ---------- BOOT SEQUENCE ----------
  const bootLog = document.getElementById('boot-log');
  const enterBtn = document.getElementById('enter');
  const bootLines = [
    '> initialize akasha.kernel',
    '  loading civilizations.................. 40 / 40 ✓',
    '  loading religions...................... 22 / 22 ✓',
    '  loading languages...................... 13 / 13 ✓',
    '  loading mysteries...................... 11 / 11 ✓',
    '  loading constants......................  9 /  9 ✓',
    '  loading forces.........................  6 /  6 ✓',
    '  loading laws...........................  11 / 11 ✓',
    '  loading mental models..................  12 / 12 ✓',
    '  loading mindset........................  12 / 12 ✓',
    '  loading voices.........................  20 / 20 ✓',
    '> tuning the seven hermetic principles…',
    '  i.    mentalism        [ ✓ ]',
    '  ii.   correspondence   [ ✓ ]',
    '  iii.  vibration        [ ✓ ]',
    '  iv.   polarity         [ ✓ ]',
    '  v.    rhythm           [ ✓ ]',
    '  vi.   cause & effect   [ ✓ ]',
    '  vii.  gender           [ ✓ ]',
    '> opening the akashic record…',
    '> handshake with local oracle……………… ready.',
    '',
    '  ⟁  the pantheon is open.',
  ];
  let bootIdx = 0;
  function tickBoot() {
    if (bootIdx >= bootLines.length) {
      enterBtn.classList.remove('hidden');
      return;
    }
    bootLog.textContent += bootLines[bootIdx] + '\n';
    bootIdx++;
    setTimeout(tickBoot, 70 + Math.random() * 60);
  }
  tickBoot();
  enterBtn.addEventListener('click', () => show('pantheon'));

  // ---------- DETAIL HELPER ----------
  function openDetail(panel, html) {
    panel.classList.remove('hidden');
    panel.innerHTML = html + `<button class="close">close</button>`;
    panel.querySelector('.close').addEventListener('click', () => panel.classList.add('hidden'));
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ---------- CIVILIZATIONS ----------
  const civGrid = document.getElementById('civ-grid');
  const civDetail = document.getElementById('civ-detail');
  for (const c of D.civilizations) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="glyph">${c.glyph}</div>
      <div class="name">${c.name}</div>
      <div class="meta">${c.region} · ${c.span}</div>
      <div class="note">${c.note}</div>
    `;
    card.addEventListener('click', () => openDetail(civDetail, `
      <h2>${c.glyph}  ${c.name}</h2>
      <div class="sub">${c.region} · ${c.span}</div>
      <p>${c.note}</p>
      <div class="gods">${c.gods.map(([n, role]) => `<div class="god"><strong>${n}</strong> — ${role}</div>`).join('')}</div>
    `));
    civGrid.appendChild(card);
  }

  // ---------- RELIGIONS ----------
  const relGrid = document.getElementById('rel-grid');
  const relDetail = document.getElementById('rel-detail');
  for (const r of D.religions) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="name">${r.name}</div>
      <div class="meta">${r.status} · ${r.adherents}</div>
      <div class="note">${r.core}</div>
    `;
    card.addEventListener('click', () => openDetail(relDetail, `
      <h2>${r.name}</h2>
      <div class="sub">${r.status} · ${r.adherents}</div>
      <p>${r.core}</p>
    `));
    relGrid.appendChild(card);
  }

  // ---------- LANGUAGES ----------
  const langGrid = document.getElementById('lang-grid');
  const langDetail = document.getElementById('lang-detail');
  for (const l of D.languages) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="glyph">${l.script}</div>
      <div class="name">${l.name}</div>
      <div class="meta">${l.age}</div>
      <div class="note">"${l.sample}" — ${l.gloss}</div>
    `;
    card.addEventListener('click', () => openDetail(langDetail, `
      <h2>${l.name}</h2>
      <div class="sub">${l.script} · ${l.age}</div>
      <p style="font-family:var(--serif); font-size:24px; color:var(--gold-bright); margin:8px 0;">${l.sample}</p>
      <p><em>"${l.gloss}"</em></p>
      <p>${l.note}</p>
    `));
    langGrid.appendChild(card);
  }

  // ---------- MYSTERIES ----------
  const mystGrid = document.getElementById('myst-grid');
  const mystDetail = document.getElementById('myst-detail');
  for (const m of D.mysteries) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="glyph">${m.glyph}</div>
      <div class="name">${m.name}</div>
      <div class="meta">${m.where} · ${m.age}</div>
      <div class="note">${m.anomaly}</div>
    `;
    card.addEventListener('click', () => openDetail(mystDetail, `
      <h2>${m.glyph}  ${m.name}</h2>
      <div class="sub">${m.where} · ${m.age}</div>
      <p><strong style="color:var(--gold-bright)">Anomaly:</strong> ${m.anomaly}</p>
      <p><strong style="color:var(--ink-dim)">Consensus:</strong> ${m.consensus}</p>
      <p><strong style="color:var(--crimson)">Mystic:</strong> ${m.mystic}</p>
    `));
    mystGrid.appendChild(card);
  }

  // ---------- CONSTANTS ----------
  const constGrid = document.getElementById('const-grid');
  for (const c of D.constants) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="name">${c.name}</div>
      <div class="value">${c.value}</div>
      <div class="note">${c.meaning}</div>
    `;
    constGrid.appendChild(card);
  }

  // ---------- FORCES ----------
  const forceGrid = document.getElementById('force-grid');
  for (const f of D.forces) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="name">${f.name}</div>
      <div class="meta">range ${f.range} · strength ${f.strength}</div>
      <div class="value" style="font-size:13px;">tradition: ${f.tradition}</div>
      <div class="note">${f.note}</div>
    `;
    forceGrid.appendChild(card);
  }

  // ---------- LAWS ----------
  const lawList = document.getElementById('law-list');
  for (const l of D.laws) {
    const row = document.createElement('div');
    row.className = 'law';
    row.innerHTML = `
      <div class="num">${l.num}</div>
      <div>
        <h3>${l.name}</h3>
        <div class="pair">${l.pair}</div>
        <p>${l.text}</p>
      </div>
    `;
    lawList.appendChild(row);
  }

  // ---------- MODELS ----------
  const modelGrid = document.getElementById('model-grid');
  for (const m of D.models) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="name">${m.name}</div>
      <div class="meta">${m.lineage}</div>
      <div class="note"><strong>${m.one}</strong></div>
      <div class="note" style="margin-top:6px;"><em>${m.example}</em></div>
    `;
    modelGrid.appendChild(card);
  }

  // ---------- MINDSET + VOICES ----------
  const mindsetList = document.getElementById('mindset-list');
  for (const m of D.mindset) {
    const row = document.createElement('div');
    row.className = 'law';
    row.innerHTML = `
      <div class="num">❝</div>
      <div>
        <h3>${m.name}</h3>
        <div class="pair">${m.who}</div>
        <p style="font-family:var(--serif); font-size:18px; color:var(--ink); font-style:italic;">"${m.quote}"</p>
        <p style="color:var(--ink-dim); margin-top:6px;"><strong>Apply:</strong> ${m.apply}</p>
      </div>
    `;
    mindsetList.appendChild(row);
  }
  const voiceList = document.getElementById('voice-list');
  for (const v of D.voices) {
    const card = document.createElement('div');
    card.className = 'voice';
    card.innerHTML = `
      <p>"${v.line}"</p>
      <div class="who">— ${v.who}</div>
    `;
    voiceList.appendChild(card);
  }

  // ---------- ORACLE ----------
  const fractalCanvas = document.getElementById('fractal');
  let currentFractal = 'mandelbrot';
  let fractalDrawn = false;
  function drawFractal(name) {
    currentFractal = name;
    requestAnimationFrame(() => {
      if (name === 'mandelbrot') F.mandelbrot(fractalCanvas);
      else if (name === 'julia') F.julia(fractalCanvas);
      else if (name === 'sierpinski') F.sierpinski(fractalCanvas);
      else if (name === 'flower') F.flower(fractalCanvas);
      else if (name === 'metatron') F.metatron(fractalCanvas);
      fractalDrawn = true;
    });
  }
  function ensureFractal() {
    if (!fractalDrawn) drawFractal('mandelbrot');
  }
  document.querySelectorAll('.fractal-tabs button').forEach((b) => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.fractal-tabs button').forEach((x) => x.classList.remove('active'));
      b.classList.add('active');
      drawFractal(b.dataset.fractal);
    });
  });

  // suggested prompts
  const pillsEl = document.getElementById('prompt-pills');
  const qEl = document.getElementById('q');
  for (const p of D.prompts) {
    const pill = document.createElement('button');
    pill.className = 'pill';
    pill.textContent = p;
    pill.addEventListener('click', () => { qEl.value = p; qEl.focus(); });
    pillsEl.appendChild(pill);
  }

  const askBtn = document.getElementById('ask');
  const out = document.getElementById('oracle-out');
  const tweetBtn = document.getElementById('copy-tweet');
  const mdBtn    = document.getElementById('copy-md');
  const saveBtn  = document.getElementById('save-icloud');
  const presentBtn = document.getElementById('present');
  let lastResult = null;
  let oracleMode  = localStorage.getItem('akasha.mode')  || 'cloudflare';
  let oracleVoice = localStorage.getItem('akasha.voice') || 'poly';

  document.querySelectorAll('.mode-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.mode === oracleMode);
    b.addEventListener('click', () => {
      oracleMode = b.dataset.mode;
      localStorage.setItem('akasha.mode', oracleMode);
      document.querySelectorAll('.mode-btn').forEach(x => x.classList.toggle('active', x === b));
    });
  });
  document.querySelectorAll('.voice-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.voice === oracleVoice);
    b.addEventListener('click', () => {
      oracleVoice = b.dataset.voice;
      localStorage.setItem('akasha.voice', oracleVoice);
      document.querySelectorAll('.voice-btn').forEach(x => x.classList.toggle('active', x === b));
      updatePlaceholder();
    });
  });
  function updatePlaceholder() {
    const q = document.getElementById('q');
    if (!q) return;
    if (oracleVoice === 'academic') {
      q.placeholder = "Pose a falsifiable question. ‘What is the Lyapunov exponent regime where flow-state EEG signatures emerge?’ ‘Does the Hartman-Grobman theorem extend to discrete-event social dynamics?’";
    } else {
      q.placeholder = "Ask. ‘What did the builders of Göbekli Tepe know that we forgot?’ ‘What is the physics of flow state?’ ‘Why does π appear in probability?’";
    }
  }
  updatePlaceholder();

  askBtn.addEventListener('click', async () => {
    const q = qEl.value.trim();
    if (!q) { qEl.focus(); return; }
    askBtn.disabled = true;
    askBtn.innerHTML = 'CONSULTING…';
    tweetBtn.classList.add('hidden');
    saveBtn.classList.add('hidden');
    out.innerHTML = '<div class="row fuzzy"><span class="label">…</span>the akasha is listening (running on your machine)</div>';
    drawFractal(currentFractal === 'mandelbrot' ? 'julia' : currentFractal);
    try {
      const parsed = await O.ask(q, oracleMode, oracleVoice);
      lastResult = { question: q, parsed };
      O.render(parsed, out);
      if (parsed.tweet) tweetBtn.classList.remove('hidden');
      if (parsed.raw) {
        saveBtn.classList.remove('hidden');
        mdBtn.classList.remove('hidden');
        presentBtn.classList.remove('hidden');
      }
    } catch (e) {
      out.innerHTML = `<div class="row fuzzy"><span class="label">Error</span>${e.message}</div>
        <div class="conf">tip: make sure ollama is running — <code>ollama serve</code> — and gemma3:4b is pulled</div>`;
    } finally {
      askBtn.disabled = false;
      askBtn.innerHTML = 'CONSULT THE AKASHA  <span class="kbd">⌘↵</span>';
    }
  });

  qEl.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') askBtn.click();
  });

  tweetBtn.addEventListener('click', async () => {
    if (!lastResult?.parsed?.tweet) return;
    const text = `${lastResult.parsed.tweet}\n\n— Akasha · on "${lastResult.question}"`;
    try {
      await navigator.clipboard.writeText(text);
      tweetBtn.textContent = 'copied ✓';
      setTimeout(() => { tweetBtn.textContent = 'copy tweet'; }, 1400);
    } catch {
      tweetBtn.textContent = 'copy failed';
    }
  });

  // ---------- COPY AS MARKDOWN ----------
  function buildMarkdown(r) {
    const p = r.parsed;
    const ts = new Date().toLocaleString('en-AU', { timeZone: 'Australia/Melbourne' });
    return [
      `# ${r.question}`,
      ``,
      `*${ts} · ${p.provider}${p.model ? ' · ' + p.model : ''}*`,
      ``,
      p.literal && `**Literal** — ${p.literal}`,
      p.mythic  && `**Mythic** — ${p.mythic}`,
      p.fuzzy   && `**Fuzzy** — ${p.fuzzy}`,
      p.sigil   && `**Sigil** — *${p.sigil}*`,
      p.tweet   && `**Tweet** — ${p.tweet}`,
      p.confidence != null && `\nConfidence: ${Math.round(p.confidence * 100)}%`,
      ``,
      `---`,
      `Akasha Pantheon · fuzzy-truth oracle`,
    ].filter(Boolean).join('\n');
  }
  mdBtn.addEventListener('click', async () => {
    if (!lastResult) return;
    try {
      await navigator.clipboard.writeText(buildMarkdown(lastResult));
      mdBtn.textContent = 'copied ✓';
      setTimeout(() => { mdBtn.textContent = 'copy md'; }, 1400);
    } catch { mdBtn.textContent = 'failed'; }
  });

  // ---------- PRESENT (one-click PDF-ready report) ----------
  function escHtml(s) {
    return String(s || '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  }
  function buildPresentHTML(r) {
    const p = r.parsed;
    const date = new Date().toLocaleDateString('en-AU', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
    const time = new Date().toLocaleTimeString('en-AU', { hour:'numeric', minute:'2-digit' });
    const conf = p.confidence != null ? Math.round(p.confidence * 100) + '%' : '—';
    return `<!doctype html><html><head><meta charset="utf-8">
<title>Akasha · ${escHtml(r.question.slice(0, 60))}</title>
<style>
  @page { size: A4; margin: 22mm 22mm 18mm 22mm; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { font-family: 'Cormorant Garamond', 'Iowan Old Style', 'Palatino', serif; color: #1c1714; background: #fbf8ef; margin: 0; padding: 40px 56px; line-height: 1.55; max-width: 860px; margin-left:auto; margin-right:auto; }
  .mono { font-family: 'IBM Plex Mono', Menlo, monospace; }
  header { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 2px solid #b08a1f; padding-bottom: 10px; margin-bottom: 30px; }
  header .brand { font-size: 14px; letter-spacing: 0.32em; color: #8a6a14; font-weight: 600; }
  header .meta { font-family: 'IBM Plex Mono', Menlo, monospace; font-size: 10px; color: #6e6553; letter-spacing: 0.08em; }
  h1 { font-size: 28px; font-weight: 500; margin: 0 0 6px; color: #1c1714; line-height: 1.2; }
  .subtitle { color: #6e6553; font-style: italic; font-size: 14px; margin-bottom: 36px; }
  .section { margin-bottom: 22px; padding-left: 18px; border-left: 3px solid #b08a1f; page-break-inside: avoid; }
  .section .label { display: block; font-family: 'IBM Plex Mono', Menlo, monospace; font-size: 9px; letter-spacing: 0.28em; color: #8a6a14; text-transform: uppercase; margin-bottom: 4px; font-weight: 600; }
  .section.literal { border-color: #1f6f6b; }
  .section.mythic  { border-color: #8b1e2b; }
  .section.fuzzy   { border-color: #b08a1f; }
  .section.sigil   { border-color: #2a1b5d; }
  .section.tweet   { border-color: #b08a1f; background: rgba(176,138,31,0.06); padding: 14px 18px; border-radius: 2px; font-size: 17px; }
  .section.sigil p, .section.tweet p { font-style: italic; }
  .section p { margin: 0; font-size: 15.5px; }
  footer { margin-top: 56px; border-top: 1px solid #e3dab8; padding-top: 12px; display: flex; justify-content: space-between; font-family: 'IBM Plex Mono', Menlo, monospace; font-size: 9px; color: #8a8270; letter-spacing: 0.12em; }
  .glyph { color: #b08a1f; font-size: 18px; }
  @media print { .noprint { display: none; } }
  .noprint { position: fixed; top: 16px; right: 16px; background: #1c1714; color: #f7d96b; border: none; padding: 8px 16px; font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.18em; cursor: pointer; }
</style></head><body>
<button class="noprint" onclick="window.print()">⌘P · save as pdf</button>
<header>
  <div class="brand"><span class="glyph">⟁</span>  AKASHA · PANTHEON</div>
  <div class="meta">${escHtml(date)} · ${escHtml(time)} AEST</div>
</header>
<h1>${escHtml(r.question)}</h1>
<div class="subtitle">A fuzzy-truth response from the oracle.</div>
${p.literal ? `<div class="section literal"><span class="label">Literal · what consensus says</span><p>${escHtml(p.literal)}</p></div>` : ''}
${p.mythic  ? `<div class="section mythic"><span class="label">Mythic · how tradition framed it</span><p>${escHtml(p.mythic)}</p></div>` : ''}
${p.fuzzy   ? `<div class="section fuzzy"><span class="label">Fuzzy · the synthesis</span><p>${escHtml(p.fuzzy)}</p></div>` : ''}
${p.sigil   ? `<div class="section sigil"><span class="label">Sigil</span><p>${escHtml(p.sigil)}</p></div>` : ''}
${p.tweet   ? `<div class="section tweet"><span class="label">Tweet · the compression</span><p>${escHtml(p.tweet)}</p></div>` : ''}
<footer>
  <div>generated · ${escHtml(p.provider || 'oracle')}${p.model ? ' · ' + escHtml(p.model) : ''} · confidence ${conf}</div>
  <div>akasha-pantheon · sparsh sharma</div>
</footer>
<script>setTimeout(() => window.print(), 350);</script>
</body></html>`;
  }
  presentBtn.addEventListener('click', () => {
    if (!lastResult) return;
    const w = window.open('', '_blank', 'width=900,height=1100');
    if (!w) {
      presentBtn.textContent = 'popup blocked';
      setTimeout(() => { presentBtn.textContent = 'PRESENT (PDF)'; }, 1800);
      return;
    }
    w.document.open();
    w.document.write(buildPresentHTML(lastResult));
    w.document.close();
  });

  saveBtn.addEventListener('click', async () => {
    if (!lastResult) return;
    saveBtn.textContent = 'saving…';
    try {
      const r = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: lastResult.question, raw: lastResult.parsed.raw }),
      });
      const j = await r.json();
      saveBtn.textContent = j.ok ? 'saved ✓' : 'iCloud not configured';
      setTimeout(() => { saveBtn.textContent = 'save to iCloud'; }, 1800);
    } catch {
      saveBtn.textContent = 'save failed';
    }
  });

  // ---------- KEYBOARD ----------
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
    if (e.metaKey || e.ctrlKey) {
      // ⌘+1..9 → SCREENS[1..9]   ·   ⌘+0 → oracle (last screen)
      if (e.key >= '0' && e.key <= '9') {
        const n = parseInt(e.key, 10);
        const idx = n === 0 ? SCREENS.length - 1 : n;
        if (SCREENS[idx]) { e.preventDefault(); show(SCREENS[idx].id); }
      }
    }
    if (e.key === '/') {
      e.preventDefault();
      show('oracle');
      setTimeout(() => qEl.focus(), 60);
    }
  });

  // ---------- INITIAL SCREEN ----------
  show('boot');
})();
