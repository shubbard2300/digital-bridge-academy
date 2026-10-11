// Run: node newsletter/selftest.mjs  (checks the pure parts: signing, Pacific time, rendering, issue files)
import fs from 'node:fs';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';

// api/*.js is ESM without a package.json "type", which Vercel handles; Node needs an .mjs copy to import it here.
const tmp = path.join(os.tmpdir(), `bulletin-helpers-${process.pid}.mjs`);
fs.copyFileSync(new URL('../api/_newsletter.js', import.meta.url), tmp);
const { sign, verify, pacificNow, renderIssue, ADDRESS } = await import(tmp);
fs.unlinkSync(tmp);

assert.ok(verify('A@b.co', sign('a@b.co', 's'), 's'), 'case-insensitive signature');
assert.ok(!verify('a@b.co', sign('x@b.co', 's'), 's'), 'wrong email rejected');
assert.ok(!verify('a@b.co', '', 's'), 'empty token rejected');

// 9:00 Pacific on Mon 2026-10-19 is 16:00 UTC (PDT); on Mon 2026-12-07 it is 17:00 UTC (PST).
assert.deepEqual(pacificNow(new Date('2026-10-19T16:00:00Z')), { date: '2026-10-19', weekday: 'Mon', hour: 9 });
assert.deepEqual(pacificNow(new Date('2026-12-07T17:00:00Z')), { date: '2026-12-07', weekday: 'Mon', hour: 9 });
assert.notEqual(pacificNow(new Date('2026-12-07T16:00:00Z')).hour, 9, 'the other cron entry must skip in winter');

const dir = new URL('./issues/', import.meta.url);
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
assert.ok(files.length > 0);
for (const f of files) {
  const date = f.replace('.json', '');
  assert.equal(new Date(date + 'T12:00:00Z').getUTCDay(), 1, `${f} is not a Monday`);
  const issue = JSON.parse(fs.readFileSync(new URL(f, dir), 'utf8'));
  assert.ok(issue.subject && issue.preheader && issue.intro, `${f} missing fields`);
  assert.equal(issue.sections.length, 3, `${f} should have scam, tip and AI sections`);
  const { html, text } = renderIssue(issue);
  assert.ok(html.includes('{{{RESEND_UNSUBSCRIBE_URL}}}') && text.includes('{{{RESEND_UNSUBSCRIBE_URL}}}'), `${f} unsubscribe`);
  assert.ok(html.includes('PO Box 2320') && ADDRESS.includes('97211'), `${f} postal address`);
  assert.ok(!/certif|\$\d/i.test(html), `${f} mentions a certificate or a price`);
}
console.log(`ok: ${files.length} issues, signing and Pacific-time checks passed`);
