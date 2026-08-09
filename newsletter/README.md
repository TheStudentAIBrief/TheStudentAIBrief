# Newsletter sending (Beehiiv replacement)

Sends an issue to subscribers via [Resend](https://resend.com). The email is a
lightweight branded teaser linking to the full web issue on this site.

## How a send works
1. New issue lives at `issues/<slug>.html` (as today).
2. GitHub → **Actions** → **Send newsletter issue** → **Run workflow** → type the slug → Run.
3. It runs `newsletter/send-issue.mjs` on GitHub's servers and mails the list via Resend.

No laptop, no browser automation. The Resend API returns real success/failure per recipient.

## Local preview (no send)
```bash
SUBSCRIBERS_PATH="C:/Users/theol/hybrid-automation-engine/ai-operating-system/data/subscribers.csv" \
  node newsletter/send-issue.mjs mcp-explained --dry-run
```
Writes `newsletter/preview.html` — open it to see the email.

## ⚠️ Subscriber list is PII — never commit it
The 29-subscriber CSV lives privately at
`C:\Users\theol\hybrid-automation-engine\ai-operating-system\data\subscribers.csv`.
It is injected into the Action as the **`SUBSCRIBERS_CSV`** secret, not committed here.

---

## One-time setup — THE STEPS THAT ARE YOURS (Theo)

1. **Resend account + domain** — at resend.com, add domain `thestudentaibrief.com`
   and add the DKIM/SPF/DMARC DNS records it shows you (this needs you to control
   the domain's DNS). Without this, mail hits spam. Create an API key.

2. **GitHub → repo Settings → Secrets and variables → Actions:**
   - Secret **`RESEND_API_KEY`** = your Resend key
   - Secret **`SUBSCRIBERS_CSV`** = paste the full contents of the private subscribers.csv
   - Variable **`FROM_EMAIL`** = `The Student AI Brief <hello@thestudentaibrief.com>`
   - Variable **`SITE_BASE_URL`** = `https://thestudentaibrief.com` (or your github.io base)
   - Variable **`UNSUBSCRIBE_EMAIL`** = `hello@thestudentaibrief.com`
   - Variable **`REPLY_TO`** (optional) = a monitored inbox

3. **Commit + push** these files (`newsletter/`, `.github/workflows/`) to the repo.

Then a send is one button in the Actions tab.

## Later upgrades (not needed for 29 subs)
- Move to Resend **Audiences/Broadcasts** for hosted unsubscribe + open tracking.
- Add a real signup form on the site (static page needs a form backend) to replace
  the Beehiiv subscribe links still in the page headers/CTAs.
