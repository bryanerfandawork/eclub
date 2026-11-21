# EClub: Handoff Document

This document is self-contained, so a new Claude session (or a developer) can pick up the work without reading the earlier conversations. Last updated: 20 November 2026.

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

- Logo: white "EClub" wordmark with a white circle behind the "E", on deep maroon. Original file: `public/brand/eclub-logo-original.png`, component: `src/components/logo.tsx`.
- Primary colour **#8B2220** (maroon / brick red). Accent: gold #C6A15B. Background: paper #FAF7F5. Tokens live in `src/app/globals.css` (`@theme`).
- Font: Plus Jakarta Sans.

## 4. Stack and accounts (no secrets)

| Piece | Details |
|---|---|
| Code | Next.js 15.5 (App Router, server actions), TypeScript, Tailwind v4 |
| Repo | github.com/bryanerfandawork/eclub (public). Every push to `main` auto-deploys to Vercel. |
| Hosting | Vercel free tier. Live at https://eclub-five.vercel.app |
| Database / auth | Supabase project `uvkqbwtlnbdcpbreijwr` (Tokyo, free) |
| Domain | `eclub.co.id`, registered at Rumahweb (Rumahweb also hosts the business email). See section 7. |
| Payments | Moota (automatic bank transfer verification via webhook). The provider interface is swappable (`src/lib/payments/`). |
| AI | Anthropic API, model `claude-haiku-5-5` at effort low (cheap: about Rp5–10 per message) |
| WhatsApp (planned) | Fonnte |

**Vercel environment variables:**
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`: already set.
- `SUPABASE_SERVICE_ROLE_KEY`, `MOOTA_WEBHOOK_SECRET`: for the Moota webhook (pending).
- `ANTHROPIC_API_KEY`: for the AI Companion (pending).
- `FONNTE_TOKEN` (Fonnte device token) and `CRON_SECRET` (any random text; Vercel Cron sends it automatically): for WhatsApp notifications. The cron job also needs `SUPABASE_SERVICE_ROLE_KEY`.
- Optional: `NEXT_PUBLIC_SITE_URL` (defaults to https://www.eclub.co.id; only used for `metadataBase`).
- After changing env variables, you must **Redeploy**.

Without the Supabase env variables, the app runs in **demo mode**: it shows sample data and blocks writes.

## 5. Features built

- Auth: sign up, sign in, email confirmation (`/auth/callback`). Mobile shell with bottom navigation, desktop sidebar. PWA (manifest, service worker, offline page) plus a mobile "add to home screen" prompt (`src/components/install-prompt.tsx`).
- Dashboard: journey card, "Cek Posisi" call to action, 8 Wheel retest reminder after 3 months.
- **My Journey**: map of Spark plus the 5 SEF steps.
- **Cek Posisi** onboarding (see section 2).
- **My Life**: definition of success, values, vision, priorities, plus a printable document.
- **DISC personality test** (replaced Wheel of Life on 21 Nov 2026 at Ridha's request; the old `/wheel-of-life` page and data still exist, just unlinked):
  - Source: Ridha's Excel `Tes_DISC.xlsx`, a 24-item forced choice (most / least).
  - `src/lib/disc/data.ts` is auto-generated from the Excel: statements, answer key, conversion tables, 55 graph codes, 24 type descriptions.
  - Scoring is in `src/lib/disc/score.ts`. Graph I = Most (Adapted), Graph II = Least (Natural).
  - Verified identical to the Excel via LibreOffice recalculation. Where the Excel returns #N/A for a graph code, the app falls back to the closest code (matching the top 2 factors, then the top 1).
  - The source file states "Copyright TTI Ltd". This licensing risk was flagged to Ridha.
  - Free: both graphs, dominant style, meaning of each letter, key strengths.
  - Paid "Laporan Lengkap DISC" (price set in `app_settings.disc_report_price`, default Rp29.000 one-time, included in Plus; unlocks live in `report_unlocks`):
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
- **Moota payments**:
  - Each order gets a unique code (+1 to 499 added to the price).
  - Webhook: `/api/payments/moota` checks an HMAC of the request, then calls `apply_bank_mutation`, which calls `fulfill_order`.
  - The signature header format has not been verified against Moota yet, so it needs a real test.
- **Super Admin** (`/admin`):
  - Ringkasan: stats and AI cost estimate.
  - Pengguna: change plan and role.
  - Course: CRUD, lessons, SEF step, grant access.
  - Pesanan: mark as paid or cancel.
  - Paket & Fitur: limits, prices, WhatsApp contact for upgrades and mentoring, bank accounts.
  - Testimoni.
- **AI Companion** (gold ✨ button):
  - Streams replies through `/api/ai/chat`.
  - Remembers the last 10 messages.
  - With the member's consent (checkbox), it reads their profile, My Life, dreams, Wheel of Life, 8 Wheel results, and SEF position.
  - Daily quota from `plan_features.ai_messages` (Free 5, Plus 50).
  - Logs tokens in `ai_messages`.
  - The system prompt is in `src/lib/ai.ts`.
- **Notifikasi WhatsApp (Fonnte)** — member mengaktifkan sendiri di Profil (nomor + opt-in + pengingat harian). Vercel Cron `vercel.json` memanggil `/api/cron/daily` tiap 07.00 WIB: tes ulang 8 Wheel (>90 hari, maks sebulan sekali) atau pengingat aksi harian; maksimal 1 pesan/orang/hari, 40 pesan/run, jeda 0,7 dtk. Konfirmasi lunas dikirim saat admin menandai lunas / webhook pembayaran (`notifyOrderPaid` di `src/lib/whatsapp.ts`). Log di `notification_log`. Pengingat mentoring menunggu fitur booking.
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
- **WhatsApp notifications (Fonnte)**:
  - Members turn them on themselves in Profile: WhatsApp number, opt-in, and an optional daily reminder.
  - `vercel.json` schedules Vercel Cron to call `/api/cron/daily` every day at 07:00 WIB. It sends either the 8 Wheel retest reminder (after 90 days, at most once a month) or the daily action reminder.
  - Limits: at most 1 message per person per day, 40 messages per run, 0.7 second gap between sends.
  - A payment confirmation is sent when an admin marks an order as paid or the payment webhook fulfils it (`notifyOrderPaid` in `src/lib/whatsapp.ts`).
  - Sends are logged in `notification_log`.
  - Mentoring reminders wait for the booking feature.
- **Landing page** (`src/app/page.tsx`): spark story, pain-to-gain section, philosophy, features, large SEF map, how it works, annual pricing, classes and mentoring, FAQ.

## 6. Database migrations (run by Ridha in Supabase > SQL Editor)

| File | Status |
|---|---|
| `supabase/schema.sql` | ✅ run |
| `002_wheel_daily.sql` | ✅ run |
| `003_my_life.sql` | ✅ run |
| `004_assessments_admin.sql` (plus the super admin SQL) | ✅ run |
| `005_lms.sql` | ✅ run |
| `006_payments.sql` | ✅ run |
| `007_testimonials_sef.sql` (testimonials + `courses.sef_step`) | ✅ run (same content, pasted from the chat) |
| `008_ai_companion.sql` | ⏳ **not run yet** |
| `009_whatsapp.sql` (WhatsApp columns on profiles + notification_log) | ⏳ **not run yet** |
| `011_manual_payment.sql` (public storage bucket `assets` for QRIS, payment_mode=manual, 48h expiry) | ⏳ given to Ridha 21 Nov 2026 |
| `010_disc.sql` (report_unlocks, product disc_report, disc_report plan feature, removes wheel_history) | ✅ run |

New migrations go in `supabase/00N_*.sql`. Every migration must include explicit `GRANT` statements, because "Grant API access" was unchecked when the project was created.

**Security model:**
- RLS is enabled on every table.
- Column-level grants on `profiles`, so users cannot change their own role or plan.
- Admin operations go through `SECURITY DEFINER` RPCs (`require_admin`, `admin_*`).
- `is_staff()` and `has_plus()` helpers.

## 7. Pending steps for Ridha (one at a time)

1. **Domain eclub.co.id**
   - Already done: domain added in Vercel. The apex domain redirects (308) to `www`, and `www` serves production.
   - In Rumahweb DNS:
     - Set an `A` record for `@` to `216.198.79.1`.
     - Set a `CNAME` record for `www` to `d79ea96fd7390bec.vercel-dns.com`.
     - **Do not** change the nameservers or the MX records, or the business email will stop working.
     - Edit any existing @/www record instead of adding a duplicate.
   - Once Vercel shows "Valid", go to Supabase > Authentication > URL Configuration:
     - Set Site URL to `https://www.eclub.co.id`.
     - Add Redirect URLs `https://www.eclub.co.id/**` and `https://eclub.co.id/**`. Keep the vercel.app entry.
   - Test with a new signup.
2. **Run `008_ai_companion.sql`** in the SQL Editor.
3. **Anthropic key**
   - At console.anthropic.com: Billing (top up about $5), Limits (monthly spend limit, e.g. $10), API Keys (Create Key).
   - Then in Vercel, set `ANTHROPIC_API_KEY` and Redeploy.
4. **Pembayaran** — Moota ditunda (kendala akun Ridha); mungkin pindah ke Xendit/lainnya (antarmuka `src/lib/payments/types.ts` siap). Langkah Moota lama: (waiting for Ridha's Moota signup to finish)
   - Part 1: connect the bank account in Moota. Internet banking credentials go **only into Moota**.
   - Part 2: in Moota, set the webhook URL to `https://www.eclub.co.id/api/payments/moota` (or the vercel.app URL until the domain works).
     - Create a secret token in Moota.
     - In Vercel, set `MOOTA_WEBHOOK_SECRET` (that token) and `SUPABASE_SERVICE_ROLE_KEY` (from Supabase > Project Settings > API), then Redeploy.
     - Fill in the transfer bank accounts under Admin > Paket & Fitur.
   - Part 3: test end to end with a small transfer.
     - Use Moota's test webhook and check `payment_events`.
     - Adjust the parser in `src/lib/payments/moota.ts` if the payload or signature format differs.
5. **Fonnte**
   - Run `009_whatsapp.sql`.
   - Sign up at fonnte.com and connect the business WhatsApp number by scanning the QR code.
   - Copy the device token into Vercel as `FONNTE_TOKEN`.
   - Add `CRON_SECRET` (any random text) and `SUPABASE_SERVICE_ROLE_KEY`, then Redeploy.
6. Before launch: custom SMTP in Supabase (so confirmation emails come from the domain and are not rate-limited), and fill in the upgrade/mentoring WhatsApp contact in Admin.

## 8. Backlog and suggested build order

1. ~~WhatsApp notifications via Fonnte~~: built (see section 5). Only activation is left. The original plan was:
   - Notifications: daily action reminders, Moota payment confirmations, 3-month retest reminder, mentoring reminders.
   - Members must opt in, and the WhatsApp number is saved in their profile.
   - Rate-limit sends, and log them (e.g. a `notifications` table).
   - Schedule with a Vercel cron (free tier, about once a day) or Supabase pg_cron.
2. Mentoring booking: schedule, payment through Moota, links to Cek Posisi results.
3. Revenue Streams tool (for the Acquisition step), and the remaining "Personal Mapping / Strength Mapping" tools on the journey.
4. Articles / EClub Insights CMS (premium articles already exist in plan_features).
5. Enforce the SEF level lock in the database, if needed.
6. Bunny Stream, if unlisted YouTube videos start leaking.
7. Midtrans/Xendit as an extra payment provider (the interface is ready).

## 9. Developer conventions

- `npm run dev` / `npm run build` / `npx eslint src` / `npx tsc --noEmit`. Make sure the build passes before pushing.
- Copy `.env.example` to `.env.local`. Without it, the app runs in demo mode, which is useful for screenshots.
- So far everything has been pushed straight to `main` (approved during setup). Vercel deploys automatically.
- All UI text is in Indonesian, addressing the user as "Anda".
- Never commit secrets or personal data. Never invent testimonials or other content Ridha has not approved. Label the 8 Wheel and Cek Posisi content as EClub drafts.
- Original reference: Master Project Brief v1.0. A copy of the 8 Wheel template is in the project files (`eclub-content/template-8-wheel-entrepreneur.md`).
