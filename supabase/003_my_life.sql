-- EClub tahap 3: modul My Life (nilai pribadi, visi hidup, prioritas)
-- Cara pakai: Supabase > SQL Editor > New query > tempel seluruh isi file ini > Run.

create table if not exists public.life_plans (
  user_id uuid primary key references auth.users (id) on delete cascade default auth.uid(),
  core_values text[] not null default '{}',
  vision text,
  priorities text[] not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.life_plans enable row level security;

drop policy if exists "life plan milik sendiri" on public.life_plans;
create policy "life plan milik sendiri" on public.life_plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update, delete on public.life_plans to authenticated;
