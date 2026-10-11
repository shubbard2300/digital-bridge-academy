// Shared helpers for the Bridge Bulletin. The leading underscore keeps this file from being routed.
import crypto from 'node:crypto';

export const SITE = 'https://www.digital-bridge-academy.com';
export const FROM = 'Steven at Digital Bridge Academy <newsletter@digital-bridge-academy.com>';
export const REPLY_TO = 'contact@digital-bridge-academy.com';
export const OWNER = 'contact@digital-bridge-academy.com';
export const ADDRESS = 'PO Box 2320, 630 NE Killingsworth St, Portland, OR 97211, United States';

export const sign = (email, secret) =>
  crypto.createHmac('sha256', secret).update(String(email).toLowerCase()).digest('hex').slice(0, 40);

export function verify(email, token, secret) {
  const a = Buffer.from(sign(email, secret)), b = Buffer.from(String(token || ''));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Date, weekday and hour in Pacific time, so one cron pair covers PST and PDT.
export function pacificNow(d = new Date()) {
  const f = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit',
    weekday: 'short', hour: '2-digit', hour12: false,
  });
  const p = Object.fromEntries(f.formatToParts(d).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, weekday: p.weekday, hour: Number(p.hour) % 24 };
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// issue: { subject, preheader, intro, sections: [{ label, title, paragraphs[], bullets[], prompt, note }] }
// The three sections are themed by position: scam, tip, AI trick. No images, so nothing can be blocked.
const THEMES = [
  { bg: '#FFF3EA', accent: '#B8470C', chip: '#FFE0CC' },
  { bg: '#E7F5F2', accent: '#12766B', chip: '#C9ECE6' },
  { bg: '#EEF0FF', accent: '#4047B5', chip: '#DADEFF' },
];

export function renderIssue(issue, unsubscribeUrl = '{{{RESEND_UNSUBSCRIBE_URL}}}') {
  const navy = '#12202e', teal = '#1F8D82', amber = '#F6C15E', ink = '#1B2B36', mute = '#55656f';
  const sec = (s, i) => {
    const t = THEMES[i % THEMES.length];
    return `
    <tr><td style="background:${t.bg};padding:26px 28px 30px;border-left:6px solid ${t.accent};">
      <span style="display:inline-block;padding:4px 12px;background:${t.chip};border-radius:99px;font:700 12px Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:${t.accent};">${esc(s.label)}</span>
      <h2 style="margin:12px 0 12px;font:800 25px/1.25 Georgia,serif;color:${navy};">${esc(s.title)}</h2>
      ${(s.paragraphs || []).map((p) => `<p style="margin:0 0 14px;font:17px/1.65 Arial,sans-serif;color:${ink};">${esc(p)}</p>`).join('')}
      ${s.prompt ? `<div style="margin:0 0 14px;padding:14px 16px;background:#ffffff;border-left:4px solid ${t.accent};border-radius:6px;font:16px/1.55 Arial,sans-serif;color:${ink};"><strong style="color:${t.accent};">Try typing:</strong> ${esc(s.prompt)}</div>` : ''}
      ${s.bullets?.length ? `<ul style="margin:0 0 14px;padding-left:22px;font:17px/1.65 Arial,sans-serif;color:${ink};">${s.bullets.map((b) => `<li style="margin-bottom:8px;">${esc(b)}</li>`).join('')}</ul>` : ''}
      ${s.note ? `<p style="margin:0;font:15px/1.55 Arial,sans-serif;color:${mute};">${esc(s.note)}</p>` : ''}
    </td></tr>
    <tr><td style="height:6px;font-size:0;line-height:0;">&nbsp;</td></tr>`;
  };
  const html = `<!doctype html><html><body style="margin:0;background:#E9EFEE;">
  <div style="display:none;max-height:0;overflow:hidden;">${esc(issue.preheader || '')}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:20px 10px;">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;">
    <tr><td style="background:${navy};padding:24px 28px 20px;border-bottom:4px solid ${amber};">
      <div style="font:800 28px Georgia,serif;color:#ffffff;">The Bridge Bulletin</div>
      <div style="margin-top:4px;font:14px Arial,sans-serif;color:#9fd8d1;">Digital Bridge Academy &middot; Start Your Week Smarter</div>
    </td></tr>
    <tr><td style="padding:26px 28px 24px;font:19px/1.6 Georgia,serif;color:${ink};">${esc(issue.intro)}</td></tr>
    ${issue.sections.map(sec).join('')}
    <tr><td style="padding:28px;background:${navy};text-align:center;">
      <div style="font:800 22px Georgia,serif;color:#ffffff;">Want someone beside you while you learn?</div>
      <p style="margin:10px 0 18px;font:16px/1.55 Arial,sans-serif;color:#cfe3e0;">Our free intro workshop runs every Saturday for 90 minutes. Bring your device and your questions.</p>
      <a href="${SITE}/#book" style="display:inline-block;padding:14px 28px;background:${amber};color:${navy};text-decoration:none;border-radius:8px;font:800 17px Arial,sans-serif;">Save a free seat</a>
    </td></tr>
    <tr><td style="padding:24px 28px 8px;font:17px Arial,sans-serif;color:${ink};">Steven<br><span style="color:${mute};font-size:14px;">Digital Bridge Academy</span></td></tr>
    <tr><td style="padding:18px 28px;background:#F4F7F6;font:13px/1.55 Arial,sans-serif;color:${mute};">
      You're getting this because you signed up at digital-bridge-academy.com. Just reply to this email if you have a question.<br>
      Digital Bridge Academy, ${esc(ADDRESS)}<br>
      <a href="${unsubscribeUrl}" style="color:${mute};">Unsubscribe</a>
    </td></tr>
  </table></td></tr></table></body></html>`;
  const text = [
    'THE BRIDGE BULLETIN · Digital Bridge Academy · Start Your Week Smarter', '', issue.intro, '',
    ...issue.sections.flatMap((s) => [
      s.label.toUpperCase() + ': ' + s.title,
      ...(s.paragraphs || []),
      ...(s.prompt ? ['Try typing: ' + s.prompt] : []),
      ...(s.bullets || []).map((b) => '- ' + b),
      ...(s.note ? [s.note] : []), '',
    ]),
    `Free intro workshop every Saturday, 90 minutes. Save a free seat: ${SITE}/#book`, '', 'Steven', 'Digital Bridge Academy',
    '', `Digital Bridge Academy, ${ADDRESS}`, `Unsubscribe: ${unsubscribeUrl}`,
  ].join('\n');
  return { html, text };
}

export async function resend(path, body, method = 'POST') {
  const r = await fetch('https://api.resend.com' + path, {
    method,
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, data };
}
