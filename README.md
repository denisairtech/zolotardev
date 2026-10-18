# Denis Air Tech — site mockup (NOT published)

Static one-page site: HTML + CSS + a little JS. No build step. Ready for GitHub Pages (open `index.html`).

## Change the studio name (brand)
Edit **`assets/js/config.js`** → `brand: { he, ru, en }` (one line per language).
The logo is text: the monogram square uses the brand's initials automatically
(or set `monogram: "XY"`). All texts use `{brand}` from there.
Optional, for search engines / no-JS: run `node tools/prerender-he.js` to copy the
new Hebrew texts into `index.html`. Also update `assets/img/favicon.svg` (currently "Z").

## Contacts, privacy link
Also in `assets/js/config.js` (`contact`, `privacyUrl`).

## Texts
`assets/js/i18n.js` — Hebrew / Russian / English, same keys.

## Fonts
Heebo (Hebrew + Latin subsets, OFL) bundled in `assets/fonts/`. Heebo has no Cyrillic,
so Russian uses Rubik Cyrillic (same font as the ClimaSnap app, OFL).

## Language
Switch in header; remembered in localStorage; direct links: `?lang=ru`, `?lang=en`.

## Contact form
No backend: builds a ready message and opens WhatsApp (wa.me) or the mail app (mailto). Nothing is stored.

## Mockup screenshots
`mockup/` (rendered with headless Chrome by `tools/shoot.js`). Not needed for the live site.

## Note about this repository
This repo contains a text-only build (made by tools/build-dist.py in the working copy): images are SVG files with the picture embedded, fonts are embedded in assets/css/fonts.css, and the promo video is stored as base64 text and decoded in the browser.
