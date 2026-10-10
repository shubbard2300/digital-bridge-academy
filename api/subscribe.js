import { sign, resend, FROM, REPLY_TO, SITE } from './_newsletter.js';

// Step 1 of double opt-in: email a signed confirm link. Nothing is stored until the link is clicked.
// ponytail: no rate limit, so one address can be asked to confirm repeatedly; add a per-IP limit if abused.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { email, name, company } = req.body || {};
  if (company) return res.status(200).json({ ok: true }); // honeypot field, humans never fill it
  const e = String(email || '').trim().toLowerCase();
  if (e.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }
  const secret = process.env.NEWSLETTER_SECRET;
  if (!process.env.RESEND_API_KEY || !secret) return res.status(500).json({ error: 'Email service not configured' });

  const first = String(name || '').trim().split(/\s+/)[0].slice(0, 40);
  const link = `${SITE}/api/confirm?e=${encodeURIComponent(e)}&n=${encodeURIComponent(first)}&t=${sign(e, secret)}`;
  const r = await resend('/emails', {
    from: FROM, to: e, reply_to: REPLY_TO,
    subject: 'One tap to confirm: The Bridge Bulletin',
    text: `Hi${first ? ' ' + first : ''},\n\nThanks for signing up for The Bridge Bulletin: one scam alert, one tip and one AI trick, every Monday morning.\n\nTap to confirm your email address:\n${link}\n\nIf you didn't sign up, ignore this email and nothing will happen.\n\nSteven\nDigital Bridge Academy`,
    html: `<p style="font:17px/1.6 Arial,sans-serif">Hi${first ? ' ' + first : ''},</p><p style="font:17px/1.6 Arial,sans-serif">Thanks for signing up for <strong>The Bridge Bulletin</strong>: one scam alert, one tip and one AI trick, every Monday morning.</p><p><a href="${link}" style="display:inline-block;padding:12px 22px;background:#1F8D82;color:#fff;text-decoration:none;border-radius:8px;font:700 17px Arial,sans-serif">Yes, sign me up</a></p><p style="font:15px/1.5 Arial,sans-serif;color:#55656f">If you didn't sign up, ignore this email and nothing will happen.</p><p style="font:17px Arial,sans-serif">Steven<br>Digital Bridge Academy</p>`,
  });
  if (!r.ok) {
    console.error('subscribe: confirmation email failed', r.status, r.data);
    return res.status(502).json({ error: 'Failed to send confirmation' });
  }
  return res.status(200).json({ ok: true });
}
