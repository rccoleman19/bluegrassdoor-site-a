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

## Visitor tracking

`track.js` is loaded on the homepage, shop, flagpoles, start, and quote-link pages. Each event is kept in `window.dataLayer` and `window.BGD_EVENTS` with `step` and `t`, so one browser tab has an ordered path. The same row is added to the Supabase table `site_events` on project `bluegrassdoor`.

The table matches the quote inbox rule: the public site can add a row and cannot read, change, or delete rows. Row Level Security allows an insert for the `anon` role only. There is no select policy for that role. The row has no name, phone, email, address, or notes column. A database trigger drops those keys if a request still sends them. Nothing on this table sends email.

The write uses the same public publishable key as the quote form. To point the script somewhere else, set `window.BGD_TRACK` before `track.js` runs (`url`, `key`, and an optional `posthogKey`).

Events: `page_view`, `click`, `tel_click`, `mailto_click`, `scroll_depth`, `section_enter`, `hover`, `focus`, `form_focus`, `quote_submit`, `quote_submit_ok`, `quote_submit_fail`, `chat_open`, `chat_close`, `chat_send`, `quote_add`, `gallery_open`, `engage`, `page_leave`.

A visitor's name, phone, email, address, company, and notes are never copied into an event. A phone or email click is counted as `tel_click` or `mailto_click` without the number or address. The page path is the pathname only, so a saved quote link's query string and hash stay out of the event.

### How to read the visits

Open the Supabase SQL editor for project `bluegrassdoor` (the same project that holds `quote_requests`) and run `visit-queries.sql`. That file answers, for the last 30 days:

- top paths through the site
- pages with no page view
- clicks by control
- sections with no entry
- median time on a page, and the engage marks
- pages where a visit ends
- the quote steps from a page view to a saved request
- how often Dory is opened and then sent a message

`visit-review.html` is a short note with the same directions. It is not in the menu, and it does not show visitor rows. The SQL editor is where the numbers come from. The table starts empty until someone visits the site.

Run it locally with `python3 -m http.server` in this folder, then open http://localhost:8000.
