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

-- ============ 2. Affiliate / referral ============
alter table public.profiles add column if not exists ref_code text unique;

create table if not exists public.referrals (
  user_id uuid primary key references auth.users (id) on delete cascade,
  referrer_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  check (user_id <> referrer_id)
);
create index if not exists referrals_referrer_idx on public.referrals (referrer_id);

create table if not exists public.affiliate_commissions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders (id) on delete cascade,
  referrer_id uuid not null references auth.users (id) on delete cascade,
  buyer_id uuid not null references auth.users (id) on delete cascade,
  product text not null,
  order_amount bigint not null,
  amount bigint not null,
  status text not null default 'active' check (status in ('active', 'cancelled')),
  available_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists aff_comm_referrer_idx on public.affiliate_commissions (referrer_id);

create table if not exists public.affiliate_payouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  amount bigint not null check (amount > 0 and amount % 100000 = 0),
  bank text not null,
  status text not null default 'requested' check (status in ('requested', 'paid', 'rejected')),
  note text,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);
create index if not exists aff_payout_user_idx on public.affiliate_payouts (user_id);

alter table public.referrals enable row level security;
alter table public.affiliate_commissions enable row level security;
alter table public.affiliate_payouts enable row level security;
-- Semua akses lewat fungsi di bawah (tanpa policy = tertutup untuk akses langsung).

insert into public.app_settings (key, value) values ('affiliate_rate', '20'), ('affiliate_hold_days', '7'), ('affiliate_months', '12')
on conflict (key) do nothing;

-- Catat siapa yang mengajak saat akun baru dibuat (kode dari metadata pendaftaran).
create or replace function public.capture_referral() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_ref uuid;
begin
  if new.raw_user_meta_data ? 'ref' then
    select id into v_ref from public.profiles where ref_code = upper(new.raw_user_meta_data ->> 'ref');
    if v_ref is not null and v_ref <> new.id then
      insert into public.referrals (user_id, referrer_id) values (new.id, v_ref) on conflict do nothing;
    end if;
  end if;
  return new;
exception when others then return new; -- jangan pernah menggagalkan pendaftaran
end;
$$;
drop trigger if exists on_auth_user_referral on auth.users;
create trigger on_auth_user_referral after insert on auth.users for each row execute function public.capture_referral();

-- Komisi otomatis saat pesanan orang yang diajak berstatus "paid".
create or replace function public.affiliate_on_paid() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_ref uuid; v_joined timestamptz; v_rate int; v_hold int; v_months int;
begin
  if new.status = 'paid' and old.status is distinct from 'paid' then
    select referrer_id, created_at into v_ref, v_joined from public.referrals where user_id = new.user_id;
    if v_ref is null then return new; end if;
    select coalesce((select (value #>> '{}')::int from public.app_settings where key = 'affiliate_rate'), 20),
           coalesce((select (value #>> '{}')::int from public.app_settings where key = 'affiliate_hold_days'), 7),
           coalesce((select (value #>> '{}')::int from public.app_settings where key = 'affiliate_months'), 12)
      into v_rate, v_hold, v_months;
    if v_joined < now() - make_interval(months => v_months) then return new; end if;
    -- hanya member Plus aktif (atau tim EClub) yang mendapat komisi
    if not exists (select 1 from public.profiles where id = v_ref and (
         (plan = 'plus' and (plan_expires_at is null or plan_expires_at > now())) or role in ('admin', 'super_admin'))) then
      return new;
    end if;
    insert into public.affiliate_commissions (order_id, referrer_id, buyer_id, product, order_amount, amount, available_at)
    values (new.id, v_ref, new.user_id, new.product, new.base_amount, floor(new.base_amount * v_rate / 100.0), now() + make_interval(days => v_hold))
    on conflict (order_id) do nothing;
  elsif old.status = 'paid' and new.status <> 'paid' then
    update public.affiliate_commissions set status = 'cancelled' where order_id = new.id;
  end if;
  return new;
end;
$$;
drop trigger if exists orders_affiliate on public.orders;
create trigger orders_affiliate after update of status on public.orders for each row execute function public.affiliate_on_paid();

create or replace function public.aff_balance(p_user uuid)
returns table (pending bigint, available bigint, requested bigint, paid bigint)
language sql stable security definer set search_path = '' as $$
  with c as (
    select coalesce(sum(amount) filter (where available_at > now()), 0) as pending,
           coalesce(sum(amount) filter (where available_at <= now()), 0) as earned
    from public.affiliate_commissions where referrer_id = p_user and status = 'active'
  ), p as (
    select coalesce(sum(amount) filter (where status = 'requested'), 0) as requested,
           coalesce(sum(amount) filter (where status = 'paid'), 0) as paid
    from public.affiliate_payouts where user_id = p_user
  )
  select c.pending::bigint, (c.earned - p.requested - p.paid)::bigint, p.requested::bigint, p.paid::bigint from c, p;
$$;
revoke execute on function public.aff_balance from public, anon, authenticated;

-- Dasbor affiliate milik sendiri (membuat kode bila belum ada).
create or replace function public.my_affiliate() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid(); v_code text; v_name text; b record;
begin
  if v_uid is null then raise exception 'Silakan masuk'; end if;
  select ref_code, full_name into v_code, v_name from public.profiles where id = v_uid;
  if v_code is null then
    for i in 1..20 loop
      v_code := upper(left(regexp_replace(coalesce(split_part(v_name, ' ', 1), 'EC'), '[^A-Za-z]', '', 'g') || 'EC', 6)) || (100 + floor(random() * 900))::int;
      begin
        update public.profiles set ref_code = v_code where id = v_uid;
        exit;
      exception when unique_violation then v_code := null;
      end;
    end loop;
  end if;
  select * into b from public.aff_balance(v_uid);
  return jsonb_build_object(
    'code', v_code,
    'referrals', (select count(*) from public.referrals where referrer_id = v_uid),
    'buyers', (select count(distinct buyer_id) from public.affiliate_commissions where referrer_id = v_uid and status = 'active'),
    'pending', b.pending, 'available', b.available, 'requested', b.requested, 'paid', b.paid,
    'commissions', coalesce((select jsonb_agg(x order by x->>'created_at' desc) from (
        select jsonb_build_object('created_at', c.created_at, 'product', c.product, 'amount', c.amount, 'status', c.status, 'available_at', c.available_at,
          'buyer', coalesce(left(split_part(p.full_name, ' ', 1), 1) || repeat('•', 3), 'Member')) as x
        from public.affiliate_commissions c left join public.profiles p on p.id = c.buyer_id
        where c.referrer_id = v_uid order by c.created_at desc limit 50) s), '[]'::jsonb),
    'payouts', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'amount', amount, 'status', status, 'note', note, 'created_at', created_at) order by created_at desc)
        from public.affiliate_payouts where user_id = v_uid), '[]'::jsonb)
  );
end;
$$;
grant execute on function public.my_affiliate to authenticated;

create or replace function public.request_payout(p_amount bigint, p_bank text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_avail bigint; v_id uuid;
begin
  if auth.uid() is null then raise exception 'Silakan masuk'; end if;
  if p_amount is null or p_amount < 100000 or p_amount % 100000 <> 0 then raise exception 'Pencairan harus kelipatan Rp100.000'; end if;
  if coalesce(length(trim(p_bank)), 0) < 8 then raise exception 'Isi bank, nomor rekening, dan nama pemilik'; end if;
  perform pg_advisory_xact_lock(hashtext(auth.uid()::text));
  select available into v_avail from public.aff_balance(auth.uid());
  if p_amount > v_avail then raise exception 'Saldo yang bisa dicairkan belum cukup'; end if;
  insert into public.affiliate_payouts (user_id, amount, bank) values (auth.uid(), p_amount, left(trim(p_bank), 200)) returning id into v_id;
  return v_id;
end;
$$;
grant execute on function public.request_payout to authenticated;

create or replace function public.admin_payouts() returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_staff() then raise exception 'Tidak diizinkan'; end if;
  return jsonb_build_object(
    'payouts', coalesce((select jsonb_agg(jsonb_build_object('id', o.id, 'user_id', o.user_id, 'name', p.full_name, 'whatsapp', p.whatsapp, 'amount', o.amount, 'bank', o.bank,
        'status', o.status, 'note', o.note, 'created_at', o.created_at, 'processed_at', o.processed_at) order by (o.status = 'requested') desc, o.created_at desc)
      from public.affiliate_payouts o left join public.profiles p on p.id = o.user_id), '[]'::jsonb),
    'top', coalesce((select jsonb_agg(t order by (t->>'earned')::bigint desc) from (
        select jsonb_build_object('name', p.full_name, 'code', p.ref_code, 'referrals', (select count(*) from public.referrals r where r.referrer_id = p.id),
          'earned', coalesce(sum(c.amount), 0)) as t
        from public.profiles p join public.affiliate_commissions c on c.referrer_id = p.id and c.status = 'active'
        group by p.id order by sum(c.amount) desc limit 20) s), '[]'::jsonb),
    'total_commission', (select coalesce(sum(amount), 0) from public.affiliate_commissions where status = 'active'),
    'total_paid', (select coalesce(sum(amount), 0) from public.affiliate_payouts where status = 'paid')
  );
end;
$$;
grant execute on function public.admin_payouts to authenticated;

create or replace function public.admin_process_payout(p_id uuid, p_status text, p_note text default null) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_user uuid;
begin
  if not public.is_staff() then raise exception 'Tidak diizinkan'; end if;
  if p_status not in ('paid', 'rejected') then raise exception 'Status tidak valid'; end if;
  update public.affiliate_payouts set status = p_status, note = nullif(trim(p_note), ''), processed_at = now()
    where id = p_id and status = 'requested' returning user_id into v_user;
  if v_user is null then raise exception 'Permintaan tidak ditemukan atau sudah diproses'; end if;
  return v_user;
end;
$$;
grant execute on function public.admin_process_payout to authenticated;

-- ============ 3. Pesanan untuk mentoring & event ============
alter table public.orders add column if not exists ref_id uuid;
alter table public.orders drop constraint if exists orders_product_check;
alter table public.orders add constraint orders_product_check check (product in ('plus_monthly', 'plus_yearly', 'course', 'disc_report', 'mentoring', 'event'));

create or replace function public._make_order(p_product text, p_ref uuid, p_title text, p_base integer)
returns public.orders
language plpgsql security definer set search_path = '' as $$
declare v_order public.orders; v_code integer; v_hours integer;
begin
  select * into v_order from public.orders
    where user_id = auth.uid() and product = p_product and ref_id = p_ref and status = 'pending' and expires_at > now()
    order by created_at desc limit 1;
  if found then return v_order; end if;
  update public.orders set status = 'expired' where status = 'pending' and expires_at <= now();
  select coalesce((value #>> '{}')::integer, 24) into v_hours from public.app_settings where key = 'order_expiry_hours';
  for i in 1..50 loop
    v_code := 1 + floor(random() * 499)::integer;
    exit when not exists (select 1 from public.orders where status = 'pending' and amount = p_base + v_code);
    v_code := null;
  end loop;
  if v_code is null then raise exception 'Sistem sedang sibuk, coba lagi sebentar'; end if;
  insert into public.orders (user_id, product, ref_id, title, base_amount, unique_code, amount, expires_at)
  values (auth.uid(), p_product, p_ref, p_title, p_base, v_code, p_base + v_code, now() + make_interval(hours => coalesce(v_hours, 24)))
  returning * into v_order;
  return v_order;
end;
$$;
revoke execute on function public._make_order from public, anon, authenticated;

-- ============ 4. Mentoring 1-on-1 ============
create table if not exists public.mentoring_slots (
  id uuid primary key default gen_random_uuid(),
  mentor text not null,
  topic text not null default 'Mentoring bisnis 1-on-1',
  starts_at timestamptz not null,
  duration_min integer not null default 60 check (duration_min between 15 and 240),
  price integer not null default 0 check (price >= 0),
  plus_price integer not null default 0 check (plus_price >= 0),
  meet_link text,
  created_at timestamptz not null default now()
);
create table if not exists public.mentoring_bookings (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references public.mentoring_slots (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  order_id uuid references public.orders (id) on delete set null,
  goal text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'done')),
  reminded boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index if not exists mentoring_one_confirmed on public.mentoring_bookings (slot_id) where status in ('confirmed', 'done');
alter table public.mentoring_slots enable row level security;
alter table public.mentoring_bookings enable row level security;
drop policy if exists "staf kelola slot" on public.mentoring_slots;
create policy "staf kelola slot" on public.mentoring_slots for all using (public.is_staff()) with check (public.is_staff());
grant select, insert, update, delete on public.mentoring_slots to authenticated;

create or replace function public._slot_taken(p_slot uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.mentoring_bookings b left join public.orders o on o.id = b.order_id
    where b.slot_id = p_slot and (b.status in ('confirmed', 'done') or (b.status = 'pending' and o.status = 'pending' and o.expires_at > now() and b.user_id <> coalesce(auth.uid(), gen_random_uuid())))
  );
$$;

create or replace function public.mentoring_overview() returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Silakan masuk'; end if;
  return jsonb_build_object(
    'slots', coalesce((select jsonb_agg(jsonb_build_object('id', s.id, 'mentor', s.mentor, 'topic', s.topic, 'starts_at', s.starts_at, 'duration_min', s.duration_min,
        'price', s.price, 'plus_price', s.plus_price) order by s.starts_at)
      from public.mentoring_slots s where s.starts_at > now() + interval '2 hours' and not public._slot_taken(s.id)), '[]'::jsonb),
    'mine', coalesce((select jsonb_agg(jsonb_build_object('id', b.id, 'status', b.status, 'goal', b.goal, 'order_id', b.order_id, 'order_status', o.status,
        'mentor', s.mentor, 'topic', s.topic, 'starts_at', s.starts_at, 'duration_min', s.duration_min,
        'meet_link', case when b.status in ('confirmed', 'done') then s.meet_link end) order by s.starts_at desc)
      from public.mentoring_bookings b join public.mentoring_slots s on s.id = b.slot_id left join public.orders o on o.id = b.order_id
      where b.user_id = auth.uid() and b.status <> 'cancelled' and (b.status <> 'pending' or (o.status = 'pending' and o.expires_at > now()))), '[]'::jsonb)
  );
end;
$$;
grant execute on function public.mentoring_overview to authenticated;

-- Pesan slot. Mengembalikan id pesanan bila perlu bayar, atau null bila langsung terkonfirmasi (gratis).
create or replace function public.book_mentoring(p_slot uuid, p_goal text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare s public.mentoring_slots; v_price integer; v_order public.orders; v_existing uuid;
begin
  if auth.uid() is null then raise exception 'Silakan masuk'; end if;
  perform pg_advisory_xact_lock(hashtext(p_slot::text));
  select * into s from public.mentoring_slots where id = p_slot;
  if not found or s.starts_at <= now() + interval '2 hours' then raise exception 'Jadwal ini sudah tidak tersedia'; end if;
  if public._slot_taken(p_slot) then raise exception 'Maaf, jadwal ini baru saja dipesan orang lain'; end if;
  v_price := case when public.has_plus() then s.plus_price else s.price end;
  select id into v_existing from public.mentoring_bookings where slot_id = p_slot and user_id = auth.uid() and status = 'pending';
  if v_price <= 0 then
    if v_existing is not null then
      update public.mentoring_bookings set status = 'confirmed', goal = left(p_goal, 500) where id = v_existing;
    else
      insert into public.mentoring_bookings (slot_id, user_id, goal, status) values (p_slot, auth.uid(), left(p_goal, 500), 'confirmed');
    end if;
    return null;
  end if;
  v_order := public._make_order('mentoring', p_slot, 'Mentoring 1-on-1 · ' || s.mentor || ' · ' || to_char(s.starts_at at time zone 'Asia/Jakarta', 'DD/MM HH24:MI'), v_price);
  if v_existing is not null then
    update public.mentoring_bookings set order_id = v_order.id, goal = left(p_goal, 500) where id = v_existing;
  else
    insert into public.mentoring_bookings (slot_id, user_id, order_id, goal) values (p_slot, auth.uid(), v_order.id, left(p_goal, 500));
  end if;
  return v_order.id;
end;
$$;
grant execute on function public.book_mentoring to authenticated;

create or replace function public.admin_mentoring() returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_staff() then raise exception 'Tidak diizinkan'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('id', s.id, 'mentor', s.mentor, 'topic', s.topic, 'starts_at', s.starts_at, 'duration_min', s.duration_min,
      'price', s.price, 'plus_price', s.plus_price, 'meet_link', s.meet_link,
      'booking', (select jsonb_build_object('id', b.id, 'name', p.full_name, 'whatsapp', p.whatsapp, 'goal', b.goal, 'status', b.status)
                  from public.mentoring_bookings b left join public.profiles p on p.id = b.user_id
                  where b.slot_id = s.id and b.status in ('confirmed', 'done') limit 1)) order by s.starts_at desc)
    from public.mentoring_slots s where s.starts_at > now() - interval '60 days'), '[]'::jsonb);
end;
$$;
grant execute on function public.admin_mentoring to authenticated;

-- ============ 5. Event & webinar ============
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  speaker text,
  starts_at timestamptz not null,
  duration_min integer not null default 90,
  price integer not null default 0 check (price >= 0),
  plus_price integer not null default 0 check (plus_price >= 0),
  capacity integer check (capacity is null or capacity > 0),
  meet_link text,
  recording_url text,
  published boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.event_registrations (
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  order_id uuid references public.orders (id) on delete set null,
  status text not null default 'confirmed' check (status in ('pending', 'confirmed')),
  reminded boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;
drop policy if exists "staf kelola event" on public.events;
create policy "staf kelola event" on public.events for all using (public.is_staff()) with check (public.is_staff());
grant select, insert, update, delete on public.events to authenticated;

create or replace function public.events_overview() returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Silakan masuk'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('id', e.id, 'title', e.title, 'description', e.description, 'speaker', e.speaker, 'starts_at', e.starts_at,
      'duration_min', e.duration_min, 'price', e.price, 'plus_price', e.plus_price, 'capacity', e.capacity,
      'seats', (select count(*) from public.event_registrations r where r.event_id = e.id and r.status = 'confirmed'),
      'registered', r.status = 'confirmed',
      'meet_link', case when r.status = 'confirmed' then e.meet_link end,
      'recording_url', case when r.status = 'confirmed' or public.has_plus() then e.recording_url end) order by e.starts_at desc)
    from public.events e left join public.event_registrations r on r.event_id = e.id and r.user_id = auth.uid()
    where e.published and e.starts_at > now() - interval '120 days'), '[]'::jsonb);
end;
$$;
grant execute on function public.events_overview to authenticated;

create or replace function public.register_event(p_event uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare e public.events; v_price integer; v_order public.orders; v_seats integer;
begin
  if auth.uid() is null then raise exception 'Silakan masuk'; end if;
  perform pg_advisory_xact_lock(hashtext(p_event::text));
  select * into e from public.events where id = p_event and published;
  if not found or e.starts_at + make_interval(mins => e.duration_min) < now() then raise exception 'Event sudah selesai'; end if;
  if exists (select 1 from public.event_registrations where event_id = p_event and user_id = auth.uid() and status = 'confirmed') then return null; end if;
  select count(*) into v_seats from public.event_registrations where event_id = p_event and status = 'confirmed';
  if e.capacity is not null and v_seats >= e.capacity then raise exception 'Maaf, kursi sudah penuh'; end if;
  v_price := case when public.has_plus() then e.plus_price else e.price end;
  if v_price <= 0 then
    insert into public.event_registrations (event_id, user_id, status) values (p_event, auth.uid(), 'confirmed')
    on conflict (event_id, user_id) do update set status = 'confirmed';
    return null;
  end if;
  v_order := public._make_order('event', p_event, 'Event · ' || e.title, v_price);
  insert into public.event_registrations (event_id, user_id, order_id, status) values (p_event, auth.uid(), v_order.id, 'pending')
  on conflict (event_id, user_id) do update set order_id = excluded.order_id;
  return v_order.id;
end;
$$;
grant execute on function public.register_event to authenticated;

create or replace function public.admin_event_attendees(p_event uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_staff() then raise exception 'Tidak diizinkan'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('name', p.full_name, 'whatsapp', p.whatsapp, 'at', r.created_at) order by r.created_at)
    from public.event_registrations r left join public.profiles p on p.id = r.user_id where r.event_id = p_event and r.status = 'confirmed'), '[]'::jsonb);
end;
$$;
grant execute on function public.admin_event_attendees to authenticated;

-- Aktifkan mentoring / event saat pesanannya lunas.
create or replace function public.orders_fulfill_items() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.status = 'paid' and old.status is distinct from 'paid' then
    if new.product = 'mentoring' then
      begin
        update public.mentoring_bookings set status = 'confirmed' where order_id = new.id and status = 'pending';
      exception when unique_violation then null; -- slot sudah diambil orang lain: admin menjadwalkan ulang manual
      end;
    elsif new.product = 'event' then
      update public.event_registrations set status = 'confirmed' where order_id = new.id;
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists orders_fulfill_items on public.orders;
create trigger orders_fulfill_items after update of status on public.orders for each row execute function public.orders_fulfill_items();
