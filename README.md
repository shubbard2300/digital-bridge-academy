# Digital Bridge Academy

**Empowering Everyday People Through Technology** — Steven J Hubbard LLC

A single-page site for Digital Bridge Academy: practical, patient, personalized
tech coaching covering computer skills fundamentals, internet safety & digital
literacy, AI basics for everyday life, and resume building & job search.

## Stack

- Static HTML/CSS/JS (`index.html`) — no build step
- `api/contact.js` — Vercel serverless function that forwards contact-form
  submissions via [Resend](https://resend.com) (requires the `RESEND_API_KEY`
  environment variable on the Vercel project)

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

The contact form's email send only works when deployed to Vercel with
`RESEND_API_KEY` configured.
