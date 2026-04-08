# Captio Maps — Chrome Extension

One-line description: Chrome extension that scrapes business leads from Google Maps and exports them to CSV, targeted at Spanish-speaking LatAm market.

**Status:** In development — planning complete, building MVP.

## Overview

A Chrome extension that extracts business data from Google Maps search results (name, category, rating, address) and exports it as a CSV file. The primary goal is learning the full Chrome extension development and publishing cycle, and acquiring real users. Monetization is not a priority in this first stage.

Target market: Spanish-speaking LatAm first. If it gains traction, expand to Portuguese (Brazil) and then English.

## Key Assets

- Technical plan: complete (see `CLAUDE.md` for full implementation details)
- Stack decision: Vanilla JS + Manifest V3, no build step
- Scope defined: Google Maps list-view scraping only, CSV export, UI in Spanish

## Next Steps

- Build the extension (new session, dedicated project directory)
- Test end-to-end: scraping, scroll loop, CSV export
- Prepare Chrome Web Store assets (screenshots, description, privacy policy)
- Publish to Chrome Web Store (start as unlisted for beta testing)
- Share with personal network for first feedback
- Seed in LatAm entrepreneur and marketing communities

## Key Dates / Deadlines

No hard deadline. Goal: published on Chrome Web Store before end of Q2 2026.

## Notes

The technical risk is DOM selector fragility: Google Maps regularly changes its class names. The mitigation is declaring all selectors in a single `SELECTORS` object in `content.js` so fixes are localized to one place.

V2 features (not in MVP): phone and website scraping (requires opening each result individually), Google Sheets export (requires OAuth), support for other data sources (LinkedIn, directories).
