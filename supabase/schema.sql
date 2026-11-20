-- EClub: skema database tahap 1
-- Cara pakai: Supabase Dashboard > SQL Editor > New query > tempel seluruh isi file ini > Run.

-- 1. Profil pengguna
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  segment text,
  success_definition text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Mimpi (Dream Planner)
create table if not exists public.dreams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  title text not null check (char_length(title) between 1 and 120),
  category text not null default 'Lainnya',
  why text,
  target_amount numeric(16, 0) check (target_amount is null or target_amount >= 0),
  saved_amount numeric(16, 0) not null default 0 check (saved_amount >= 0),
  target_date date,
  status text not null default 'active' check (status in ('active', 'achieved', 'paused')),
  created_at timestamptz not null default now()
);
create index if not exists dreams_user_idx on public.dreams (user_id, created_at desc);

-- 3. Langkah aksi per mimpi
create table if not exists public.dream_actions (
  id uuid primary key default gen_random_uuid(),
  dream_id uuid not null references public.dreams (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  title text not null check (char_length(title) between 1 and 160),
  done boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists dream_actions_dream_idx on public.dream_actions (dream_id, created_at);

-- Keamanan: setiap orang hanya bisa melihat & mengubah datanya sendiri
alter table public.profiles enable row level security;
alter table public.dreams enable row level security;
alter table public.dream_actions enable row level security;

drop policy if exists "profil milik sendiri" on public.profiles;
create policy "profil milik sendiri" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "mimpi milik sendiri" on public.dreams;
create policy "mimpi milik sendiri" on public.dreams
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "aksi milik sendiri" on public.dream_actions;
create policy "aksi milik sendiri" on public.dream_actions
  for all using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (select 1 from public.dreams d where d.id = dream_id and d.user_id = auth.uid())
  );

-- Buat profil otomatis saat pengguna mendaftar
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Izinkan aplikasi (pengguna yang login) mengakses tabel lewat Data API.
-- RLS di atas tetap membatasi setiap orang hanya ke datanya sendiri.
grant select, insert, update, delete on public.profiles, public.dreams, public.dream_actions to authenticated;

-- ===== Tahap 2 (sama dengan file 002_wheel_daily.sql) =====
create table if not exists public.wheel_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  scores jsonb not null,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists wheel_user_idx on public.wheel_assessments (user_id, created_at desc);

create table if not exists public.daily_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  title text not null check (char_length(title) between 1 and 160),
  action_date date not null,
  done boolean not null default false,
  dream_id uuid references public.dreams (id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists daily_user_date_idx on public.daily_actions (user_id, action_date desc);

alter table public.wheel_assessments enable row level security;
alter table public.daily_actions enable row level security;

drop policy if exists "wheel milik sendiri" on public.wheel_assessments;
create policy "wheel milik sendiri" on public.wheel_assessments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "daily milik sendiri" on public.daily_actions;
create policy "daily milik sendiri" on public.daily_actions
  for all using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and (dream_id is null or exists (select 1 from public.dreams d where d.id = dream_id and d.user_id = auth.uid()))
  );

grant select, insert, update, delete on public.wheel_assessments, public.daily_actions to authenticated;
