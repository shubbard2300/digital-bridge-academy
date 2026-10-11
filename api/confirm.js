import { verify, resend, SITE } from './_newsletter.js';

const page = (title, msg) => `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#12202e;font:18px/1.6 Arial,sans-serif;color:#fff;text-align:center;padding:24px">
<main style="max-width:460px"><h1 style="font:800 30px Georgia,serif">${title}</h1><p>${msg}</p>
<p><a href="${SITE}/" style="color:#F6C15E">Back to Digital Bridge Academy</a></p></main></body>`;

// Step 2 of double opt-in: a valid signed link adds the person to the Resend segment.
export default async function handler(req, res) {
  const { e, n, t } = req.query || {};
  const secret = process.env.NEWSLETTER_SECRET, segment = process.env.RESEND_SEGMENT_ID;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  if (!secret || !segment || !process.env.RESEND_API_KEY) return res.status(500).send(page('Something went wrong', 'Please email contact@digital-bridge-academy.com and we will add you by hand.'));
  if (!e || !verify(e, t, secret)) return res.status(400).send(page('That link did not work', 'It may be incomplete. Please sign up again from our home page.'));
  const body = { email: String(e).toLowerCase(), unsubscribed: false, segments: [{ id: segment }] };
  if (n) body.first_name = String(n).slice(0, 40);
  const r = await resend('/contacts', body);
  const already = !r.ok && /already|exist/i.test(JSON.stringify(r.data));
  if (!r.ok && !already) {
    console.error('confirm: contact create failed', r.status, r.data);
    return res.status(502).send(page('Something went wrong', 'Please try the link again in a minute, or email contact@digital-bridge-academy.com.'));
  }
  return res.status(200).send(page("You're on the list!", 'Look for The Bridge Bulletin in your inbox every Monday morning.'));
}
