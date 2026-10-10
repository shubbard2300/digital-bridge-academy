import fs from 'node:fs';
import path from 'node:path';
import { pacificNow, renderIssue, resend, FROM, REPLY_TO, OWNER, SITE } from './_newsletter.js';

// Runs from two Vercel cron entries (16:00 and 17:00 UTC, Mondays). Only the one that lands on
// 9am Pacific goes through, which handles daylight saving without any date maths in the cron.
// Sends the issue file named for today's Pacific date. No file means no send, plus an alert to the owner.
export default async function handler(req, res) {
  const cron = process.env.CRON_SECRET;
  if (!cron || req.headers.authorization !== `Bearer ${cron}`) return res.status(401).json({ error: 'Unauthorized' });
  if (!process.env.RESEND_API_KEY) return res.status(500).json({ error: 'Email service not configured' });

  const now = pacificNow();
  const test = req.query?.test === '1'; // sends today's (or ?issue=YYYY-MM-DD) issue to the owner only
  if (!test && !(now.weekday === 'Mon' && now.hour === 9)) return res.status(200).json({ skipped: 'not Monday 9am Pacific', now });

  const date = (test && /^\d{4}-\d{2}-\d{2}$/.test(req.query.issue || '')) ? req.query.issue : now.date;
  const alert = (subject, text) => resend('/emails', { from: FROM, to: OWNER, subject, text });
  let issue;
  try {
    issue = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'newsletter', 'issues', `${date}.json`), 'utf8'));
  } catch (_) {
    await alert(`Bridge Bulletin: no issue for ${date}`, `Nothing was sent. Add newsletter/issues/${date}.json to the repo and send it by hand if you still want it out today.`);
    return res.status(200).json({ skipped: `no issue file for ${date}` });
  }

  if (test) {
    const { html, text } = renderIssue(issue, `${SITE}/`);
    const r = await resend('/emails', { from: FROM, to: OWNER, reply_to: REPLY_TO, subject: `[TEST] ${issue.subject}`, html, text });
    return res.status(r.ok ? 200 : 502).json({ test: true, date, ok: r.ok, status: r.status, data: r.data });
  }

  const segment = process.env.RESEND_SEGMENT_ID;
  if (!segment) { await alert('Bridge Bulletin: not sent', 'RESEND_SEGMENT_ID is not set in Vercel.'); return res.status(500).json({ error: 'No segment' }); }
  const name = `bulletin-${date}`;
  const existing = await resend('/broadcasts', null, 'GET'); // guards against a double send if cron fires twice
  if (existing.ok && JSON.stringify(existing.data).includes(`"${name}"`)) return res.status(200).json({ skipped: 'already sent', name });

  const { html, text } = renderIssue(issue);
  const r = await resend('/broadcasts', { segment_id: segment, from: FROM, reply_to: REPLY_TO, subject: issue.subject, html, text, name, send: true });
  if (!r.ok) {
    await alert(`Bridge Bulletin: send FAILED for ${date}`, `Resend answered ${r.status}: ${JSON.stringify(r.data)}`);
    return res.status(502).json({ error: 'Send failed', status: r.status, data: r.data });
  }
  return res.status(200).json({ sent: name, id: r.data?.id });
}
