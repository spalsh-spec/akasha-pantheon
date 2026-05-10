/* ============================================================
   AKASHA · ORACLE — two voices: poly (5-section) + academic
   ============================================================ */
window.AKASHA_ORACLE = (function () {

  const POLY_KEYS = ['literal','mythic','fuzzy','sigil','tweet'];
  const ACAD_KEYS = ['claim','evidence','uncertainty','implication','open','refs'];
  const ALL_KEYS = [...POLY_KEYS, ...ACAD_KEYS];

  function parse(raw) {
    const out = { confidence: null };
    for (const k of ALL_KEYS) out[k] = '';
    if (!raw) return out;

    let text = raw.replace(/^```[a-z]*\n?|```$/gim, '').trim();
    text = text.replace(/^(here(?:'s| is)|sure|certainly|of course)[:,]?\s*/i, '');

    const KEY_REGEX = new RegExp(
      '^\\s*(?:[*•_-]\\s*)?\\**\\s*(' +
      ALL_KEYS.map(k => k.toUpperCase()).join('|') +
      '|CONFIDENCE)\\**\\s*[:：]\\s*(.*)$', 'i'
    );

    const lines = text.split(/\r?\n/);
    let cur = null, buf = [];
    const flush = () => {
      if (cur && buf.length) out[cur] = buf.join(' ').replace(/\s+/g,' ').trim();
      buf = [];
    };
    for (const line of lines) {
      const m = line.match(KEY_REGEX);
      if (m) {
        flush();
        const key = m[1].toLowerCase();
        if (key === 'confidence') {
          const v = parseFloat(m[2]);
          out.confidence = isNaN(v) ? null : Math.max(0, Math.min(1, v));
          cur = null;
        } else {
          cur = key;
          buf = [m[2]];
        }
      } else if (cur) {
        buf.push(line.trim());
      }
    }
    flush();

    for (const k of ALL_KEYS) {
      out[k] = (out[k] || '').replace(/\*\*(.+?)\*\*/g,'$1').replace(/\*(.+?)\*/g,'$1');
    }
    // detect voice from which keys actually got populated
    const acadHits = ACAD_KEYS.filter(k => out[k]).length;
    const polyHits = POLY_KEYS.filter(k => out[k]).length;
    out._voice = acadHits >= polyHits ? 'academic' : 'poly';
    return out;
  }

  async function ask(question, provider, voice = 'poly') {
    const res = await fetch('/api/oracle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, provider, voice }),
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.detail || e.error || `HTTP ${res.status}`);
    }
    const data = await res.json();
    return { ...parse(data.raw), raw: data.raw, voice: data.voice, ms: data.ms, exported: data.exported, provider: data.provider, model: data.model };
  }

  function render(parsed, container) {
    container.innerHTML = '';
    const voice = parsed.voice || parsed._voice || 'poly';
    const order = voice === 'academic' ? [
      ['claim',        'Claim'],
      ['evidence',     'Evidence'],
      ['uncertainty',  'Uncertainty'],
      ['implication',  'Implication'],
      ['open',         'Open question'],
      ['refs',         'References'],
    ] : [
      ['literal', 'Literal'],
      ['mythic',  'Mythic'],
      ['fuzzy',   'Fuzzy'],
      ['sigil',   'Sigil'],
      ['tweet',   'Tweet'],
    ];
    for (const [key, label] of order) {
      if (!parsed[key]) continue;
      const row = document.createElement('div');
      row.className = `row ${key} ${voice}`;
      row.innerHTML = `<span class="label">${label}</span>${escapeHtml(parsed[key])}`;
      container.appendChild(row);
    }

    const meta = document.createElement('div');
    meta.className = 'conf';
    const bits = [];
    if (parsed.confidence != null) bits.push(`confidence ${Math.round(parsed.confidence * 100)}%`);
    if (parsed.ms)                 bits.push(`${(parsed.ms/1000).toFixed(1)}s`);
    if (parsed.provider)           bits.push(parsed.provider + (parsed.model ? '·' + parsed.model : ''));
    bits.push('voice: ' + voice);
    if (parsed.exported)           bits.push('saved → iCloud');
    meta.textContent = bits.join('  ·  ');
    container.appendChild(meta);

    const hasContent = order.some(([k]) => parsed[k]);
    if (!hasContent) {
      const row = document.createElement('div');
      row.className = 'row fuzzy';
      row.innerHTML = `<span class="label">Raw (model didn't honor format)</span>${escapeHtml(parsed.raw || '(empty)')}`;
      container.appendChild(row);
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  }

  return { ask, parse, render, POLY_KEYS, ACAD_KEYS };
})();
