-- 022: Kantong keuangan (dompet, rekening bank, e-wallet) untuk pribadi & usaha + laporan keuangan harian.
--      Gratis 2 kantong (1 pribadi + 1 usaha), Plus tanpa batas. Aman dijalankan ulang.

-- 1. Kantong
create table if not exists public.fin_pockets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  wallet text not null check (wallet in ('personal', 'business')),
  name text not null check (char_length(name) between 1 and 40),
  type text not null default 'cash' check (type in ('cash', 'bank', 'ewallet', 'other')),
  provider text,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists fin_pockets_user_idx on public.fin_pockets (user_id, wallet, archived);
alter table public.fin_pockets enable row level security;
drop policy if exists fin_pockets_own on public.fin_pockets;
create policy fin_pockets_own on public.fin_pockets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update, delete on public.fin_pockets to authenticated;
grant all on public.fin_pockets to service_role;

-- 2. Transaksi tercatat di kantong mana (dan ke kantong mana untuk pindah dana).
alter table public.fin_transactions add column if not exists pocket_id uuid references public.fin_pockets (id) on delete set null;
alter table public.fin_transactions add column if not exists to_pocket_id uuid references public.fin_pockets (id) on delete set null;
-- Pindah dana kini boleh di dalam dompet yang sama, asalkan antar kantong berbeda.
do $$
declare c record;
begin
  for c in select conname from pg_constraint
           where conrelid = 'public.fin_transactions'::regclass and contype = 'c'
             and pg_get_constraintdef(oid) ilike '%to_wallet <> wallet%' and conname <> 'fin_transactions_pocket_chk'
  loop execute format('alter table public.fin_transactions drop constraint %I', c.conname); end loop;
  begin
    alter table public.fin_transactions add constraint fin_transactions_pocket_chk
      check (to_wallet is null or to_wallet <> wallet or (pocket_id is not null and to_pocket_id is not null and pocket_id <> to_pocket_id));
  exception when duplicate_object then null; end;
end $$;
grant all on public.fin_transactions to service_role;

-- 3. Kantong bawaan untuk pengguna lama + isi kantong pada transaksi lama.
insert into public.fin_pockets (user_id, wallet, name, type)
select u.user_id, w.wallet, case w.wallet when 'personal' then 'Dompet pribadi' else 'Kas usaha' end, 'cash'
from (select distinct user_id from public.fin_transactions) u
cross join (values ('personal'), ('business')) w(wallet)
where not exists (select 1 from public.fin_pockets p where p.user_id = u.user_id and p.wallet = w.wallet);

update public.fin_transactions t set pocket_id = p.id
from (select distinct on (user_id, wallet) id, user_id, wallet from public.fin_pockets order by user_id, wallet, created_at) p
where t.pocket_id is null and p.user_id = t.user_id and p.wallet = t.wallet;
update public.fin_transactions t set to_pocket_id = p.id
from (select distinct on (user_id, wallet) id, user_id, wallet from public.fin_pockets order by user_id, wallet, created_at) p
where t.kind = 'transfer' and t.to_pocket_id is null and p.user_id = t.user_id and p.wallet = t.to_wallet;

-- 4. Saldo per kantong (mengikuti RLS pemanggil).
create or replace function public.fin_pocket_balances() returns table (pocket_id uuid, balance bigint)
language sql stable set search_path = '' as $$
  select p.id, coalesce((
    select sum(case
      when t.kind = 'in' and t.pocket_id = p.id then t.amount
      when t.kind = 'out' and t.pocket_id = p.id then -t.amount
      when t.kind = 'transfer' and t.pocket_id = p.id then -t.amount
      when t.kind = 'transfer' and t.to_pocket_id = p.id then t.amount
      else 0 end)
    from public.fin_transactions t
    where t.user_id = auth.uid() and (t.pocket_id = p.id or t.to_pocket_id = p.id)), 0)::bigint
  from public.fin_pockets p
  where p.user_id = auth.uid();
$$;
grant execute on function public.fin_pocket_balances to authenticated;

-- 5. "Hari ini tidak ada transaksi" (laporan keuangan harian tetap tercatat).
create table if not exists public.fin_checks (
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  check_date date not null,
  created_at timestamptz not null default now(),
  primary key (user_id, check_date)
);
alter table public.fin_checks enable row level security;
drop policy if exists fin_checks_own on public.fin_checks;
create policy fin_checks_own on public.fin_checks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update, delete on public.fin_checks to authenticated;
grant all on public.fin_checks to service_role;

-- 6. Batas paket: gratis 2 kantong (1 pribadi + 1 usaha), Plus tanpa batas.
insert into public.plan_features (key, label, description, free_limit, plus_limit, unit, enforced, sort)
values ('fin_pockets', 'Kantong keuangan', 'Dompet, rekening bank, dan e-wallet (pribadi & usaha). Plus: pindah antar kantong, grafik & ekspor', 2, null, 'kantong', true, 31)
on conflict (key) do nothing;
