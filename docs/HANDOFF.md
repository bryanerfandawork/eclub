# EClub: Handoff Document

This document is self-contained, so a new Claude session (or a developer) can pick up the work without reading the earlier conversations. Last updated: 21 November 2026 (handover to Ridha's own Claude account).

> **Important:** this repository is **public**. Never commit secrets (API keys, tokens, passwords, service role key) or personal data such as emails. Secrets belong only in Vercel > Settings > Environment Variables.

---

## 1. Working with the owner (Ridha)

- Ridha (the founder, called "Bryan" in the brief) is a **complete beginner**. They only know what "domain" and "hosting" mean.
- Always reply in **simple Indonesian**, **one step at a time**, with exact clicks ("klik Settings > Domains > Add").
- Explain each technical piece with a shop analogy:
  - domain = the shop's address (alamat toko)
  - Vercel = the shop building (bangunan toko)
  - GitHub = the filing cabinet for recipes, i.e. the code (lemari arsip resep)
  - Supabase = the warehouse plus guest book, i.e. data and accounts (gudang + buku tamu)
  - RLS = a locker key for each person (kunci loker per orang)
  - Claude = the builder (tukang)
- Standing mandate: Claude decides the build order and keeps going until the app is done. Only stop for steps that need Ridha's own hands, such as running SQL, signing up for services, or filling in keys.
- Save credits and money: use free tiers and cheap models.
- The UI/UX must feel **premium**.
- Never ask Ridha to paste secrets into the chat. Guide them to paste secrets straight into Vercel.

## 2. Product vision and positioning

**EClub, a Personal Growth Companion.** Tagline: *Find Your Path. Build Your Success.* Philosophy: *"Entrepreneurnya dulu, bisnis hanya kendaraan."* (The entrepreneur first; the business is only the vehicle.)

**The core story ("spark"):** research shows many business owners are stuck or declining. The cause is usually not access to capital or difficulty with marketing. It is that they have lost their **spark**, their passion for life. EClub helps them light that spark again by **bringing their dreams (cita-cita) back to the surface**.

**The method: Sustainable Entrepreneur Framework (SEF).** It must be prominent everywhere. Every class and tool follows these steps, in order and level by level:

| Start | Phase | Learning step |
|---|---|---|
| **Spark** (dreams, definition of success, values) | | |
| | Survive | 1. Personal Mapping · 2. Acquisition |
| | Sustain | 3. Systemation |
| | Scale Up | 4. Transformation |
| | Spread Up | 5. Investation |

Source of truth in code: `src/lib/sef.ts` (SPARK, SEF_PHASES, SEF_STEPS). The journey in `src/lib/journey.ts` is built from it.

**Onboarding "Cek Posisi"** (`/posisi`, logic in `src/lib/placement.ts`):
- New members are sent straight to `/posisi` after signing up, to answer 10 questions.
- Low spark score (average < 3.5): placed at **Spark**, then pointed to My Life, Dream Planner, and Personal Mapping classes.
- Otherwise: placed at the earliest of three signals: current situation, biggest challenge, and the first SEF step that is still weak. Each placement recommends a matching class, tool, or mentoring session.
- Results are stored in `assessment_results` with key `cek-posisi`. The dashboard shows the member's current stage.

**Honest conversion (an agreed principle):**
- No fake scarcity, no countdown timers, no made-up testimonials.
- Testimonials are entered by the admin and only appear once real ones exist.
- Pricing is anchored to the annual plan, with the savings shown.
- Upgrade prompts appear at natural limits (when a member hits a quota or after a result).
- Habit loops: streak milestones at 3/7/14/21/30 days.
- The free tier must be genuinely useful.
- The AI Companion helps fully and never holds back an answer to upsell mentoring.

## 3. Brand

- Logo: white "EClub" wordmark on deep maroon. Ridha uploads the real logos in Admin > Pengaturan > Logo EClub (done); fallback file `public/brand/eclub-logo-original.png`, component `src/components/logo.tsx`.
- Primary colour **#8B2220** (maroon / brick red). Accent: gold #C6A15B. Background: paper #FAF7F5. Tokens live in `src/app/globals.css` (`@theme`).
- Font: Plus Jakarta Sans.

## 4. Stack, accounts and where each thing is configured (no secrets)

All accounts below belong to Ridha (GitHub account `bryanerfandawork`). The old Claude account was Ridha's spouse's; work continues in Ridha's own Claude account (see section 10).

| Piece | Details | Where to configure |
|---|---|---|
| Code | Next.js 15.5 (App Router, server actions), TypeScript, Tailwind v4 | this repo |
| Repo | github.com/bryanerfandawork/eclub (**public**). Every push to `main` auto-deploys to Vercel. | GitHub |
| Hosting | Vercel **Hobby** (free, non-commercial only: must move to **Pro** before selling). Live: https://www.eclub.co.id and https://eclub-five.vercel.app. Two daily crons (`vercel.json`): `0 0 * * *` = 07:00 WIB `/api/cron/daily`, and `0 12 * * *` = 19:00 WIB `/api/cron/evening` (Hobby runs each once a day, at some minute within that hour). | vercel.com > project eclub > Settings |
| Database / auth / storage | Supabase project `uvkqbwtlnbdcpbreijwr` (Tokyo, free). Storage bucket `assets` (QRIS, logos). | supabase.com > SQL Editor, Authentication, Storage |
| Auth URLs | Site URL `https://www.eclub.co.id`; Redirect URLs `https://www.eclub.co.id/**`, `https://eclub.co.id/**`, plus the vercel.app entry. Done. | Supabase > Authentication > URL Configuration |
| Email (SMTP) | **Resend** as custom SMTP, sender "EClub Indonesia" `noreply@eclub.co.id`. 5 Indonesian templates in `supabase/email-templates/` (confirm signup, reset password, magic link, change email, invite) pasted into Supabase. Header logo uses `https://www.eclub.co.id/api/brand/logo?v=dark`. Done and tested. | resend.com (domain eclub.co.id verified) + Supabase > Authentication > SMTP Settings / Email Templates |
| Domain + DNS | `eclub.co.id` at **Rumahweb**; the cPanel DNS zone is authoritative. Records: `A @ 216.198.79.1` (Vercel), `CNAME www` to Vercel's `...vercel-dns.com` target, `A mail 202.10.43.163`, `MX` to `mail.eclub.co.id` (business email), the records Resend asked for (`resend._domainkey` TXT and the `send` records). **Do not touch other mail records or nameservers.** | Rumahweb client area > cPanel > Zone Editor |
| WhatsApp | **Fonnte**, live. Transactional only (orders, birthday, renewal, mentoring/event, affiliate). Admin WA number is stored in `app_settings.admin_whatsapp`. | fonnte.com (device token) + Admin > Pengaturan ("Kirim pesan uji") |
| Phone push | Web Push (`web-push`). VAPID keys auto-generated on first use and stored in table `push_secrets` (service role only). No env var needed. Live. | Admin > Notifikasi |
| Payments | **Manual mode** (live): QRIS + bank transfer + "Konfirmasi via WhatsApp", admin clicks "Tandai lunas". Moota code exists but is **paused**; a payment gateway (e.g. Xendit/Midtrans) is planned. Interface: `src/lib/payments/types.ts`. | Admin > Pengaturan (QRIS, bank accounts, payment mode) |
| AI | Anthropic API, model `claude-haiku-5-5`, effort low. **Not active yet** (needs SQL 008 + key). The AI button is hidden from members until the key exists. | console.anthropic.com + Vercel env |

**Vercel environment variables (names only, never put values in the repo or chat):**

| Name | Status | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | set | app connects to Supabase (missing = demo mode) |
| `SUPABASE_SERVICE_ROLE_KEY` | set | cron, push, webhooks (server only) |
| `FONNTE_TOKEN` | set | WhatsApp |
| `CRON_SECRET` | set | protects `/api/cron/daily` (Vercel Cron sends it) |
| `RESEND_API_KEY` | **not set yet** (added 22 Nov) | order emails (created / paid / cancelled) via Resend API, `src/lib/email.ts`; skipped silently if missing |
| `ANTHROPIC_API_KEY` | **not set** | AI Companion |
| `MOOTA_WEBHOOK_SECRET` | not set (Moota paused) | Moota webhook |
| `NEXT_PUBLIC_SITE_URL` | optional | defaults to https://www.eclub.co.id |

After changing env variables, **Redeploy** in Vercel.

**Prices and business rules (21 Nov 2026, editable in Admin > Pengaturan):** Plus Rp79.000/month or Rp690.000/year; Laporan Lengkap DISC Rp49.000 (included in Plus); mentoring 1-on-1 Rp399.000 (Plus Rp299.000); affiliate commission 20% of product price, coupon discount 10%, commission hold 7 days, referral window 12 months, payout in multiples of Rp100.000. Free plan limits live in `plan_features` (Admin > Pengaturan).

**People and contacts:** super admin is Ridha's own account (role set in `profiles`). Business email and admin WhatsApp are stored in `app_settings` / known to Ridha; they are intentionally not written in this public repo.

**Content seeded:** event "Gathering Member EClub Indonesia" Yogyakarta, 1 Des 2026, Gade Space Lempuyangan, Rp50.000 (time 13:00 WIB is a guess, confirm with Ridha); 8 SEF courses / 44 reading lessons with literature (videos still to be added by Ridha); 12 articles (8 free, 4 Plus); 365 morning push messages.

## 5. Features built

- Auth: sign up, sign in, email confirmation (`/auth/callback`). Mobile shell with bottom navigation, desktop sidebar. PWA (manifest, service worker, offline page) plus a mobile "add to home screen" prompt (`src/components/install-prompt.tsx`).
- Dashboard: greeting with the morning motivation, journey card, "Cek Posisi" call to action, push reminder card, 8 Wheel retest reminder after 3 months.
- **My Journey**: map of Spark plus the 5 SEF steps.
- **Cek Posisi** onboarding (see section 2).
- **My Life**: definition of success, values, vision, priorities, plus a printable document.
- **DISC personality test** (replaced Wheel of Life on 21 Nov 2026 at Ridha's request; the old `/wheel-of-life` page and data still exist, just unlinked):
  - Source: Ridha's Excel `Tes_DISC.xlsx`, a 24-item forced choice (most / least).
  - `src/lib/disc/data.ts` is auto-generated from the Excel: statements, answer key, conversion tables, 55 graph codes, 24 type descriptions.
  - Scoring is in `src/lib/disc/score.ts`. Graph I = Most (Adapted), Graph II = Least (Natural).
  - Verified identical to the Excel via LibreOffice recalculation. Where the Excel returns #N/A for a graph code, the app falls back to the closest code (matching the top 2 factors, then the top 1).
  - DISC statements, the 24 type names (EClub names such as "Sang Penjamin Mutu" with a tagline) and all type descriptions were rewritten by EClub (21 Nov 2026) with the same meaning. Internal type keys (e.g. "Analyzer #7"), scoring keys, conversion tables, and option order are unchanged, so old results still resolve.
  - Free: both graphs, dominant style, meaning of each letter, key strengths.
  - Paid "Laporan Lengkap DISC" (price set in `app_settings.disc_report_price`, now Rp49.000 one-time, included in Plus; unlocks live in `report_unlocks`):
    - from the Excel: ways to be more effective, tendencies, stress triggers, fears
    - written by EClub in `src/lib/disc/insights.ts`: career recommendations, business ideas, motivators, communication tips, blind spots, growth steps, SEF tie-in
  - Results are stored in `assessment_results` with key `disc` and are fed into the AI context.
- **8 Wheel Entrepreneur**: 40-statement Likert questionnaire covering 8 dimensions (vision, mindset, resilience, opportunity, market, money, systems, networks). Scored on the server. Retest every 90 days. This is an EClub draft and has not been validated. Content is in `src/lib/assessments/eight-wheel.ts`.
- **Dream Planner**: dreams become a target amount and date, with action steps (the free plan allows 1 dream).
- **Daily Action** and **My Progress**: daily actions, streak with milestones, 7-day chart.
- **Learning Center (LMS)**:
  - Courses and lessons use unlisted YouTube embeds (youtube-nocookie).
  - Access is set per course or lesson: public, member, Plus, or paid.
  - Access is checked in the database by the `can_watch` function, and video IDs are kept in the `lesson_videos` table, which only returns a video the member may watch.
  - Classes are grouped by SEF step and **unlock level by level**: a step opens only after every class in the previous step is finished. This lock is enforced in the app only, not in the database. Admins bypass it.
- **Plans**: Free vs EClub Plus.
  - Limits come from the `plan_features` table (null = unlimited, 0 = locked) and are edited in Admin.
  - Prices are set in `app_settings`.
  - Purchase pages are `/paket` and `/beli/*`. `/pesanan/[id]` shows the unique transfer amount for an order.
- **Moota payments** (code ready, paused):
  - Each order gets a unique code (+1 to 499 added to the price).
  - Webhook: `/api/payments/moota` checks an HMAC of the request, then calls `apply_bank_mutation`, which calls `fulfill_order`.
  - The signature header format has not been verified against Moota yet, so it needs a real test.
- **Super Admin** (`/admin`):
  - Ringkasan: stats and AI cost estimate.
  - Pengguna: change plan and role.
  - Course: CRUD, lessons, SEF step, grant access.
  - Pesanan: mark as paid or cancel.
  - Mentoring & Event: open slots, create events, see bookings/attendees.
  - Affiliate: payout requests and top affiliates.
  - Pengaturan (was Paket & Fitur): WhatsApp key status + test, QRIS upload, prices, payment mode, admin WA, bank accounts, affiliate rate / coupon % / hold days / months, renewal reminder days, daily WA cap, motivation toggle, plan limits.
  - Testimoni.
- **AI Companion** (gold ✨ button):
  - Streams replies through `/api/ai/chat`.
  - Remembers the last 10 messages.
  - With the member's consent (checkbox), it reads their profile, My Life, dreams, Wheel of Life, 8 Wheel results, and SEF position.
  - Daily quota from `plan_features.ai_messages` (Free 5, Plus 50).
  - Logs tokens in `ai_messages`.
  - The system prompt is in `src/lib/ai.ts`.
- **Manual payment** (current mode, `app_settings.payment_mode = manual`; Moota is on hold):
  - The order page shows QRIS (uploaded in Admin > Paket & Fitur, stored in the Supabase `assets` bucket), the bank accounts, and a green "Konfirmasi via WhatsApp" button. The button opens wa.me to `admin_whatsapp` with the order code, product, and amount.
  - The admin then clicks "Tandai lunas" in Admin > Pesanan.
  - WhatsApp messages at each transaction step (`src/lib/whatsapp.ts`):
    - order created: sent to the buyer and the admin
    - unpaid for more than 3 hours: reminder via the daily cron
    - paid: sent to the buyer
    - cancelled: sent to the buyer
  - Transaction messages only need a saved WhatsApp number; the daily-reminder opt-in is not required. The order page asks for the number if it is missing.
  - The bank accounts and admin WhatsApp number are stored in `app_settings`, never in the repo.
- **Keuangan (finance)** — `/keuangan`, migration 012 + 013:
  - Two wallets, Pribadi and Usaha (`fin_transactions`, balances via `fin_balances()`), so personal and business money never mix.
  - Floating "Catat" bottom sheet (`src/components/finance/quick-add.tsx`): Pengeluaran / Pemasukan / Pindah dana, emoji categories (`src/lib/finance.ts`), Hari ini / Kemarin / date, optional note.
  - Transfers: "Gaji diri sendiri" (business→personal) and "Tambah modal" (personal→business). A hint nudges owners who have not paid themselves this month.
  - Month summary, "Ke mana uang pergi?" top categories, history with two-tap delete, dashboard card.
  - Stage 2: `/keuangan/hpp` HPP calculator (free to use; saving products in `fin_products` is Plus-only, enforced by RLS) and `/keuangan/laba-rugi` profit & loss (Plus; free users see a blurred preview). P&L rules: revenue = penjualan/jasa/lain, HPP = bahan, cicilan and owner draws are shown "di luar laba rugi".
  - Not built yet (stage 3): balance sheet, cash-flow statement, budgets, AI reading the finances.
- **Affiliate + kupon** — `/affiliate`, `/admin/affiliate`, migration 013:
  - Only active Plus members (or staff) earn. Each gets `profiles.ref_code`, used both as the link `/?ref=CODE` and as a personal coupon code.
  - Link: middleware stores `eclub_ref` cookie (30 days); `signUp` puts it in user metadata; trigger `capture_referral` on `auth.users` fills `referrals`.
  - Coupon: on `/pesanan/[id]` the buyer enters a code (prefilled from the cookie); `apply_coupon` gives `coupon_discount`% off (default 10) and sets `orders.coupon_referrer`.
  - Commission: trigger `affiliate_on_paid` on orders → `affiliate_commissions` at `affiliate_rate`% (default 20) of the product price, coupon owner first, else the referrer (within `affiliate_months`, default 12). Withdrawable after `affiliate_hold_days` (default 7). No self-referral.
  - Payouts: `request_payout` in multiples of Rp100.000; admin transfers manually and clicks "Sudah ditransfer"/"Tolak". WhatsApp notices for new commission, payout request (admin) and result (member).
- **Mentoring 1-on-1** — `/mentoring`, admin `/admin/jadwal`: admin opens slots (several times per date, normal price + Plus price, meet link). Members pick a day/time and write what to discuss. Free slots confirm instantly; paid ones create an order (`orders.product='mentoring'`, `ref_id`=slot) and confirm when paid (trigger `orders_fulfill_items`). Meet link only visible to the confirmed booker.
- **Event & webinar** — `/event`: price + Plus price, capacity, meet link, recording link (visible to registrants and Plus). Same order flow (`product='event'`).
- **Kebiasaan & Syukur** — `/kebiasaan`: habit tracker with streaks and 7-day dots (`habits`, `habit_logs`; free 3 habits via `plan_features.habits`), gratitude journal with mood (`gratitude_entries`).
- **Sertifikat SEF** — `/sertifikat`: when every lesson of a SEF step is done, `claim_certificate` issues a certificate (`EC-XXXXXXXX`), printable landscape. Public check page `/cek-sertifikat`.
- **Komunitas** — `/komunitas`: circles Semua/Survive/Sustain/Scale Up/Spread Up, post types (Cerita, Kemenangan, Tanya, Insight), comments, "🔥 Semangat" likes, admin pin/delete, author name + Plus badge stamped by trigger, 10 posts/day limit.
- **UX**: mobile "Menu" button opens a grid of every page; thin top progress bar on link clicks (`nav-progress.tsx`) and an instant skeleton (`(app)/loading.tsx`); habit/like buttons react on press (`pending-button.tsx`).
- **Customer journey (migration 014)**: Cek Posisi (`/posisi`) -> Target Harian (`/target`: dream amount + years -> savings per day -> units per day per product from HPP/price, compared to 30-day business profit, add to Daily Action, course/mentoring recommendation for the SEF step). Free users can save 3 HPP products. Goal detail shows per-day amount with a link to `/target`.
- **Profile bio (014)**: WhatsApp, birth date, province + regency selects (`src/lib/regions.ts`, 38 provinces / 514 regencies from idn-area-data). Cron sends a birthday WhatsApp with the `birthday_promo` text (Admin > Pengaturan). Events have `regency` + `location`; ticking "kabari kota" in Admin > Mentoring & Event sends WhatsApp to members in that regency (`notifyEventCity`).
- **Onboarding `/lengkapi`**: right after signup (and after email confirmation) users fill WhatsApp, birth date, province, regency in one step, then go to Cek Posisi. Existing users with missing data are redirected there on any app page: the `(app)` layout redirects every non-admin with missing WA/birth date/regency to `/lengkapi` (mandatory, no skip; page lives outside the `(app)` group).
- **Kolaborasi (014)**: public in-house training / workshop / speaker / partner form on the landing page (`submit_inquiry`, anon, rate-limited) -> Admin > Kolaborasi, admin gets a WhatsApp.
- **Artikel (015)**: public `/artikel` + `/artikel/[slug]` (SEO, funnel CTA). Plus articles show a paywall; body only returned by `get_article()` to Plus/staff. Admin > Artikel for CRUD (simple text format: `## ` headings, `- ` bullets, `1. ` numbers).
- **Motivasi pagi**: `src/lib/motivation.ts` holds 365 lines, one per day of year (29 Feb repeats 28 Feb), looping yearly; sent as a phone push notification (Web Push) by the 07:00 cron and shown on the dashboard. The morning WA reminder was removed; WA is now transactional only (orders, birthday, renewal, mentoring/event).
- **Notifikasi HP (016)**: `src/lib/push.ts` (web-push). VAPID keys are generated on first use and stored in `push_secrets` (service role only), so no env var is needed. Mandatory onboarding step `/aktifkan-notifikasi` after `/lengkapi` (layout redirects non-admins with zero push_subscriptions; unsupported/denied/iPhone-not-installed may continue via cookie `eclub_push_skip`, 30 days, and get a dashboard reminder). Toggle also in Profile. iPhone needs Add to Home Screen + iOS 16.4+. Admin > Notifikasi: morning on/off + title, send now or schedule for a date's 07:00 run (audience all/Plus/free, province/regency), optional replace-morning. Send time is fixed at 07:00 WIB because Vercel Hobby allows one daily cron.
- **Logo dari admin**: Admin > Pengaturan > Logo EClub uploads `logo_url` (light bg), `logo_dark_url` (maroon bg), `icon_url` (square, favicon/PWA/manifest) to the `assets` bucket. `BrandProvider` in the root layout feeds `Logo`/`LogoMark`. Stable URL for emails: `/api/brand/logo?v=dark|light|icon` (302 to the uploaded file or the default).
- **Legal & SEO**: `/kebijakan-privasi`, `/syarat-ketentuan` (contact from admin_whatsapp setting), consent line on signup, `robots.ts`, `sitemap.ts` (includes articles).
- AI Companion button is hidden from members while ANTHROPIC_API_KEY is missing (admins still see it).
- **Landing page** (`src/app/page.tsx`): funnel order: hero (CTA Cek Posisi) -> pains -> dream calculator lead magnet (`DreamCalc`, no login) -> philosophy -> 12 features -> SEF map -> 4-step journey -> testimonials (real only) -> pricing + table -> classes/mentoring -> nearest events (`public_events`, anon) -> affiliate -> kolaborasi form -> FAQ -> CTA.

- **WhatsApp (Fonnte), transactional only**: order created (buyer + admin), unpaid > 3 hours reminder, paid, cancelled, birthday promo, Plus renewal (`renewal_days`, default 7,3,1, plus day after expiry), mentoring/event reminders within 24h, affiliate notices, event city announcements. Sent by actions and the 07:00 cron (`/api/cron/daily`, cap `wa_daily_max`), logged in `notification_log`.
- **Order page (22 Nov)**: QRIS download button; bank accounts parsed from `app_settings.bank_accounts` (one per line "BANK number a.n. holder", `src/lib/banks.ts`) and shown per bank with a coloured bank badge and a copy button. Buyer always gets WA + email info on "Beli" (also when an unpaid order is reused); admin WA only for new orders.
- **Blasting (22 Nov, SQL 018)**: Admin > Blasting sends email (Resend batch API) or WhatsApp (Fonnte queue: many targets per request, `delay` "8-20" random, max 300 per blast) to a filtered audience. Filters: plan, age range, province/regency, joined within N days, inactive N days (auth last_sign_in_at), each test sudah/belum (from `assessment_results`, new test keys appear automatically), any course / a specific course started-completed-not, and "sudah/belum" for **every public table with a `user_id` column** (auto-discovered by `admin_blast_features`, labels in `FEATURE_LABELS` in `src/lib/blast.ts`, unknown tables fall back to the table name), plus "pending order". Consent: WA only to `wa_opt_in`, email skips `email_opt_out`; emails carry an HMAC unsubscribe link to `/berhenti-email`. `{nama}` personalises. Preview count, test send, history in `blasts`.
- **Admin > Pengguna (22 Nov)**: search (name/email/WA), sort (newest, oldest, recently active, longest inactive, name, email, Plus first), pages of 50, "last active" (greatest of `last_seen_at` and last sign-in) with a green/gold/grey dot, Excel export (`/api/admin/users-export`, exceljs, follows search + sort), and **delete account** (super admin only, type the email to confirm, cannot delete self or another super admin; uses `auth.admin.deleteUser`, which cascades all the member's data including orders). Falls back to the old list until SQL 018 is run.
- **Evening pushes (22 Nov)**: `/api/cron/evening` at 19:00 WIB. Active 0-2 days and no daily action done today: rotating line from `EVENING` in `src/lib/nudges.ts` (50 lines). Inactive exactly 3, 5, 7, 14, 21, 30 days (then every 30 days up to 180): `WINBACK` lines. Max one evening push per person. Toggles `push_evening`, `push_winback` in Admin > Notifikasi.
- **Learn + Home (22 Nov)**: `/learn` opens with jump chips and swipeable rails (`src/components/rail.tsx`): Kelas SEF (sorted by step, locked ones greyed), Artikel, Event & webinar, Mentoring slots, then the full SEF course map below (`#peta`). Dashboard shows the nearest upcoming event card right under the greeting.
- **Auth extras**: forgot password (`/lupa-sandi`) and set new password (`/atur-sandi`).

## 6. Database migrations (run by Ridha in Supabase > SQL Editor)

All files are in `supabase/`. **Everything is run except `008_ai_companion.sql` and `018_blasting_users.sql`.**

| File | Content | Status |
|---|---|---|
| `schema.sql` | base tables, profiles, RLS | ✅ |
| `002_wheel_daily.sql` | wheel of life (legacy), daily actions | ✅ |
| `003_my_life.sql` | My Life | ✅ |
| `004_assessments_admin.sql` | assessments, admin RPCs (+ super admin SQL) | ✅ |
| `005_lms.sql` | courses, lessons, `can_watch`, `lesson_videos` | ✅ |
| `006_payments.sql` | orders, products, `fulfill_order`, `payment_events` | ✅ |
| `007_testimonials_sef.sql` | testimonials, `courses.sef_step` | ✅ |
| `008_ai_companion.sql` | AI chat log + quota | ⏳ **not run** (run together with setting `ANTHROPIC_API_KEY`) |
| `009_whatsapp.sql` | WA columns on profiles, `notification_log` | ✅ |
| `010_disc.sql` | DISC report unlocks | ✅ |
| `011_manual_payment.sql` | manual payment settings | ✅ |
| `012_finance.sql` | Keuangan wallets | ✅ |
| `013_growth_pack.sql` | HPP products, affiliate/coupons, mentoring, events, habits, gratitude, certificates, community, prices | ✅ |
| `014_journey_profile.sql` | profile bio, birthday promo, event city, kolaborasi form | ✅ |
| `015_event_courses_articles.sql` | Gathering event, 8 courses/44 lessons, articles | ✅ |
| `016_push.sql` | push subscriptions/secrets/broadcasts | ✅ |
| `017_service_role_grants.sql` | grants for service_role + default privileges | ✅ |
| `018_blasting_users.sql` | `blasts` history, `profiles.email_opt_out`, RPCs `admin_blast_features/feature_users/tests/courses`; `profiles.last_seen_at` + `touch_last_seen()` (called by the app layout), `admin_users(search, sort, dir, lim, off)` | ⏳ **not run yet** (added 22 Nov) |

New migrations go in `supabase/018_*.sql` and onward. Every migration must include explicit `GRANT` statements (to `authenticated`, `anon` where needed, and `service_role`), because "Grant API access" was unchecked when the project was created. Seed inserts should be idempotent (`on conflict do nothing`).

**Security model:**
- RLS is enabled on every table.
- Column-level grants on `profiles`, so users cannot change their own role or plan.
- Admin operations go through `SECURITY DEFINER` RPCs that check `is_staff()` (`require_admin`, `admin_*`).
- Orders cannot be marked paid by the buyer; only admin or webhook.
- `is_staff()` and `has_plus()` helpers.

## 7. Status before launch

**Done:** domain + DNS, Supabase URLs, Resend SMTP + templates, Fonnte WhatsApp, phone push, QRIS + bank accounts, logos uploaded, legal pages, DISC fully rewritten in EClub wording, all SQL except 008.

**Still open (Ridha decided to do these later):**
1. **Vercel Pro** (about $20/month). Hobby is for non-commercial use only, so upgrade before taking real payments.
2. **Payment gateway** (automatic verification). Moota is paused; candidates Xendit or Midtrans. Add a provider in `src/lib/payments/` following `types.ts`, plus a webhook route like `/api/payments/moota`.
3. **AI Companion**: run `008_ai_companion.sql`, then at console.anthropic.com top up ~$5, set a monthly spend limit, create a key, put it in Vercel as `ANTHROPIC_API_KEY`, Redeploy.
4. Smaller items: real end-to-end purchase test with a new account; Ridha to review the legal pages; add course videos (unlisted YouTube); confirm the Gathering time.

## 8. Known limits and backlog

**Known limits:**
- Morning push is fixed at 07:00 WIB (Vercel Hobby allows one daily cron; Pro allows more).
- iPhone push only works after "Add to Home Screen" on iOS 16.4+. Incognito and some browsers cannot receive push; those users may skip the step (cookie, 30 days).
- The SEF level lock for courses is enforced in the app only, not the database.
- The 8 Wheel Entrepreneur and Cek Posisi are EClub drafts, not validated instruments.
- Unlisted YouTube videos can be shared by anyone who has the link.
- Supabase free tier pauses after ~7 days with no activity (not an issue once live) and has no daily backups; consider Supabase Pro once revenue starts.

**Backlog ideas:** payment gateway; AI Companion activation; finance stage 3 (balance sheet, cash flow, budget, AI reading finances); show the member's Cek Posisi result to the mentor; Revenue Streams tool; DB-level SEF lock; Bunny Stream if videos leak.

## 9. Developer conventions

- `npm run dev` / `npm run build` / `npx eslint src` / `npx tsc --noEmit`. Make sure the build passes before pushing. If TypeScript complains about missing routes after moving pages, `rm -rf .next/types`.
- Copy `.env.example` to `.env.local`. Without it, the app runs in demo mode (sample data, writes blocked), which is useful for screenshots.
- Everything is pushed straight to `main` (approved by Ridha). Vercel deploys automatically.
- All UI text is in Indonesian, addressing the user as "Anda".
- Never commit secrets or personal data. Never invent testimonials or other content Ridha has not approved.
- Settings live in `app_settings` (read with `getSettings()`, saved via `admin_set_setting` RPC).
- Commit messages end with the session's attribution lines.

## 10. Continuing in a new Claude account

**What Ridha does (one time):**
1. Sign up for Claude with Ridha's own email and subscribe to Pro.
2. Open Claude Code on the web (claude.ai/code), and connect GitHub with the `bryanerfandawork` account (it owns the repo). Install the Claude GitHub App on the `eclub` repo when asked.
3. Start a new session (or project) on the repo `bryanerfandawork/eclub`.
4. Paste the starter prompt below as the first message.
5. Optional: if the new setup has a project memory, add the "suggested memory" lines below.

Nothing else moves: Vercel, Supabase, Rumahweb, Resend, Fonnte stay on Ridha's existing accounts. Claude only needs the GitHub repo; Ridha keeps doing the clicks inside Vercel/Supabase (running SQL, env vars) when asked.

**Starter prompt (paste as is):**

```
Halo Claude. Saya Ridha, pemilik EClub (www.eclub.co.id), platform "Personal Growth Companion" untuk pengusaha.
Proyek ini sudah jalan dan live. Kodenya di repo GitHub bryanerfandawork/eclub.

Sebelum mengerjakan apa pun, baca dulu docs/HANDOFF.md di repo itu sampai selesai. Itu rangkuman lengkap: produk, fitur, akun, SQL yang sudah dijalankan, dan yang masih tertunda.

Cara kerja dengan saya:
- Saya pemula. Jawab dalam bahasa Indonesia sederhana, langkah demi langkah, sebutkan tombol yang harus diklik.
- Kamu yang memutuskan urutan kerja dan lanjut sendiri. Berhenti hanya kalau butuh tangan saya (menjalankan SQL di Supabase, isi kunci di Vercel, daftar layanan).
- Jangan pernah minta saya menempel kunci rahasia di chat. Kunci hanya dimasukkan ke Vercel > Environment Variables.
- Repo ini publik: jangan commit kunci, email, nomor rekening, atau data pribadi.
- Hemat biaya, tapi tampilan harus premium.
- Push langsung ke main sudah saya setujui (Vercel deploy otomatis).

Yang tertunda saat ini: AI Companion (SQL 008 + ANTHROPIC_API_KEY), upgrade Vercel Pro, dan payment gateway otomatis.
Setelah membaca HANDOFF, ringkas dalam 5 poin apa yang kamu pahami, lalu tanya saya mau mulai dari mana.
```

**Suggested project memory (one line each):**
- EClub owner Ridha: beginner, Indonesian, simple step-by-step answers; Claude decides order and keeps going.
- Repo bryanerfandawork/eclub (public, push to main auto-deploys to Vercel); full context in docs/HANDOFF.md.
- Supabase project uvkqbwtlnbdcpbreijwr; every migration needs explicit GRANTs (incl. service_role); 001-017 run except 008.
- Never ask for secrets in chat; env var values only in Vercel.
- Pending: AI Companion (008 + ANTHROPIC_API_KEY), Vercel Pro, payment gateway (Moota paused).
- Brand: white "EClub" wordmark on maroon #8B2220; tagline "Personal Growth Companion"; method SEF (Spark, Survive, Sustain, Scale Up, Spread Up).
