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
  skills, interactive syllabus, instructor, reviews, certificate preview.

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
- Both forms are front-end only — wire `/api` handlers (see
  mendmedicalwear.com's `api/contact.js` pattern) for real submissions.
- Update the canonical URLs when a custom domain is attached.

## Deploy

Git-linked to the `digital-bridge-academy` Vercel project — every push to
`main` deploys automatically.
