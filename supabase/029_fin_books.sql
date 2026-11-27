-- 029: Keuangan bersama & catat pintar.
--   - Buku keuangan: usaha bisa lebih dari 1, keuangan keluarga.
--   - Anggota buku: pasangan (Pengelola) atau staf keuangan (Pencatat, bisa dibatasi ke kantong tertentu).
--   - Kuota catat pintar (foto nota & ketik dengan AI).
--   Keuangan Pribadi tetap rahasia (tidak pernah dibagikan). Butuh SQL 022, 023, 024. Aman dijalankan ulang.

-- =====================================================================
-- 1. Tabel
-- =====================================================================
create table if not exists public.fin_books (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  kind text not null check (kind in ('business', 'family')),
  name text not null check (char_length(name) between 1 and 40),
  workspace_id uuid references public.workspaces (id) on delete set null,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists fin_books_owner_idx on public.fin_books (owner_id, archived);

-- role: owner (pemilik), manager (pengelola: lihat & atur semua), recorder (pencatat: hanya kantong yang diizinkan)
-- pocket_ids null = semua kantong.
create table if not exists public.fin_book_members (
  book_id uuid not null references public.fin_books (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'recorder' check (role in ('owner', 'manager', 'recorder')),
  pocket_ids uuid[],
  status text not null default 'invited' check (status in ('invited', 'active')),
  invited_by uuid references auth.users (id) on delete set null,
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (book_id, user_id)
);
create index if not exists fin_book_members_user_idx on public.fin_book_members (user_id, status);

alter table public.fin_pockets add column if not exists book_id uuid references public.fin_books (id) on delete cascade;
alter table public.fin_transactions add column if not exists book_id uuid references public.fin_books (id) on delete cascade;
-- Dari mana catatan dibuat: manual, foto nota (scan), atau ketik seperti chat (chat).
alter table public.fin_transactions add column if not exists source text not null default 'manual';
create index if not exists fin_pockets_book_idx on public.fin_pockets (book_id);
create index if not exists fin_tx_book_idx on public.fin_transactions (book_id, tx_date desc);
create index if not exists fin_tx_pocket_idx on public.fin_transactions (pocket_id);
create index if not exists fin_tx_to_pocket_idx on public.fin_transactions (to_pocket_id);

-- Pemakaian AI catat pintar (untuk kuota harian).
create table if not exists public.fin_ai_usage (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  kind text not null check (kind in ('scan', 'chat')),
  input_tokens int,
  output_tokens int,
  created_at timestamptz not null default now()
);
create index if not exists fin_ai_usage_user_idx on public.fin_ai_usage (user_id, created_at desc);
alter table public.fin_ai_usage enable row level security;
drop policy if exists fin_ai_usage_own on public.fin_ai_usage;
create policy fin_ai_usage_own on public.fin_ai_usage for select using (user_id = auth.uid());
drop policy if exists fin_ai_usage_ins on public.fin_ai_usage;
create policy fin_ai_usage_ins on public.fin_ai_usage for insert with check (user_id = auth.uid());
grant select, insert on public.fin_ai_usage to authenticated;
grant all on public.fin_ai_usage to service_role;

-- =====================================================================
-- 2. Fungsi bantu (dipakai aturan keamanan)
-- =====================================================================
create or replace function public.fin_book_role(p_book uuid) returns text
language sql stable security definer set search_path = '' as $$
  select role from public.fin_book_members where book_id = p_book and user_id = auth.uid() and status = 'active';
$$;

-- Boleh melihat/mencatat di kantong ini?
create or replace function public.fin_can_pocket(p_pocket uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.fin_pockets p
    left join public.fin_book_members m on m.book_id = p.book_id and m.user_id = auth.uid() and m.status = 'active'
    where p.id = p_pocket
      and ((p.book_id is null and p.user_id = auth.uid())
        or (m.role in ('owner', 'manager'))
        or (m.role = 'recorder' and (m.pocket_ids is null or p.id = any (m.pocket_ids))))
  );
$$;

create or replace function public.fin_owner_plus(p_book uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.fin_books b join public.profiles p on p.id = b.owner_id
    where b.id = p_book
      and ((p.plan = 'plus' and (p.plan_expires_at is null or p.plan_expires_at > now())) or p.role in ('admin', 'super_admin'))
  );
$$;

-- =====================================================================
-- 3. Aturan keamanan
-- =====================================================================
alter table public.fin_books enable row level security;
alter table public.fin_book_members enable row level security;

drop policy if exists fin_books_select on public.fin_books;
create policy fin_books_select on public.fin_books for select using (owner_id = auth.uid() or public.fin_book_role(id) is not null
  or exists (select 1 from public.fin_book_members m where m.book_id = id and m.user_id = auth.uid()));
drop policy if exists fin_books_owner on public.fin_books;
create policy fin_books_owner on public.fin_books for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists fin_books_delete on public.fin_books;
create policy fin_books_delete on public.fin_books for delete using (owner_id = auth.uid());
grant select, update, delete on public.fin_books to authenticated;
grant select on public.fin_book_members to authenticated;
grant all on public.fin_books, public.fin_book_members to service_role;

drop policy if exists fin_book_members_select on public.fin_book_members;
create policy fin_book_members_select on public.fin_book_members for select using (user_id = auth.uid() or public.fin_book_role(book_id) is not null);

-- Kantong: pribadi milik sendiri, atau kantong buku yang boleh diakses.
drop policy if exists fin_pockets_own on public.fin_pockets;
drop policy if exists fin_pockets_select on public.fin_pockets;
drop policy if exists fin_pockets_write on public.fin_pockets;
create policy fin_pockets_select on public.fin_pockets for select using ((book_id is null and user_id = auth.uid()) or (book_id is not null and public.fin_can_pocket(id)));
create policy fin_pockets_write on public.fin_pockets for all
  using ((book_id is null and user_id = auth.uid()) or public.fin_book_role(book_id) in ('owner', 'manager'))
  with check ((book_id is null and user_id = auth.uid()) or public.fin_book_role(book_id) in ('owner', 'manager'));

-- Kantong di buku selalu atas nama pemilik buku (dihitung ke batas paket pemilik) dan jenis dompetnya ikut jenis buku.
create or replace function public.fin_pockets_book_fill() returns trigger
language plpgsql security definer set search_path = '' as $$
declare b record;
begin
  if new.book_id is not null then
    select owner_id, kind into b from public.fin_books where id = new.book_id;
    if not found then raise exception 'Buku keuangan tidak ditemukan'; end if;
    new.user_id := b.owner_id;
    new.wallet := case when b.kind = 'business' then 'business' else 'personal' end;
  end if;
  return new;
end $$;
drop trigger if exists fin_pockets_book_fill on public.fin_pockets;
create trigger fin_pockets_book_fill before insert or update of book_id on public.fin_pockets for each row execute function public.fin_pockets_book_fill();

-- Transaksi: dilihat bila menyentuh kantong yang boleh diakses. Buku diisi otomatis dari kantongnya.
drop policy if exists "keuangan milik sendiri" on public.fin_transactions;
drop policy if exists fin_tx_select on public.fin_transactions;
drop policy if exists fin_tx_insert on public.fin_transactions;
drop policy if exists fin_tx_change on public.fin_transactions;
drop policy if exists fin_tx_delete on public.fin_transactions;
create policy fin_tx_select on public.fin_transactions for select using (
  (book_id is null and user_id = auth.uid())
  or (book_id is not null and (public.fin_book_role(book_id) in ('owner', 'manager') or public.fin_can_pocket(pocket_id) or public.fin_can_pocket(to_pocket_id)))
);
create policy fin_tx_insert on public.fin_transactions for insert with check (user_id = auth.uid() and (book_id is null or public.fin_book_role(book_id) is not null));
create policy fin_tx_change on public.fin_transactions for update
  using ((book_id is null and user_id = auth.uid()) or public.fin_book_role(book_id) in ('owner', 'manager') or (book_id is not null and user_id = auth.uid()))
  with check ((book_id is null and user_id = auth.uid()) or public.fin_book_role(book_id) is not null);
create policy fin_tx_delete on public.fin_transactions for delete
  using ((book_id is null and user_id = auth.uid()) or public.fin_book_role(book_id) in ('owner', 'manager') or (book_id is not null and user_id = auth.uid()));

create or replace function public.fin_tx_guard() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := auth.uid(); v_a uuid; v_b uuid; v_has_a boolean := false; v_has_b boolean := false;
begin
  if tg_op = 'UPDATE' then new.user_id := old.user_id; end if;
  if new.pocket_id is not null then
    select book_id into v_a from public.fin_pockets where id = new.pocket_id;
    v_has_a := found;
  end if;
  if new.to_pocket_id is not null then
    select book_id into v_b from public.fin_pockets where id = new.to_pocket_id;
    v_has_b := found;
  end if;
  if v_uid is not null then -- server (cron/admin) tidak dicek
    if new.pocket_id is not null and (not v_has_a or not public.fin_can_pocket(new.pocket_id)) then raise exception 'Kantong tidak bisa dipakai'; end if;
    if new.to_pocket_id is not null and (not v_has_b or not public.fin_can_pocket(new.to_pocket_id)) then raise exception 'Kantong tujuan tidak bisa dipakai'; end if;
    -- Pindah dana antar buku (atau antara buku dan pribadi) hanya oleh pemilik/pengelola buku tersebut.
    if v_has_a and v_has_b and v_a is distinct from v_b then
      if v_a is not null and coalesce(public.fin_book_role(v_a), '') not in ('owner', 'manager') then raise exception 'Hanya pemilik/pengelola yang bisa memindahkan uang keluar dari buku ini'; end if;
      if v_b is not null and coalesce(public.fin_book_role(v_b), '') not in ('owner', 'manager') then raise exception 'Hanya pemilik/pengelola yang bisa memindahkan uang ke buku ini'; end if;
    end if;
  end if;
  new.book_id := coalesce(v_a, v_b);
  if tg_op = 'INSERT' and v_uid is not null then new.user_id := v_uid; end if;
  return new;
end $$;
drop trigger if exists fin_tx_guard on public.fin_transactions;
create trigger fin_tx_guard before insert or update on public.fin_transactions for each row execute function public.fin_tx_guard();

-- Catatan dari anggota lain masuk ke lonceng pemilik & pengelola.
create or replace function public.fin_tx_notify() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_name text; v_book text;
begin
  if new.book_id is null then return new; end if;
  select coalesce(full_name, 'Anggota') into v_name from public.profiles where id = new.user_id;
  select name into v_book from public.fin_books where id = new.book_id;
  insert into public.notifications (user_id, title, body, url)
    select m.user_id, left(v_name || ' mencatat di ' || coalesce(v_book, 'buku keuangan'), 120),
           case new.kind when 'in' then 'Uang masuk ' when 'out' then 'Uang keluar ' else 'Pindah dana ' end
             || 'Rp' || replace(to_char(new.amount, 'FM999,999,999,999'), ',', '.') || coalesce(' · ' || left(new.note, 80), ''),
           '/keuangan?b=' || new.book_id
    from public.fin_book_members m
    where m.book_id = new.book_id and m.status = 'active' and m.role in ('owner', 'manager') and m.user_id <> new.user_id;
  return new;
end $$;
drop trigger if exists fin_tx_notify on public.fin_transactions;
create trigger fin_tx_notify after insert on public.fin_transactions for each row execute function public.fin_tx_notify();

-- Saldo per kantong yang boleh diakses (dihitung dari semua catatan, siapa pun yang mencatat).
create or replace function public.fin_pocket_balances() returns table (pocket_id uuid, balance bigint)
language sql stable security definer set search_path = '' as $$
  select p.id, coalesce((
    select sum(case
      when t.kind = 'in' and t.pocket_id = p.id then t.amount
      when t.kind = 'out' and t.pocket_id = p.id then -t.amount
      when t.kind = 'transfer' and t.pocket_id = p.id then -t.amount
      when t.kind = 'transfer' and t.to_pocket_id = p.id then t.amount
      else 0 end)
    from public.fin_transactions t
    where t.pocket_id = p.id or t.to_pocket_id = p.id), 0)::bigint
  from public.fin_pockets p
  where (p.book_id is null and p.user_id = auth.uid()) or (p.book_id is not null and public.fin_can_pocket(p.id));
$$;
grant execute on function public.fin_pocket_balances to authenticated;

-- =====================================================================
-- 4. Pindahkan keuangan usaha lama ke buku "Usaha saya"
-- =====================================================================
do $$
declare r record; v_book uuid;
begin
  for r in select distinct user_id from public.fin_pockets where wallet = 'business' and book_id is null loop
    insert into public.fin_books (owner_id, kind, name) values (r.user_id, 'business', 'Usaha saya') returning id into v_book;
    insert into public.fin_book_members (book_id, user_id, role, status, joined_at) values (v_book, r.user_id, 'owner', 'active', now()) on conflict do nothing;
    update public.fin_pockets set book_id = v_book where user_id = r.user_id and wallet = 'business' and book_id is null;
  end loop;
end $$;
update public.fin_transactions t set book_id = p.book_id
  from public.fin_pockets p
  where t.book_id is null and p.book_id is not null and (p.id = t.pocket_id or p.id = t.to_pocket_id);

-- =====================================================================
-- 5. Aksi lewat fungsi
-- =====================================================================
-- Buat buku. Gratis: 1 buku usaha. Plus: usaha tanpa batas + buku keluarga.
create or replace function public.fin_book_create(p_kind text, p_name text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := auth.uid(); v_id uuid; v_plus boolean := public.has_plus() or public.is_staff(); v_cnt int;
begin
  if v_uid is null then raise exception 'Silakan masuk'; end if;
  if p_kind not in ('business', 'family') then raise exception 'Jenis buku tidak valid'; end if;
  if p_kind = 'family' and not v_plus then raise exception 'Keuangan keluarga khusus member Plus'; end if;
  select count(*) into v_cnt from public.fin_books where owner_id = v_uid and not archived;
  if not v_plus and v_cnt >= 1 then raise exception 'Paket gratis punya 1 usaha. Upgrade ke Plus untuk menambah usaha lain.'; end if;
  if v_cnt >= 30 then raise exception 'Maksimal 30 buku keuangan'; end if;
  insert into public.fin_books (owner_id, kind, name) values (v_uid, p_kind, left(trim(p_name), 40)) returning id into v_id;
  insert into public.fin_book_members (book_id, user_id, role, status, joined_at) values (v_id, v_uid, 'owner', 'active', now());
  insert into public.fin_pockets (book_id, wallet, name, type) values (v_id, case when p_kind = 'business' then 'business' else 'personal' end,
    case when p_kind = 'business' then 'Kas usaha' else 'Kas keluarga' end, 'cash');
  return v_id;
end $$;

-- Undang lewat username. Hanya pemilik (Plus). Maksimal 10 anggota per buku.
create or replace function public.fin_book_invite(p_book uuid, p_username text, p_role text, p_pockets uuid[] default null) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_target uuid; v_row record; v_book record;
begin
  select * into v_book from public.fin_books where id = p_book;
  if not found or v_book.owner_id <> auth.uid() then raise exception 'Hanya pemilik buku yang bisa mengundang'; end if;
  if not public.fin_owner_plus(p_book) then raise exception 'Mengajak orang lain mengelola keuangan khusus member Plus'; end if;
  if p_role not in ('manager', 'recorder') then raise exception 'Peran tidak valid'; end if;
  select id into v_target from public.profiles where lower(username) = lower(trim(both '@ ' from coalesce(p_username, '')));
  if v_target is null then raise exception 'Username tidak ditemukan. Minta dia daftar EClub dulu, lalu kirim username-nya ke Anda.'; end if;
  if v_target = auth.uid() then raise exception 'Itu username Anda sendiri'; end if;
  select * into v_row from public.fin_book_members where book_id = p_book and user_id = v_target;
  if found then raise exception '%', case when v_row.status = 'active' then 'Orang ini sudah menjadi anggota' else 'Orang ini sudah diundang, tinggal menunggu diterima' end; end if;
  if (select count(*) from public.fin_book_members where book_id = p_book and role <> 'owner') >= 10 then raise exception 'Maksimal 10 anggota per buku'; end if;
  insert into public.fin_book_members (book_id, user_id, role, pocket_ids, status, invited_by)
    values (p_book, v_target, p_role,
      case when p_role = 'recorder' and p_pockets is not null and cardinality(p_pockets) > 0
        then (select array_agg(id) from public.fin_pockets where book_id = p_book and id = any (p_pockets)) else null end,
      'invited', auth.uid());
  insert into public.notifications (user_id, title, body, url)
    select v_target, left(coalesce(p.full_name, 'Seseorang') || ' mengajak Anda mengelola "' || v_book.name || '"', 120),
           case when v_book.kind = 'family' then 'Keuangan keluarga bersama. Buka untuk menerima.' else 'Keuangan usaha bersama. Buka untuk menerima.' end, '/keuangan/buku'
    from public.profiles p where p.id = auth.uid();
  return v_target;
end $$;

create or replace function public.fin_book_respond(p_book uuid, p_accept boolean) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if p_accept then
    update public.fin_book_members set status = 'active', joined_at = now() where book_id = p_book and user_id = auth.uid() and status = 'invited';
  else
    delete from public.fin_book_members where book_id = p_book and user_id = auth.uid() and status = 'invited';
  end if;
  if not found then raise exception 'Undangan tidak ditemukan'; end if;
end $$;

-- Ubah peran & kantong yang boleh diakses (hanya pemilik).
create or replace function public.fin_book_set_member(p_book uuid, p_user uuid, p_role text, p_pockets uuid[] default null) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if public.fin_book_role(p_book) is distinct from 'owner' then raise exception 'Hanya pemilik buku yang bisa mengubah akses'; end if;
  if p_role not in ('manager', 'recorder') then raise exception 'Peran tidak valid'; end if;
  update public.fin_book_members set role = p_role,
    pocket_ids = case when p_role = 'recorder' and p_pockets is not null and cardinality(p_pockets) > 0
      then (select array_agg(id) from public.fin_pockets where book_id = p_book and id = any (p_pockets)) else null end
    where book_id = p_book and user_id = p_user and role <> 'owner';
end $$;

-- Keluarkan anggota (pemilik), batalkan undangan, atau keluar sendiri.
create or replace function public.fin_book_remove(p_book uuid, p_user uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if p_user <> auth.uid() and public.fin_book_role(p_book) is distinct from 'owner' then raise exception 'Hanya pemilik buku yang bisa mengeluarkan anggota'; end if;
  delete from public.fin_book_members where book_id = p_book and user_id = p_user and role <> 'owner';
end $$;

-- Buku yang bisa saya akses + undangan untuk saya.
create or replace function public.fin_my_books()
returns table (id uuid, kind text, name text, owner_id uuid, owner_name text, role text, status text, pocket_ids uuid[], owner_plus boolean, workspace_id uuid, members bigint)
language sql stable security definer set search_path = '' as $$
  select b.id, b.kind, b.name, b.owner_id, p.full_name, m.role, m.status, m.pocket_ids, public.fin_owner_plus(b.id), b.workspace_id,
    (select count(*) from public.fin_book_members x where x.book_id = b.id and x.status = 'active')
  from public.fin_book_members m join public.fin_books b on b.id = m.book_id
  left join public.profiles p on p.id = b.owner_id
  where m.user_id = auth.uid() and not b.archived
  order by case when b.owner_id = auth.uid() then 0 else 1 end, b.created_at;
$$;

-- Anggota buku + nama & username (hanya untuk sesama anggota).
create or replace function public.fin_book_people(p_book uuid)
returns table (user_id uuid, full_name text, username text, role text, status text, pocket_ids uuid[])
language sql stable security definer set search_path = '' as $$
  select m.user_id, p.full_name, p.username, m.role, m.status, m.pocket_ids
  from public.fin_book_members m join public.profiles p on p.id = m.user_id
  where m.book_id = p_book and public.fin_book_role(p_book) is not null
  order by case m.role when 'owner' then 0 when 'manager' then 1 else 2 end, m.status, p.full_name;
$$;

revoke execute on function public.fin_book_create, public.fin_book_invite, public.fin_book_respond, public.fin_book_set_member, public.fin_book_remove, public.fin_my_books, public.fin_book_people, public.fin_book_role, public.fin_can_pocket, public.fin_owner_plus from public, anon;
grant execute on function public.fin_book_create, public.fin_book_invite, public.fin_book_respond, public.fin_book_set_member, public.fin_book_remove, public.fin_my_books, public.fin_book_people, public.fin_book_role, public.fin_can_pocket, public.fin_owner_plus to authenticated;

-- =====================================================================
-- 6. Baris di tabel perbandingan paket (bisa diubah di Admin > Paket)
-- =====================================================================
insert into public.plan_features (key, label, description, free_limit, plus_limit, unit, enforced, sort) values
  ('fin_books', 'Buku usaha & keluarga', 'Usaha lebih dari 1, keuangan keluarga bersama pasangan, dan ajak staf keuangan mencatat. Yang diajak boleh akun gratis.', 1, null, 'buku', true, 32),
  ('fin_smart', 'Catat pintar (foto nota & ketik)', 'Foto nota atau ketik seperti chat, langsung terisi otomatis. Batas per hari.', 3, 50, 'kali/hari', true, 33)
on conflict (key) do nothing;
