// Citation verifier — hits Semantic Scholar's public API (no key required at low volume)
// to check whether a "Author Year" cite is real, similar, or fabricated.
//
// Usage as library:
//   import { verifyCitation, parseRefs } from './scripts/verify-cite.mjs';
//   const refs = parseRefs("Bock Axelsen and Manrubia 2014; Gray et al. 2009");
//   for (const r of refs) console.log(await verifyCitation(r));
//
// Usage as CLI:
//   node scripts/verify-cite.mjs "Bock Axelsen and Manrubia 2014"
//   node scripts/verify-cite.mjs --refs "Smith 2020; Jones et al. 2018"

const CROSSREF       = 'https://api.crossref.org/works';
const POLITE_DELAY_MS = 200;       // Crossref is generous; small delay keeps us in the polite pool
const POLITE_MAILTO   = 'mailto:sparshsharma219@gmail.com';

let lastCallAt = 0;
async function politeFetch(url, init = {}) {
  const wait = Math.max(0, lastCallAt + POLITE_DELAY_MS - Date.now());
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  lastCallAt = Date.now();
  init.headers = { 'User-Agent': 'AkashaPantheon/0.2 (' + POLITE_MAILTO + ')', ...(init.headers || {}) };
  return fetch(url, init);
}

function getYear(item) {
  return item['published-print']?.['date-parts']?.[0]?.[0]
      ?? item['published-online']?.['date-parts']?.[0]?.[0]
      ?? item['published']?.['date-parts']?.[0]?.[0]
      ?? item['issued']?.['date-parts']?.[0]?.[0]
      ?? null;
}
function fullNames(item) {
  return (item.author || []).map(a => ((a.given || '') + ' ' + (a.family || '')).trim().toLowerCase());
}

/**
 * Parse a REFS-string into an array of {author, year, raw} cites.
 * Accepts: "Smith 2020", "Smith et al. 2020", "Smith and Jones 2020",
 *          "Smith, J. (2020)", "Smith & Jones (2020)" etc., separated by ;
 */
export function parseRefs(refsString) {
  if (!refsString || typeof refsString !== 'string') return [];
  const parts = refsString.split(/[;\n]/).map(s => s.trim()).filter(Boolean);
  const out = [];
  for (const part of parts) {
    const clean = part.replace(/^[\s*•\-–]+/, '').trim();
    // anchor on the 4-digit year — everything before it is author, everything after is ignored
    const m = clean.match(/^(.+?)[,\s]*\(?(\d{4})\)?\s*[a-z]?\b/);
    if (m) {
      const author = m[1]
        .replace(/[,.]+$/, '')           // strip trailing punctuation
        .replace(/\s+/g, ' ')            // collapse whitespace
        .trim();
      const year = parseInt(m[2], 10);
      // sanity: author must contain at least one capitalised surname-like token
      if (/[A-Z][a-zA-Z\-']{1,}/.test(author) && year >= 1500 && year <= 2100) {
        out.push({ author, year, raw: clean });
        continue;
      }
    }
    out.push({ author: null, year: null, raw: clean, parseError: true });
  }
  return out;
}

/**
 * Check Semantic Scholar for a paper matching {author, year}.
 * Returns one of:
 *   { status: 'verified', paper, score }     - exact author+year match
 *   { status: 'partial',  paper, score, note } - same author found but different year, or fuzzy match
 *   { status: 'unverified', note }            - nothing matched
 *   { status: 'unparseable', note }           - couldn't parse the ref string
 *   { status: 'api-error', detail }
 */
export async function verifyCitation(cite) {
  if (cite.parseError || !cite.author || !cite.year) {
    return { status: 'unparseable', note: 'could not parse author/year from "' + cite.raw + '"' };
  }
  // Build query: drop "et al.", normalise & to and, search Crossref by author
  const queryAuthor = cite.author.replace(/\bet\s+al\.?/gi, '').replace(/&/g, ' ').replace(/\s+/g, ' ').trim();
  const url = `${CROSSREF}?query.author=${encodeURIComponent(queryAuthor)}&rows=25&select=title,author,published-print,published-online,published,issued,DOI`;

  let res;
  try {
    res = await politeFetch(url);
  } catch (e) {
    return { status: 'api-error', detail: e.message };
  }
  if (!res.ok) {
    return { status: 'api-error', detail: 'Crossref HTTP ' + res.status };
  }
  let j;
  try { j = await res.json(); } catch { return { status: 'api-error', detail: 'invalid JSON from Crossref' }; }
  const items = j.message?.items || [];

  // Tokenise our cite's authors into surname-ish tokens
  const cleanAuthor = cite.author.replace(/\bet\s+al\.?/gi, '').replace(/&/g, 'and');
  const tokens = cleanAuthor
    .split(/\s+and\s+|\s+/i)
    .map(t => t.trim().toLowerCase())
    .filter(t => t.length > 2);

  let bestExact = null, bestPartial = null;

  for (const item of items) {
    const year = getYear(item);
    if (!year) continue;
    const names = fullNames(item);                 // ["holger bock axelsen", ...]
    const concat = names.join(' ');                // "holger bock axelsen ..."
    let hits = 0;
    for (const t of tokens) {
      if (concat.includes(t)) hits++;
    }
    if (hits === 0) continue;

    const yearGap = Math.abs(year - cite.year);
    const tokenRatio = hits / tokens.length;
    const score = tokenRatio - yearGap * 0.05;     // small penalty per year off

    if (tokenRatio >= 0.8 && yearGap === 0) {
      if (!bestExact || score > bestExact.score) bestExact = { item, score, yearGap };
    } else if (tokenRatio >= 0.5) {
      if (!bestPartial || score > bestPartial.score) bestPartial = { item, score, yearGap };
    }
  }

  if (bestExact) {
    return { status: 'verified', paper: summarise(bestExact.item), score: +bestExact.score.toFixed(2) };
  }
  if (bestPartial) {
    const note = bestPartial.yearGap === 0
      ? 'partial author-name match — verify the names manually'
      : `closest match is the same author group but year ${getYear(bestPartial.item)} (you cited ${cite.year}, off by ${bestPartial.yearGap})`;
    return { status: 'partial', paper: summarise(bestPartial.item), score: +bestPartial.score.toFixed(2), note };
  }
  return { status: 'unverified', note: 'no Crossref paper matching ' + queryAuthor + ' ' + cite.year };
}

function summarise(item) {
  return {
    title: Array.isArray(item.title) ? item.title[0] : item.title,
    year: getYear(item),
    authors: (item.author || []).slice(0, 5).map(a => ((a.given || '') + ' ' + (a.family || '')).trim()).join(', '),
    doi: item.DOI || null,
  };
}

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const refsArg = args.includes('--refs') ? args[args.indexOf('--refs') + 1] : args.join(' ');
  if (!refsArg) {
    console.log('Usage: node scripts/verify-cite.mjs "Author Year[; Author Year; ...]"');
    process.exit(1);
  }
  const cites = parseRefs(refsArg);
  console.log(`Parsed ${cites.length} cite(s):`);
  for (const c of cites) {
    console.log('\n  raw:    ' + c.raw);
    if (c.author) console.log('  parsed: ' + c.author + ' (' + c.year + ')');
    const result = await verifyCitation(c);
    console.log('  ' + result.status + (result.note ? '  · ' + result.note : ''));
    if (result.paper) {
      console.log('    title:  ' + result.paper.title);
      console.log('    year:   ' + result.paper.year);
      console.log('    authors:' + result.paper.authors);
      if (result.paper.doi) console.log('    doi:    ' + result.paper.doi);
    }
  }
}
