-- EClub 013: paket fitur lanjutan (HPP, affiliate, mentoring, habit & jurnal, event, komunitas).
-- Aman dijalankan ulang.

-- ============ 1. Produk & HPP (Keuangan tahap 2, khusus Plus) ============
create table if not exists public.fin_products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  name text not null check (char_length(name) between 1 and 80),
  data jsonb not null default '{}'::jsonb,
  hpp bigint not null default 0,
  price bigint not null default 0,
  created_at timestamptz not null default now()
);
alter table public.fin_products enable row level security;
drop policy if exists "produk milik sendiri" on public.fin_products;
create policy "produk milik sendiri" on public.fin_products for select using (auth.uid() = user_id);
drop policy if exists "produk plus tulis" on public.fin_products;
create policy "produk plus tulis" on public.fin_products for insert with check (auth.uid() = user_id and (public.has_plus() or public.is_staff()));
drop policy if exists "produk plus ubah" on public.fin_products;
create policy "produk plus ubah" on public.fin_products for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "produk hapus" on public.fin_products;
create policy "produk hapus" on public.fin_products for delete using (auth.uid() = user_id);
grant select, insert, update, delete on public.fin_products to authenticated;
