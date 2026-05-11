/* ============================================================
   VACIS-helper · app.js
   Vital signs (start + end) · event log · drug administration
   · home meds lookup · copy-to-clipboard output.
   localStorage only. Cleared by user. No network.
   ============================================================ */
(function () {
  'use strict';

  /* ------------- VITAL SIGNS DEFINITION ------------- */
  // Each vital: id, label, unit, optional split (e.g. BP sys/dia, GCS E+V+M, pupils L/R)
  const VITALS = [
    { id: 'hr',   label: 'HR',   unit: '/min' },
    { id: 'rr',   label: 'RR',   unit: '/min' },
    { id: 'bp',   label: 'BP',   unit: 'mmHg', split: ['sys','dia'] },
    { id: 'spo2', label: 'SpO₂', unit: '%' },
    { id: 'temp', label: 'Temp', unit: '°C' },
    { id: 'bgl',  label: 'BGL',  unit: 'mmol/L' },
    { id: 'gcs',  label: 'GCS',  unit: 'E·V·M', split: ['e','v','m'] },
    { id: 'pup',  label: 'Pupils', unit: 'L·R mm', split: ['l','r'] },
    { id: 'pain', label: 'Pain', unit: '0–10' },
  ];

  /* ------------- TEMPLATES ------------- */
  const TEMPLATES = {
    chest: {
      pc: 'Central chest pain',
      hx: 'Onset: \nCharacter: dull / sharp / pressure / tearing\nRadiation: arm / jaw / back\nDuration: \nAssociated: SOB / sweating / nausea / syncope\nRelief: rest / GTN / nil\nRisk: HTN / DM / chol / smoke / FHx / prior MI\nECG: ',
    },
    sob: {
      pc: 'Shortness of breath',
      hx: 'Onset: sudden / gradual\nProgression: \nTrigger: cold / dust / exertion / nil\nProductive cough: Y / N — colour: \nPND / orthopnoea / ankle oedema: \nWheeze / crackles / equal AE\nSpO₂ on RA → on O₂: \nPMHx: asthma / COPD / CCF / PE risk',
    },
    stroke: {
      pc: '?Stroke',
      hx: 'FAST: Face / Arms / Speech / Time of onset\nLast seen well: \nDeficit: hemiparesis / aphasia / facial droop / visual\nBSL: \nBP arm 1 / arm 2: \nAnticoag: warfarin / DOAC / nil\nRecent surgery / haemorrhage: \nFor stroke pathway notification',
    },
    fall: {
      pc: 'Fall',
      hx: 'Mechanism: mechanical / syncope / dizzy / LOC\nHeight: \nLOC: Y / N — duration: \nHead strike: Y / N — anticoag: \nC-spine pain / midline tender: \nInjuries: \nMobile prior: Y / N\nLives alone / supports: ',
    },
    seizure: {
      pc: 'Seizure',
      hx: 'Witnessed: Y / N\nType: GTC / focal / absence\nDuration: \nPostictal duration: \nTongue bitten / incontinence: \nKnown epileptic: usual meds / compliance / triggers\nPrior status: Y / N\nBSL: \nFebrile: ',
    },
    mh: {
      pc: 'Mental health presentation',
      hx: 'Trigger: \nIdeation: passive / active — plan / intent / means\nProtective factors: \nPrior attempts / hospital: \nCurrent meds + compliance: \nSubstance use today: \nSafety assessment: \nMSE: appearance / behaviour / mood / affect / thought / insight',
    },
  };

  /* ------------- STATE ------------- */
  const STORE_KEY = 'vacis-helper-v0.1';
  const state = loadState();

  function loadState() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return defaultState();
  }
  function defaultState() {
    return {
      scope: 'als',
      pc: '', age: '', sex: '', hx: '',
      vssA: {}, vssB: {},
      vssATime: null, vssBTime: null,
      events: [],
      given: [],
      home: [],
      notes: '',
    };
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
  }
  function fmtTime(ts) {
    if (!ts) return '—';
    const d = new Date(ts);
    return d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  /* ------------- BUILD VITAL GRIDS ------------- */
  function buildVssGrid(containerId, side /* 'A' | 'B' */) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    const bag = side === 'A' ? state.vssA : state.vssB;
    for (const v of VITALS) {
      const div = document.createElement('div');
      div.className = 'vital';
      const labelHtml = `<div class="v-label">${v.label}<span class="v-unit">${v.unit}</span></div>`;
      if (v.split) {
        div.innerHTML = labelHtml +
          `<div class="v-row">` +
          v.split.map(s => `<input type="text" inputmode="numeric" data-vid="${v.id}.${s}" placeholder="${s}" value="${bag[v.id + '.' + s] || ''}">`).join('') +
          `</div>`;
      } else {
        div.innerHTML = labelHtml +
          `<input type="text" inputmode="decimal" data-vid="${v.id}" placeholder="—" value="${bag[v.id] || ''}">`;
      }
      container.appendChild(div);
    }
    // bind
    container.querySelectorAll('input[data-vid]').forEach(i => {
      i.addEventListener('input', () => {
        bag[i.dataset.vid] = i.value;
        save(); renderOutput();
      });
    });
  }

  /* ------------- EVENT LIST ------------- */
  function renderEvents() {
    const list = document.getElementById('event-list');
    list.innerHTML = '';
    state.events.forEach((evt, idx) => {
      const row = document.createElement('div');
      row.className = 'event-row';
      row.innerHTML =
        `<input type="text" class="t" value="${evt.t || ''}" placeholder="T+__">` +
        `<input type="text" class="text" value="${(evt.text || '').replace(/"/g,'&quot;')}" placeholder="event / observation / response">` +
        `<button class="del" title="remove">×</button>`;
      row.querySelector('.t').addEventListener('input', e => { evt.t = e.target.value; save(); renderOutput(); });
      row.querySelector('.text').addEventListener('input', e => { evt.text = e.target.value; save(); renderOutput(); });
      row.querySelector('.del').addEventListener('click', () => {
        state.events.splice(idx, 1); save(); renderEvents(); renderOutput();
      });
      list.appendChild(row);
    });
  }

  /* ------------- DRUGS GIVEN ------------- */
  function renderGiven() {
    const list = document.getElementById('given-list');
    list.innerHTML = '';
    state.given.forEach((g, idx) => {
      const row = document.createElement('div');
      row.className = 'given-row';
      row.innerHTML =
        `<input type="text" class="drug" value="${(g.drug || '').replace(/"/g,'&quot;')}" placeholder="drug" list="given-drug-list-${idx}">` +
        `<input type="text" class="dose" value="${(g.dose || '').replace(/"/g,'&quot;')}" placeholder="dose">` +
        `<input type="text" class="route-time" value="${(g.route || '').replace(/"/g,'&quot;')}" placeholder="route + T+__">` +
        `<button class="del" title="remove">×</button>`;
      // simple datalist for drug name completion
      const dl = document.createElement('datalist');
      dl.id = `given-drug-list-${idx}`;
      window.VACIS_MEDS
        .filter(m => m.para === true || (m.para === 'mica' && state.scope === 'mica'))
        .forEach(m => {
          const opt = document.createElement('option');
          opt.value = m.generic;
          dl.appendChild(opt);
        });
      row.appendChild(dl);
      row.querySelector('.drug').addEventListener('input', e => { g.drug = e.target.value; save(); renderOutput(); });
      row.querySelector('.dose').addEventListener('input', e => { g.dose = e.target.value; save(); renderOutput(); });
      row.querySelector('.route-time').addEventListener('input', e => { g.route = e.target.value; save(); renderOutput(); });
      row.querySelector('.del').addEventListener('click', () => { state.given.splice(idx, 1); save(); renderGiven(); renderOutput(); });
      list.appendChild(row);
    });
  }

  /* ------------- HOME MEDS ------------- */
  const searchInput = document.getElementById('med-search');
  const searchResults = document.getElementById('med-results');
  let activeMedIdx = -1;
  let lastResults = [];

  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    if (q.length < 1) { searchResults.classList.remove('open'); searchResults.innerHTML = ''; return; }
    const results = window.VACIS_MEDS.filter(m => {
      if (m.generic.toLowerCase().includes(q)) return true;
      if (m.brand && m.brand.some(b => b.toLowerCase().includes(q))) return true;
      if (m.class && m.class.toLowerCase().includes(q)) return true;
      return false;
    }).slice(0, 20);
    lastResults = results;
    activeMedIdx = -1;
    if (!results.length) {
      searchResults.innerHTML = '<div class="med-result"><span class="generic">no match</span> <span class="brand-list">— add as free text via drug field</span></div>';
      searchResults.classList.add('open');
      return;
    }
    searchResults.innerHTML = results.map((m, i) => `
      <div class="med-result" data-i="${i}">
        <span class="generic">${m.generic}</span>
        ${m.brand ? '<span class="brand-list">· ' + m.brand.join(', ') + '</span>' : ''}
        ${m.para === true ? '<span class="para-flag">para</span>' : ''}
        ${m.para === 'mica' ? '<span class="mica-flag">MICA</span>' : ''}
        <div class="class">${m.class || ''}${m.notes ? ' — ' + m.notes : ''}</div>
      </div>
    `).join('');
    searchResults.classList.add('open');
  });
  searchResults.addEventListener('click', e => {
    const row = e.target.closest('.med-result');
    if (!row) return;
    const i = parseInt(row.dataset.i, 10);
    if (isNaN(i)) return;
    addHomeMed(lastResults[i]);
    searchInput.value = '';
    searchResults.classList.remove('open');
    searchInput.focus();
  });
  searchInput.addEventListener('keydown', e => {
    if (!searchResults.classList.contains('open')) return;
    const rows = searchResults.querySelectorAll('.med-result');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeMedIdx = Math.min(activeMedIdx + 1, rows.length - 1);
      rows.forEach((r, i) => r.classList.toggle('active', i === activeMedIdx));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeMedIdx = Math.max(activeMedIdx - 1, 0);
      rows.forEach((r, i) => r.classList.toggle('active', i === activeMedIdx));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeMedIdx >= 0 && lastResults[activeMedIdx]) {
        addHomeMed(lastResults[activeMedIdx]);
        searchInput.value = '';
        searchResults.classList.remove('open');
      }
    } else if (e.key === 'Escape') {
      searchResults.classList.remove('open');
    }
  });
  // click outside to close
  document.addEventListener('click', e => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.classList.remove('open');
    }
  });

  function addHomeMed(med) {
    state.home.push({ generic: med.generic, brand: med.brand?.[0] || '', class: med.class || '' });
    save(); renderHome(); renderOutput();
  }
  function renderHome() {
    const list = document.getElementById('home-list');
    list.innerHTML = '';
    state.home.forEach((h, idx) => {
      const row = document.createElement('div');
      row.className = 'home-row';
      row.innerHTML = `
        <div class="name">
          ${h.generic}${h.brand ? ' <span class="b">(' + h.brand + ')</span>' : ''}
          ${h.class ? '<span class="c">' + h.class + '</span>' : ''}
        </div>
        <button class="del" title="remove">×</button>
      `;
      row.querySelector('.del').addEventListener('click', () => {
        state.home.splice(idx, 1); save(); renderHome(); renderOutput();
      });
      list.appendChild(row);
    });
  }

  /* ------------- VSS HELPERS ------------- */
  function stamp(side) {
    const now = Date.now();
    if (side === 'a') state.vssATime = now;
    else state.vssBTime = now;
    save();
    document.getElementById('vss-' + side + '-time').textContent = fmtTime(now);
    renderOutput();
  }
  function copyAToB() {
    const a = state.vssA || {};
    state.vssB = { ...a };
    save();
    buildVssGrid('vss-b', 'B');
    renderOutput();
  }

  /* ------------- OUTPUT FORMATTING ------------- */
  function fmtVitals(bag) {
    if (!bag || !Object.keys(bag).length) return '(not recorded)';
    const parts = [];
    if (bag.hr)   parts.push(`HR ${bag.hr}`);
    if (bag.rr)   parts.push(`RR ${bag.rr}`);
    if (bag['bp.sys'] || bag['bp.dia']) parts.push(`BP ${bag['bp.sys'] || '?'}/${bag['bp.dia'] || '?'}`);
    if (bag.spo2) parts.push(`SpO₂ ${bag.spo2}%`);
    if (bag.temp) parts.push(`T ${bag.temp}`);
    if (bag.bgl)  parts.push(`BGL ${bag.bgl}`);
    if (bag['gcs.e'] || bag['gcs.v'] || bag['gcs.m']) {
      const e = bag['gcs.e'] || '?', v = bag['gcs.v'] || '?', m = bag['gcs.m'] || '?';
      const sum = (parseInt(e) || 0) + (parseInt(v) || 0) + (parseInt(m) || 0);
      parts.push(`GCS ${sum > 0 ? sum + '/15 ' : ''}(${e}+${v}+${m})`);
    }
    if (bag['pup.l'] || bag['pup.r']) parts.push(`Pupils L${bag['pup.l'] || '?'} R${bag['pup.r'] || '?'}`);
    if (bag.pain) parts.push(`Pain ${bag.pain}/10`);
    return parts.join(' · ') || '(not recorded)';
  }

  function renderOutput() {
    const lines = [];
    const demo = [];
    if (state.age) demo.push(`${state.age}y`);
    if (state.sex) demo.push(state.sex);
    if (demo.length || state.pc) lines.push(`PT  ${demo.join(' ')}${demo.length && state.pc ? ' · ' : ''}${state.pc}`);
    if (state.hx) lines.push(`HX  ${state.hx.split('\n').filter(l => l.trim()).join(' / ')}`);
    lines.push('');

    lines.push(`VSS scene${state.vssATime ? ' @ ' + fmtTime(state.vssATime) : ''}:  ${fmtVitals(state.vssA)}`);

    if (state.events.length) {
      lines.push('');
      lines.push('Changes/interventions:');
      state.events.forEach(e => {
        if (e.t || e.text) lines.push(`  ${e.t || 'T+?'}  ${e.text || ''}`);
      });
    } else {
      // no events explicit → assume nothing pertinent
      lines.push('  → no clinically significant change between sets unless noted below.');
    }

    if (state.given.length) {
      lines.push('');
      lines.push('Drugs administered:');
      state.given.forEach(g => {
        if (g.drug || g.dose) lines.push(`  ${g.drug || '?'}  ${g.dose || ''}  ${g.route || ''}`.trim());
      });
    }

    lines.push('');
    lines.push(`VSS handoff${state.vssBTime ? ' @ ' + fmtTime(state.vssBTime) : ''}:  ${fmtVitals(state.vssB)}`);

    if (state.home.length) {
      lines.push('');
      lines.push('Regular meds:');
      state.home.forEach(h => {
        lines.push(`  · ${h.generic}${h.brand ? ' (' + h.brand + ')' : ''}${h.class ? ' — ' + h.class : ''}`);
      });
    }

    if (state.notes && state.notes.trim()) {
      lines.push('');
      lines.push('Notes:');
      lines.push(state.notes.split('\n').map(l => '  ' + l).join('\n'));
    }

    document.getElementById('output').textContent = lines.join('\n');
  }

  /* ------------- TOP-LEVEL BINDINGS ------------- */
  // text fields
  ['pc', 'age', 'hx', 'notes'].forEach(id => {
    const el = document.getElementById(id);
    el.value = state[id] || '';
    el.addEventListener('input', () => { state[id] = el.value; save(); renderOutput(); });
  });
  const sexEl = document.getElementById('sex');
  sexEl.value = state.sex || '';
  sexEl.addEventListener('change', () => { state.sex = sexEl.value; save(); renderOutput(); });

  // stamp buttons
  document.querySelectorAll('.stamp-btn').forEach(b => {
    b.addEventListener('click', () => stamp(b.dataset.stamp));
  });
  document.getElementById('copy-prev').addEventListener('click', copyAToB);

  // event/drug add
  document.getElementById('add-evt').addEventListener('click', () => {
    state.events.push({ t: '', text: '' }); save(); renderEvents(); renderOutput();
  });
  document.getElementById('add-given').addEventListener('click', () => {
    state.given.push({ drug: '', dose: '', route: '' }); save(); renderGiven(); renderOutput();
  });

  // templates
  document.querySelectorAll('.tpl').forEach(b => {
    b.addEventListener('click', () => {
      const t = TEMPLATES[b.dataset.tpl];
      if (!t) return;
      if (state.pc && !confirm('Overwrite presenting complaint with template?')) return;
      state.pc = t.pc; state.hx = t.hx;
      document.getElementById('pc').value = t.pc;
      document.getElementById('hx').value = t.hx;
      save(); renderOutput();
    });
  });

  // scope toggle
  const scopeBtn = document.getElementById('scope-toggle');
  function paintScope() {
    scopeBtn.textContent = state.scope === 'mica' ? 'MICA' : 'ALS';
    scopeBtn.classList.toggle('mica', state.scope === 'mica');
    document.querySelector('.brand .badge').textContent = `v0.1 · ${state.scope.toUpperCase()} metro`;
  }
  scopeBtn.addEventListener('click', () => {
    state.scope = state.scope === 'als' ? 'mica' : 'als';
    save(); paintScope(); renderGiven();
  });

  // clear
  document.getElementById('clear-btn').addEventListener('click', () => {
    if (!confirm('Clear all data on this device? (Use this at shift end.)')) return;
    localStorage.removeItem(STORE_KEY);
    Object.assign(state, defaultState());
    initAll();
  });

  // copy
  document.getElementById('export-btn').addEventListener('click', async () => {
    const text = document.getElementById('output').textContent;
    try {
      await navigator.clipboard.writeText(text);
      flash('copied — paste into VACIS ✓');
    } catch (e) {
      flash('copy failed — select & copy manually');
    }
  });

  function flash(msg) {
    const f = document.createElement('div');
    f.className = 'copied-flash';
    f.textContent = msg;
    document.body.appendChild(f);
    setTimeout(() => f.remove(), 1600);
  }

  /* ------------- INIT ------------- */
  function initAll() {
    document.getElementById('pc').value = state.pc || '';
    document.getElementById('age').value = state.age || '';
    document.getElementById('sex').value = state.sex || '';
    document.getElementById('hx').value = state.hx || '';
    document.getElementById('notes').value = state.notes || '';
    document.getElementById('vss-a-time').textContent = fmtTime(state.vssATime);
    document.getElementById('vss-b-time').textContent = fmtTime(state.vssBTime);
    buildVssGrid('vss-a', 'A');
    buildVssGrid('vss-b', 'B');
    renderEvents();
    renderGiven();
    renderHome();
    paintScope();
    renderOutput();
    document.getElementById('meds-date').textContent = window.VACIS_MEDS_DATE + ' (' + window.VACIS_MEDS_COUNT + ' entries)';
  }
  initAll();
})();
