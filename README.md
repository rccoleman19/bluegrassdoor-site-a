# Bluegrass Commercial Door & More website

Static website for Bluegrass Commercial Door & More, 930 Gordon Avenue, Bowling Green, KY 42101 · 270-780-3235.

- `index.html`: all page content (services, about, reviews, projects, door builder, service area, contact/quote)
- `styles.css`: mobile-first styles (brand navy #0033A0, Barlow / Barlow Condensed)
- `app.js`: mobile menu, sticky call bar, door builder → quote form, quote form (validates, then opens a pre-filled email to sonya@bluegrassdoor.com), help chat, photo lightbox
- `builder-rules.js`: door builder hardware compatibility rules (one list; edit it to change what the builder allows, adds, renames or notes)
- `door-preview.js` / `door-preview.css`: live door drawing beside the builder on desktop
- `images/`: company photos and logo

Run it locally with `python3 -m http.server` in this folder, then open http://localhost:8000.
