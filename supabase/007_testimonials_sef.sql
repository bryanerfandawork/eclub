-- EClub 007: Testimoni (diatur admin) + langkah SEF untuk kelas
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  quote text not null,
  photo_url text,
  published boolean not null default false,
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.testimonials enable row level security;

drop policy if exists "testimoni tampil untuk semua" on public.testimonials;
create policy "testimoni tampil untuk semua" on public.testimonials
  for select using (published or public.is_staff());

drop policy if exists "admin kelola testimoni" on public.testimonials;
create policy "admin kelola testimoni" on public.testimonials
  for all using (public.is_staff()) with check (public.is_staff());

grant select on public.testimonials to anon, authenticated;
grant insert, update, delete on public.testimonials to authenticated;

-- Kelas dikelompokkan per langkah Sustainable Entrepreneur Framework (SEF)
alter table public.courses add column if not exists sef_step text
  check (sef_step in ('personal_mapping', 'acquisition', 'systemation', 'transformation', 'investation'));
