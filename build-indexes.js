#!/usr/bin/env node
/*
 * build-indexes.js
 * ----------------------------------------------------------------------------
 * Generiert automatisch:
 *   content/stories-index.json   aus allen .md  in content/stories/
 *   content/trips-index.json     aus allen .json in content/trips/
 *
 * Damit muss niemand mehr die Index-Dateien von Hand pflegen. Neue Beitraege,
 * die ueber das CMS angelegt werden, erscheinen automatisch auf der Website.
 *
 * Laeuft ohne externe Pakete (nur Node-Standard). Wird von Cloudflare Pages
 * beim Deploy ausgefuehrt (Build command: "node build-indexes.js").
 *
 * Lokal testen:  node build-indexes.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const STORIES_DIR = path.join(ROOT, 'content', 'stories');
const TRIPS_DIR = path.join(ROOT, 'content', 'trips');
const STORIES_INDEX = path.join(ROOT, 'content', 'stories-index.json');
const TRIPS_INDEX = path.join(ROOT, 'content', 'trips-index.json');

// --- Minimaler Frontmatter-Parser (kein YAML-Paket noetig) ------------------
// Liest nur die einfachen "key: value"-Zeilen aus dem ---...----Block.
function readFrontmatterField(raw, field) {
  const m = raw.match(/^---\s*([\s\S]*?)\s*---/);
  if (!m) return null;
  const block = m[1];
  const lines = block.split('\n');
  for (const line of lines) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    if (key !== field) continue;
    let val = line.slice(idx + 1).trim();
    // Anfuehrungszeichen entfernen
    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    return val;
  }
  return null;
}

// --- Stories ----------------------------------------------------------------
function buildStoriesIndex() {
  if (!fs.existsSync(STORIES_DIR)) {
    console.warn('[stories] Ordner fehlt, ueberspringe:', STORIES_DIR);
    return;
  }
  const files = fs.readdirSync(STORIES_DIR)
    .filter(f => f.toLowerCase().endsWith('.md'));

  const items = files.map(file => {
    const slug = file.replace(/\.md$/i, '');
    const raw = fs.readFileSync(path.join(STORIES_DIR, file), 'utf8');
    const date = readFrontmatterField(raw, 'date') || '';
    return { slug, date };
  });

  // Neueste zuerst (die Website sortiert zwar selbst, aber so ist der Index
  // auch fuer Menschen lesbar sinnvoll geordnet).
  items.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const out = { items };
  fs.writeFileSync(STORIES_INDEX, JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log(`[stories] ${items.length} Beitraege -> ${path.relative(ROOT, STORIES_INDEX)}`);
}

// --- Trips ------------------------------------------------------------------
function buildTripsIndex() {
  if (!fs.existsSync(TRIPS_DIR)) {
    console.warn('[trips] Ordner fehlt, ueberspringe:', TRIPS_DIR);
    return;
  }
  const files = fs.readdirSync(TRIPS_DIR)
    .filter(f => f.toLowerCase().endsWith('.json'));

  const items = files.map(file => {
    const slug = file.replace(/\.json$/i, '');
    let date = '';
    let highlight = false;
    let highlightOrder = null;
    try {
      const data = JSON.parse(fs.readFileSync(path.join(TRIPS_DIR, file), 'utf8'));
      date = data.date || '';
      // Pin-Felder liegen seit dem CMS-Umbau unter data.pin.*. Aeltere Reisen
      // haben sie noch flach auf data.*. Beide Strukturen unterstuetzen:
      const pin = (data && data.pin && typeof data.pin === 'object') ? data.pin : null;
      const hi = pin && pin.highlight !== undefined ? pin.highlight : data.highlight;
      const ho = pin && typeof pin.highlight_order === 'number' ? pin.highlight_order
               : (typeof data.highlight_order === 'number' ? data.highlight_order : null);
      highlight = hi === true;
      if (typeof ho === 'number') highlightOrder = ho;
    } catch (e) {
      console.warn(`[trips] ${file} ist kein gueltiges JSON, nehme es trotzdem auf.`);
    }
    return { slug, date, highlight, highlightOrder };
  });

  // Sortierung:
  //   1) Angepinnte Reisen zuerst, in ihrer Pin-Reihenfolge (highlight_order).
  //      Bei gleicher Pin-Reihenfolge entscheidet das Datum (neueste zuerst).
  //   2) Danach alle uebrigen nach Datum, neueste zuerst.
  items.sort((a, b) => {
    if (a.highlight && !b.highlight) return -1;
    if (!a.highlight && b.highlight) return 1;
    if (a.highlight && b.highlight) {
      const ao = a.highlightOrder != null ? a.highlightOrder : 9999;
      const bo = b.highlightOrder != null ? b.highlightOrder : 9999;
      if (ao !== bo) return ao - bo;
    }
    // Datum: neueste zuerst
    return (b.date || '').localeCompare(a.date || '');
  });

  // Index schreiben. "order" laufend vergeben, damit die Website die Reihenfolge
  // 1:1 uebernimmt. "highlight" mitschreiben, falls die Website es spaeter nutzen will.
  const cleaned = items.map((it, i) => ({
    slug: it.slug,
    order: i + 1,
    highlight: it.highlight,
  }));

  const out = { items: cleaned };
  fs.writeFileSync(TRIPS_INDEX, JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log(`[trips] ${cleaned.length} Reisen -> ${path.relative(ROOT, TRIPS_INDEX)}`);
}

// --- Los ---------------------------------------------------------------------
try {
  buildStoriesIndex();
  buildTripsIndex();
  console.log('Indizes erfolgreich generiert.');
} catch (err) {
  console.error('Fehler beim Generieren der Indizes:', err);
  process.exit(1);
}
