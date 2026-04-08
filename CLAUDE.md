# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Chrome extension (Manifest V3) that scrapes business leads from Google Maps list view and exports them to CSV. Vanilla JS, no build step, no npm, no frameworks. The folder is loaded directly into Chrome in developer mode.

Target users: Spanish-speaking LatAm market. UI language: Spanish.

## Loading the Extension (no build step)

1. `chrome://extensions` → enable "Modo de desarrollador"
2. "Cargar descomprimida" → select this folder
3. Reload after changes:
   - `content.js` / `background.js`: click reload icon in `chrome://extensions`, then reload the Maps tab
   - `popup.js` / `popup.html`: close and reopen popup
   - `manifest.json`: reload in `chrome://extensions`

**Debugging:**
- `popup.js`: right-click extension icon → "Inspeccionar popup"
- `content.js`: Maps tab → F12 → Sources → find content script
- `background.js`: `chrome://extensions` → click "Service Worker"

## Message Architecture (MV3 constraint)

In MV3, `content.js` cannot communicate directly with the popup. All messages must relay through `background.js`:

```
popup.js  ──→  chrome.tabs.sendMessage  ──→  content.js
                                               │
                                          chrome.runtime.sendMessage
                                               │
                                     background.js (relay + storage)
                                               │
                                          chrome.runtime.sendMessage  ──→  popup.js
```

`background.js` also persists state to `chrome.storage.local` so the popup can read it on open.

## DOM Selector Strategy (critical)

Google Maps uses obfuscated class names that change periodically. All selectors must be declared in a single `SELECTORS` object at the top of `content.js`:

```javascript
const SELECTORS = {
  feed: 'div[role="feed"]',         // stable ARIA attribute
  card: 'a[href*="/maps/place/"]',  // stable structural selector
  name: '.qBF1Pd',                  // verify in DevTools — will break
  rating: 'span.MW4etd',            // verify in DevTools — will break
  reviews: 'span.UY7F9',            // verify in DevTools — will break
  category: '.W4Efsd span:first-child',
  address: '.W4Efsd span:last-child',
};
```

Prefer ARIA attributes and structural selectors over class names. When class-based selectors break, the fix is changing one constant.

## Scroll Loop

The results panel is a virtualized list — only visible cards exist in the DOM. Scroll the panel container, not the window:

```javascript
const feed = document.querySelector(SELECTORS.feed);
feed.scrollTop += 800;
await sleep(1500); // wait for DOM update
```

The scroll loop must detect when no new results appear and stop.

## CSV Export

Always include UTF-8 BOM (`\uFEFF`) so Excel on Windows renders accented characters and ñ correctly:

```javascript
const csv = '\uFEFF' + [headers.join(','), ...rows].join('\n');
```

## MVP Scope

**In scope:** name, category, rating, review count, address, Maps URL, date. List-view only.

**Out of scope (V2+):** phone/website (requires opening each result detail), Google Sheets export (requires OAuth), filters, accounts, cloud sync.

## Build Order

Since no source files exist yet, the recommended order is:

1. `manifest.json`
2. Placeholder icons (solid color squares work for development)
3. `content.js` — `extractLeadsFromDOM()` only first; test selectors in DevTools console on a Maps tab
4. `background.js` — minimal message relay
5. `popup.html` + `popup.css` — static HTML with all states, no JS yet
6. Wire messaging: `content.js` → `background.js` → `popup.js`
7. Add scroll loop to `content.js`
8. Add `chrome.storage.local` persistence
9. Add CSV export to `popup.js`
10. End-to-end test
11. Polish: Spanish strings, error states, edge cases
12. Prepare Web Store assets and publish

## Web Store Package

```bash
zip -r captio-maps.zip . \
  -x "*.DS_Store" \
  -x ".git/*" \
  -x ".claude/*" \
  -x ".gitignore" \
  -x "CLAUDE.md" \
  -x "README.md" \
  -x "COMPETITIVE-ANALYSIS.md" \
  -x "docs/*" \
  -x "privacy-policy.html"
```

Required assets: icon 128×128 PNG, ≥1 screenshot (1280×800 or 640×400), short description (max 132 chars), privacy policy (required because `storage` + `activeTab` are declared — host on GitHub Pages or public Notion).
