-- EClub tahap 4: hasil assessment berbasis kuesioner (mis. 8 Wheel Entrepreneur)
-- Cara pakai: Supabase > SQL Editor > New query > tempel seluruh isi file ini > Run.

create table if not exists public.assessment_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  assessment_key text not null,
  answers jsonb not null,
  scores jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists assessment_user_idx on public.assessment_results (user_id, assessment_key, created_at desc);

alter table public.assessment_results enable row level security;

drop policy if exists "hasil milik sendiri" on public.assessment_results;
create policy "hasil milik sendiri" on public.assessment_results
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, delete on public.assessment_results to authenticated;
