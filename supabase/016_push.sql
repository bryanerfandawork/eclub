-- EClub tahap 16: notifikasi HP (Web Push) untuk penyemangat pagi & pengumuman dari super admin.

-- 1. Langganan notifikasi per perangkat (satu orang bisa punya beberapa HP/laptop).
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now()
);
create index if not exists push_subs_user_idx on public.push_subscriptions (user_id);
alter table public.push_subscriptions enable row level security;
drop policy if exists push_subs_own on public.push_subscriptions;
create policy push_subs_own on public.push_subscriptions for all using (user_id = auth.uid()) with check (user_id = auth.uid());
grant select, insert, update, delete on public.push_subscriptions to authenticated;

-- 2. Kunci rahasia push (VAPID). Dibuat otomatis oleh server, tidak bisa dibaca pengguna mana pun.
create table if not exists public.push_secrets (
  key text primary key,
  value text not null
);
alter table public.push_secrets enable row level security;
revoke all on public.push_secrets from anon, authenticated;

-- 3. Pengumuman push dari super admin (kirim sekarang atau dijadwalkan untuk pagi tanggal tertentu).
create table if not exists public.push_broadcasts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  url text not null default '/dashboard',
  audience text not null default 'all' check (audience in ('all', 'plus', 'free')),
  province text,
  regency text,
  send_on date,
  replace_morning boolean not null default false,
  status text not null default 'scheduled' check (status in ('scheduled', 'sent', 'cancelled')),
  sent_count integer not null default 0,
  sent_at timestamptz,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);
alter table public.push_broadcasts enable row level security;
drop policy if exists push_broadcasts_staff on public.push_broadcasts;
create policy push_broadcasts_staff on public.push_broadcasts for all using (public.is_staff()) with check (public.is_staff());
grant select, insert, update, delete on public.push_broadcasts to authenticated;

-- 4. Pengaturan penyemangat pagi lewat notifikasi HP.
insert into public.app_settings (key, value) values
  ('push_morning', 'true'::jsonb),
  ('push_morning_title', '"Selamat pagi dari EClub ☀️"'::jsonb)
on conflict (key) do nothing;

-- 5. Jumlah perangkat aktif (untuk ringkasan admin).
create or replace function public.push_device_count() returns integer
language sql stable security definer set search_path = '' as $$
  select case when public.is_staff() then (select count(*)::int from public.push_subscriptions) else 0 end;
$$;
grant execute on function public.push_device_count to authenticated;
