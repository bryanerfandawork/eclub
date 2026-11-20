# EClub · Personal Growth Companion

*Find Your Path. Build Your Success.*

Platform EClub Indonesia, tahap 1 (fondasi):

- Halaman depan, daftar, dan masuk (Supabase Auth, email + kata sandi)
- Dashboard bergaya aplikasi di HP (navigasi bawah) dan dashboard profesional di desktop (sidebar)
- My Journey: enam tahap EClub Success Framework
- Dream Planner: tulis mimpi, target dana & tanggal, kalkulator tabungan per bulan, langkah aksi
- Profil & definisi sukses pribadi
- PWA: bisa dipasang di layar utama HP

## Teknologi

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Supabase · Vercel

## Menjalankan

```bash
npm install
cp .env.example .env.local   # isi kunci Supabase (opsional, tanpa ini = mode demo)
npm run dev
```

## Database

Jalankan `supabase/schema.sql` sekali di Supabase Dashboard > SQL Editor.
Semua tabel memakai Row Level Security: setiap pengguna hanya bisa mengakses datanya sendiri.
