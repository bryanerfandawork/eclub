-- 023: Tabungan mimpi di kantong. Uang di kantong bisa "ditandai" untuk mimpi tertentu.
--      Kalau dipakai untuk keperluan lain, tabungan mimpi yang dikorbankan berkurang (sisa targetnya bertambah).
--      Butuh SQL 022. Aman dijalankan ulang.
create table if not exists public.fin_dream_funds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  dream_id uuid not null references public.dreams (id) on delete cascade,
  pocket_id uuid not null references public.fin_pockets (id) on delete cascade,
  amount bigint not null check (amount <> 0 and abs(amount) < 100000000000),
  kind text not null check (kind in ('save', 'use', 'sacrifice', 'release')),
  tx_id uuid references public.fin_transactions (id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists fin_dream_funds_user_idx on public.fin_dream_funds (user_id, pocket_id, dream_id);
alter table public.fin_dream_funds enable row level security;
drop policy if exists fin_dream_funds_own on public.fin_dream_funds;
create policy fin_dream_funds_own on public.fin_dream_funds for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update, delete on public.fin_dream_funds to authenticated;
grant all on public.fin_dream_funds to service_role;
