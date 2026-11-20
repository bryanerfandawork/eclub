-- EClub tahap 2: Wheel of Life & Daily Action
-- Cara pakai: Supabase > SQL Editor > New query > tempel seluruh isi file ini > Run.

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
