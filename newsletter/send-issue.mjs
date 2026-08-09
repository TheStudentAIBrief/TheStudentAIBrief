// Send a Student AI Brief issue to the subscriber list via Resend.
// Zero-dependency: needs Node 18+ (global fetch). Run from repo root.
//
//   node newsletter/send-issue.mjs <issue-slug> [--dry-run]
//
// Reads config from env (see newsletter/README.md):
//   RESEND_API_KEY   required to actually send (omit + --dry-run to preview)
//   FROM_EMAIL       e.g. "The Student AI Brief <hello@thestudentaibrief.com>"
//   REPLY_TO         optional reply-to address
//   SITE_BASE_URL    e.g. "https://thestudentaibrief.com" (no trailing slash)
//   SUBSCRIBERS      CSV *content* (from a GitHub secret), OR
//   SUBSCRIBERS_PATH path to a local subscribers.csv (for local runs)
//   UNSUBSCRIBE_EMAIL address for the List-Unsubscribe header
//
// Email is a lightweight teaser that links to the full web issue — the heavy
// canvas/nav page is never mailed. Exits non-zero if any send fails.

import { readFile } from 'node:fs/promises';
import path from 'node:path';

const BRAND = {
  black: '#0A0A0A', card: '#141414', border: '#1E1E1E',
  gold: '#C9A84C', goldLight: '#E2C06A', white: '#F5F2EC', muted: '#888880',
};

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const slug = args.find((a) => !a.startsWith('--'));

if (!slug) {
  console.error('Usage: node newsletter/send-issue.mjs <issue-slug> [--dry-run]');
  process.exit(2);
}

const SITE_BASE_URL = (process.env.SITE_BASE_URL || 'https://thestudentaibrief.com').replace(/\/$/, '');
const FROM_EMAIL = process.env.FROM_EMAIL || 'The Student AI Brief <hello@thestudentaibrief.com>';
const REPLY_TO = process.env.REPLY_TO || '';
const UNSUBSCRIBE_EMAIL = process.env.UNSUBSCRIBE_EMAIL || 'hello@thestudentaibrief.com';

// ---- helpers ----
const stripTags = (s) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const decode = (s) =>
  s.replace(/&amp;/g, '&').replace(/&minus;/g, '−').replace(/&nbsp;/g, ' ')
   .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));

function extract(html, re) {
  const m = html.match(re);
  return m ? decode(stripTags(m[1])) : '';
}

async function loadSubscribers() {
  let csv = process.env.SUBSCRIBERS;
  if (!csv && process.env.SUBSCRIBERS_PATH) csv = await readFile(process.env.SUBSCRIBERS_PATH, 'utf8');
  if (!csv) throw new Error('No subscribers: set SUBSCRIBERS (csv content) or SUBSCRIBERS_PATH.');
  const lines = csv.trim().split(/\r?\n/);
  const header = lines[0].toLowerCase().includes('email') ? lines.shift() : null;
  void header;
  return lines
    .map((l) => l.split(',')[0].trim())
    .filter((e) => /.+@.+\..+/.test(e));
}

function buildEmailHtml({ headline, dek, category, issueUrl, unsubUrl }) {
  // Table-based, inline styles, web-safe font fallbacks — email-client safe.
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<meta name="color-scheme" content="dark light"></head>
<body style="margin:0;padding:0;background:${BRAND.black};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.black};">
<tr><td align="center" style="padding:32px 16px;">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${BRAND.card};border:1px solid ${BRAND.border};">
    <tr><td style="padding:28px 36px 0;font-family:'DM Mono',Menlo,Consolas,monospace;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${BRAND.gold};">The Student AI Brief${category ? ' &nbsp;·&nbsp; ' + category : ''}</td></tr>
    <tr><td style="padding:18px 36px 0;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.15;font-weight:700;color:${BRAND.white};">${headline}</td></tr>
    ${dek ? `<tr><td style="padding:16px 36px 0;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:${BRAND.muted};">${dek}</td></tr>` : ''}
    <tr><td style="padding:28px 36px 34px;">
      <a href="${issueUrl}" style="display:inline-block;background:${BRAND.gold};color:${BRAND.black};font-family:Helvetica,Arial,sans-serif;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;text-decoration:none;padding:14px 28px;">Read the full issue &rarr;</a>
    </td></tr>
    <tr><td style="padding:22px 36px;border-top:1px solid ${BRAND.border};font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:${BRAND.muted};">
      The Student AI Brief · One AI tool, one prompt, three quick wins.<br>
      <a href="${unsubUrl}" style="color:${BRAND.muted};text-decoration:underline;">Unsubscribe</a>
    </td></tr>
  </table>
</td></tr></table></body></html>`;
}

async function sendOne(to, subject, html, unsubUrl) {
  const body = {
    from: FROM_EMAIL, to: [to], subject, html,
    headers: { 'List-Unsubscribe': `<${unsubUrl}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
  };
  if (REPLY_TO) body.reply_to = REPLY_TO;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

async function main() {
  const issuePath = path.join(process.cwd(), 'issues', `${slug}.html`);
  const html = await readFile(issuePath, 'utf8');

  const rawTitle = extract(html, /<title>([\s\S]*?)<\/title>/i);
  const subject = rawTitle.split('·')[0].trim() || rawTitle || 'The Student AI Brief';
  const headline = extract(html, /<h1[^>]*class="title"[^>]*>([\s\S]*?)<\/h1>/i) || subject;
  const dek = extract(html, /<p[^>]*class="dek"[^>]*>([\s\S]*?)<\/p>/i);
  const category = (extract(html, /<p[^>]*class="eyebrow"[^>]*>([\s\S]*?)<\/p>/i).split('·').pop() || '').trim();
  const issueUrl = `${SITE_BASE_URL}/issues/${slug}.html`;
  const unsubUrl = `mailto:${UNSUBSCRIBE_EMAIL}?subject=unsubscribe`;

  const emailHtml = buildEmailHtml({ headline, dek, category, issueUrl, unsubUrl });
  const subs = await loadSubscribers();

  console.log(`Issue: ${slug}`);
  console.log(`Subject: ${subject}`);
  console.log(`Web URL: ${issueUrl}`);
  console.log(`Recipients: ${subs.length}`);

  if (dryRun) {
    const { writeFile } = await import('node:fs/promises');
    const out = path.join(process.cwd(), 'newsletter', 'preview.html');
    await writeFile(out, emailHtml);
    console.log(`\nDRY RUN — no emails sent. Preview written to ${out}`);
    return;
  }
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY not set (and not --dry-run).');

  const failures = [];
  for (const to of subs) {
    try {
      await sendOne(to, subject, emailHtml, unsubUrl);
      console.log(`  sent  ${to}`);
    } catch (e) {
      console.error(`  FAIL  ${to}  ${e.message}`);
      failures.push(to);
    }
  }
  console.log(`\nDone. ${subs.length - failures.length}/${subs.length} sent.`);
  if (failures.length) { console.error(`Failed: ${failures.join(', ')}`); process.exit(1); }
}

main().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
