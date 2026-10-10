# Digital Bridge Academy

Premium multi-page marketing site for Digital Bridge Academy — patient,
human-first digital skills training: everyday tech confidence, online safety,
job-ready computer skills, and AI for beginners.

## Pages

- `index.html` — homepage: hero (particles, floating cards, parallax), stats,
  audience, course cards, journey timeline, digital-confidence quiz, AI teaser,
  testimonials carousel, workshop countdown, FAQ, contact + newsletter.
- `ai.html` — AI for Everyone: capability grid, tabbed prompt examples,
  before/after comparisons.
- `courses/*.html` — three course pages (generated from a shared template):
  skills, interactive syllabus, instructor, reviews.

## Tech

Static site — **no build step**. Vanilla HTML/CSS/JS.
Dark/light theme (system default + persisted toggle), scroll reveals,
tooltips, WCAG-minded (skip link, focus states, ARIA labels,
`prefers-reduced-motion`), JSON-LD structured data (Organization, FAQPage,
Course), sitemap + robots.

## ⚠️ Placeholder content — replace before real launch

- **Testimonials/reviews are illustrative placeholders**, not real quotes.
  Replace with genuine student feedback (with permission) before promoting.
- Session counts, durations, and "device provided" logistics are draft copy.
- Pricing is intentionally unstated ("launch cohort" framing).
- Forms (contact, newsletter, booking) POST to `/api/contact` (Resend →
  contact@digital-bridge-academy.com). **Requires the `RESEND_API_KEY` environment
  variable on the Vercel project** — without it submissions show the
  graceful error fallback with a direct email address.
- The booking widget is a styled placeholder: requests are emailed and
  confirmed by hand. Swap in a Cal.com/Calendly embed for real-time
  scheduling later.
- Update the canonical URLs when a custom domain is attached.

## Run locally

Git-linked to the `digital-bridge-academy` Vercel project — every push to
`main` deploys automatically.

## The Bridge Bulletin (weekly newsletter)

- **Sign-up:** the home page box posts to `/api/subscribe`, which emails a signed confirm link (double opt-in). `/api/confirm` adds the person to the Resend segment. Nothing is stored before the click.
- **Issues:** one file per Monday in `newsletter/issues/YYYY-MM-DD.json` (subject, preheader, intro, and three sections: scam, tip, AI trick). Add files ahead of time; a file named for a date that is not a Monday never sends.
- **Sending:** Vercel cron hits `/api/send-newsletter` at 16:00 and 17:00 UTC on Mondays. Only the run that lands on 9am Pacific sends, so it is right in both PST and PDT. If no file exists for that date, nothing is sent and the owner gets an email.
- **Test:** `GET /api/send-newsletter?test=1&issue=YYYY-MM-DD` with `Authorization: Bearer $CRON_SECRET` sends that issue to the owner only.
- **Env vars (Vercel):** `RESEND_API_KEY` (full access, not send-only), `RESEND_SEGMENT_ID`, `NEWSLETTER_SECRET` (any long random string), `CRON_SECRET` (any long random string). Resend must have `digital-bridge-academy.com` verified as a sending domain.
- **Self-check:** `node newsletter/selftest.mjs`

