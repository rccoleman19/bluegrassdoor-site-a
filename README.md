# Bluegrass Commercial Door & More website

Static website for Bluegrass Commercial Door & More, 930 Gordon Avenue, Bowling Green, KY 42101 · 270-780-3235.

This repository is the public website. There is one homepage. The door builder is a step on that page, reached from the homepage. It is not a separate page.

- `index.html`: the page (homepage, services, about, reviews, projects, door builder, service area, contact)
- `styles.css`: mobile-first styles (brand navy #0033A0, Barlow / Barlow Condensed)
- `app.js`: menu, call bar, the door builder (steps → finished doors → quote request → saved for the office), shared build links (`#build=`), help chat, photo lightbox
- `builder-rules.js`: hardware compatibility rules (one list; edit it to change what the builder allows, adds, renames or notes)
- `door-spec.js`: door catalog, the spec wording used on the page and in the saved request, and the link format (base64url JSON)
- `door-preview.js` / `door-preview.css`: door drawings (live beside the steps on desktop, and on each finished door)
- `door-visualize.js` / `door-visualize.css`: optional "See it on your building" step (the photo never leaves the visitor's device)
- `request.html` / `request.js` / `request.css`: a saved quote as the office sees it, drawn from its own link (`request.html#b=...` or `?b=...`). A link with no request returns to the homepage. It is not another homepage.
- `images/`: company photos and logo

Quote requests are saved to the office's Supabase table `quote_requests` (project `bluegrassdoor`) with a plain `fetch` and the public publishable key; the website can add requests but never read them. Each saved request emails the office through the `notify-quote` function.

The help chat sends typed questions to the Supabase Edge Function `chat` (same public key; the function only answers this site's origin, rate-limits visitors and returns plain text). Its replies are shown as plain text with any HTML, markdown and links to other websites removed. When the function has no answer (`{"fallback":true}`), fails or takes longer than 8 seconds, the chat uses its scripted answers. The topic buttons always use the scripted answers.

(The database setup, the email function and the chat function are kept outside this repository.)

Run it locally with `python3 -m http.server` in this folder, then open http://localhost:8000.
