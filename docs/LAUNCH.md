# Launch & Growth Checklist — Football Trivia Games

Practical steps to get the site found, indexed, and gaining traffic. Read the
"expectations" section first so the numbers don't worry you.

---

## 0. Expectations (read this first)

- **A brand-new domain takes weeks-to-months to gain search traffic.** Zero
  clicks/impressions in the first days/weeks is **normal**, not a bug.
- **Indexed ≠ ranking.** Pages can be in Google's index and still get 0
  impressions because they rank on page 5–10 (where nobody looks) until the
  site earns trust.
- **Technical SEO is done** (unique titles, structured data, prerendered pages,
  sitemap). That makes you *eligible* to rank. What makes you *actually* rank is
  **authority = links + real visitors + time.** That's the work below.

---

## 1. Keep the site awake (fixes the sitemap "couldn't fetch")

Render's free tier sleeps after ~15 min idle; the 30–60s cold start makes
Googlebot time out → "couldn't fetch."

- ✅ **GitHub Action** (`.github/workflows/keepalive.yml`) pings the site every
  ~10 min. Trigger it once manually: repo → Actions → "Keep alive" → "Run
  workflow". (GitHub's scheduler can lag, so also do the next step.)
- ⬜ **UptimeRobot** (free, more reliable): https://uptimerobot.com → Add New
  Monitor → HTTP(s) → URL `https://footballtriviagames.onrender.com` →
  interval **5 minutes**. This both keeps it awake and alerts you to downtime.

After it's been awake ~a day, **re-submit the sitemap** (next section) — it
should fetch cleanly.

---

## 2. Google Search Console

1. **Submit the sitemap:** GSC → Sitemaps → enter `sitemap.xml` → Submit.
   (If it still says "couldn't fetch" immediately after, wait a day with the
   keep-alive running, then hit Refresh.)
2. **Request indexing for each page:** GSC → URL Inspection → paste each URL →
   "Request indexing". Do all of them:
   - `https://footballtriviagames.onrender.com/`
   - `/wordle`  ·  `/tictactoe`  ·  `/teammates`  ·  `/career-path`
   - `/world-cup`  ·  `/connections`  ·  `/higher-or-lower`  ·  `/tenable`
3. **Check coverage** over the following weeks: GSC → Pages. You want each game
   URL listed as indexed.

---

## 3. Get traffic & links (the real growth lever)

Google ranks sites that people visit and link to. For a new site this is the
single biggest unlock — more than any code change. Aim for a steady trickle.

- **Reddit** — post the daily puzzles where football fans are: r/soccer (read
  their self-promo rules — usually post in daily threads), r/FantasyPL,
  r/footballmanagergames, country/club subs. Share a *specific* puzzle, not just
  "check out my site".
- **Discord / WhatsApp** — football group chats love daily guessing games;
  Wordle/Connections/Career Path are very shareable.
- **X/Twitter & Threads** — post the day's Connections or "Guess the World Cup"
  with the link; tag football-quiz accounts.
- **Football forums** — BigSoccer, RedCafe, r/soccer-adjacent communities.
- **Friends first** — even 20–50 real visitors + a couple of shares is a strong
  early signal to Google that the site is real and used.

Tip: a **share button** that copies a result grid (like Wordle's) dramatically
increases organic spread — worth adding next.

---

## 4. Switch to a custom domain (recommended, ~$12/yr)

An `onrender.com` subdomain is a shared domain you don't fully own — it carries
less trust and you can't build domain authority the same way. Do this **early**,
before you've built links pointing at the onrender URL.

**Steps (you):**
1. Buy the domain (e.g. Namecheap/Cloudflare/Porkbun).
2. Render dashboard → your service → Settings → Custom Domains → add it; follow
   Render's DNS instructions (a CNAME/ANAME at your registrar).
3. In Google Search Console, **add the new domain as a property and verify it**
   (a new domain = a new verification token — see step 4 below).

**Steps (code — it's centralised):**
1. `src/seo/seoConfig.js` → change `SITE_URL` to the new `https://...` (no
   trailing slash). This cascades to **every** canonical tag, Open Graph/Twitter
   URL, the sitemap, robots.txt and the OG images.
2. `.github/workflows/keepalive.yml` → change `SITE:` to the new domain.
3. Regenerate OG images: `node scripts/og-images.mjs` (the footer URL updates).
4. `index.html` → replace the `google-site-verification` meta with the token GSC
   gives you for the new domain property.
5. Commit, push (Render rebuilds), then in GSC submit the sitemap on the new
   property and request indexing for the new URLs.

That's the whole switch — one real line (`SITE_URL`) drives the SEO; the rest is
verification/hosting plumbing.

---

## 5. Realistic timeline

| When | What to expect |
|------|----------------|
| Week 1 | Indexed but ~0 impressions. Normal. Keep-alive + sharing. |
| Weeks 2–6 | First trickle of impressions on long-tail terms; a few clicks. |
| Months 2–4 | Meaningful impressions if you've earned some links/shares. |
| Ongoing | Rankings climb with backlinks, fresh daily content, and a custom domain. |

SEO for a new site is a slow burn, not a switch. The daily games are a real
advantage here — they give people a reason to come back, which is exactly the
engagement signal Google rewards over time.
