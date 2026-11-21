-- EClub 012: Keuangan pribadi & usaha (Tahap 1). Dua dompet terpisah agar uang tidak tercampur.
create table if not exists public.fin_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  wallet text not null check (wallet in ('personal', 'business')),
  kind text not null check (kind in ('in', 'out', 'transfer')),
  to_wallet text check (to_wallet in ('personal', 'business')),
  amount bigint not null check (amount > 0 and amount < 100000000000),
  category text not null,
  note text,
  tx_date date not null default (now() at time zone 'Asia/Jakarta')::date,
  created_at timestamptz not null default now(),
  check ((kind = 'transfer') = (to_wallet is not null)),
  check (to_wallet is null or to_wallet <> wallet)
);
create index if not exists fin_tx_user_date_idx on public.fin_transactions (user_id, tx_date desc);
alter table public.fin_transactions enable row level security;
drop policy if exists "keuangan milik sendiri" on public.fin_transactions;
create policy "keuangan milik sendiri" on public.fin_transactions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update, delete on public.fin_transactions to authenticated;

-- Saldo per dompet (mengikuti RLS pemanggil)
create or replace function public.fin_balances() returns table (wallet text, balance bigint)
language sql stable set search_path = '' as $$
  select w.wallet, coalesce(sum(
    case
      when t.kind = 'in' and t.wallet = w.wallet then t.amount
      when t.kind = 'out' and t.wallet = w.wallet then -t.amount
      when t.kind = 'transfer' and t.wallet = w.wallet then -t.amount
      when t.kind = 'transfer' and t.to_wallet = w.wallet then t.amount
      else 0 end), 0)::bigint
  from (values ('personal'), ('business')) as w(wallet)
  left join public.fin_transactions t on t.user_id = auth.uid() and (t.wallet = w.wallet or t.to_wallet = w.wallet)
  group by w.wallet;
$$;
grant execute on function public.fin_balances to authenticated;
