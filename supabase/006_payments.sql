-- EClub tahap 6: pesanan & pembayaran (Moota: transfer bank dengan kode unik)
-- Cara pakai: Supabase > SQL Editor > New query > tempel seluruh isi file ini > Run.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product text not null check (product in ('plus_monthly', 'plus_yearly', 'course')),
  course_id uuid references public.courses (id) on delete set null,
  title text not null,
  base_amount integer not null check (base_amount > 0),
  unique_code integer not null default 0,
  amount integer not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'expired', 'cancelled')),
  provider text not null default 'moota',
  provider_ref text,
  expires_at timestamptz not null default now() + interval '24 hours',
  paid_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists orders_user_idx on public.orders (user_id, created_at desc);
create index if not exists orders_pending_amount_idx on public.orders (amount) where status = 'pending';

-- Log mutasi dari penyedia pembayaran (mencegah diproses dua kali)
create table if not exists public.payment_events (
  id bigint generated always as identity primary key,
  provider text not null,
  ref text not null,
  amount integer,
  order_id uuid references public.orders (id),
  raw jsonb,
  created_at timestamptz not null default now(),
  unique (provider, ref)
);

alter table public.orders enable row level security;
alter table public.payment_events enable row level security;

drop policy if exists "pesanan milik sendiri" on public.orders;
create policy "pesanan milik sendiri" on public.orders for select using (auth.uid() = user_id or public.is_staff());
drop policy if exists "staff lihat event" on public.payment_events;
create policy "staff lihat event" on public.payment_events for select using (public.is_staff());
grant select on public.orders, public.payment_events to authenticated;

insert into public.app_settings (key, value) values
  ('bank_accounts', '""'),
  ('order_expiry_hours', '24')
on conflict (key) do nothing;

-- Membuat pesanan dengan kode unik 1–499 agar nominal transfer bisa dicocokkan otomatis
create or replace function public.create_order(p_product text, p_course_slug text default null)
returns public.orders
language plpgsql security definer set search_path = '' as $$
declare
  v_base integer;
  v_title text;
  v_course uuid;
  v_code integer;
  v_hours integer;
  v_order public.orders;
begin
  if auth.uid() is null then raise exception 'Silakan masuk terlebih dahulu'; end if;

  if p_product = 'plus_monthly' then
    select (value #>> '{}')::integer into v_base from public.app_settings where key = 'plus_price_monthly';
    v_title := 'EClub Plus · 1 bulan';
  elsif p_product = 'plus_yearly' then
    select (value #>> '{}')::integer into v_base from public.app_settings where key = 'plus_price_yearly';
    v_title := 'EClub Plus · 1 tahun';
  elsif p_product = 'course' then
    select id, price, title into v_course, v_base, v_title from public.courses
      where slug = p_course_slug and status = 'published' and access = 'purchase';
    if v_course is null then raise exception 'Course tidak tersedia untuk dibeli'; end if;
    if exists (select 1 from public.course_entitlements where user_id = auth.uid() and course_id = v_course) then
      raise exception 'Anda sudah memiliki course ini';
    end if;
  else
    raise exception 'Produk tidak dikenal';
  end if;
  if coalesce(v_base, 0) <= 0 then raise exception 'Harga belum diatur'; end if;

  -- Pakai ulang pesanan yang masih menunggu untuk produk yang sama
  select * into v_order from public.orders
    where user_id = auth.uid() and product = p_product and coalesce(course_id::text, '') = coalesce(v_course::text, '')
      and status = 'pending' and expires_at > now()
    order by created_at desc limit 1;
  if found then return v_order; end if;

  update public.orders set status = 'expired' where status = 'pending' and expires_at <= now();

  select coalesce((value #>> '{}')::integer, 24) into v_hours from public.app_settings where key = 'order_expiry_hours';
  for i in 1..50 loop
    v_code := 1 + floor(random() * 499)::integer;
    exit when not exists (select 1 from public.orders where status = 'pending' and amount = v_base + v_code);
    v_code := null;
  end loop;
  if v_code is null then raise exception 'Sistem sedang sibuk, coba lagi sebentar'; end if;

  insert into public.orders (user_id, product, course_id, title, base_amount, unique_code, amount, expires_at)
  values (auth.uid(), p_product, v_course, v_title, v_base, v_code, v_base + v_code, now() + make_interval(hours => coalesce(v_hours, 24)))
  returning * into v_order;
  return v_order;
end;
$$;

-- Menandai lunas + memberikan hak akses. Dipanggil webhook (service role) atau admin.
create or replace function public.fulfill_order(p_order uuid, p_provider text, p_ref text)
returns void
language plpgsql security definer set search_path = '' as $$
declare
  o public.orders;
  base_time timestamptz;
begin
  select * into o from public.orders where id = p_order for update;
  if not found or o.status = 'paid' then return; end if;
  update public.orders set status = 'paid', paid_at = now(), provider = p_provider, provider_ref = p_ref where id = o.id;

  if o.product in ('plus_monthly', 'plus_yearly') then
    select greatest(now(), coalesce(case when plan = 'plus' then plan_expires_at end, now())) into base_time
      from public.profiles where id = o.user_id;
    update public.profiles
      set plan = 'plus',
          plan_expires_at = base_time + case when o.product = 'plus_yearly' then interval '1 year' else interval '1 month' end,
          updated_at = now()
      where id = o.user_id;
  elsif o.product = 'course' and o.course_id is not null then
    insert into public.course_entitlements (user_id, course_id, source) values (o.user_id, o.course_id, 'order')
    on conflict do nothing;
  end if;
end;
$$;

-- Mencocokkan mutasi masuk dengan pesanan berdasarkan nominal unik
create or replace function public.apply_bank_mutation(p_provider text, p_ref text, p_amount integer, p_raw jsonb)
returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_order uuid;
begin
  if auth.role() <> 'service_role' then raise exception 'Akses ditolak'; end if;
  begin
    insert into public.payment_events (provider, ref, amount, raw) values (p_provider, p_ref, p_amount, p_raw);
  exception when unique_violation then
    return null; -- sudah pernah diproses
  end;
  select id into v_order from public.orders
    where status = 'pending' and amount = p_amount and expires_at > now() - interval '6 hours'
    order by created_at limit 1;
  if v_order is null then return null; end if;
  update public.payment_events set order_id = v_order where provider = p_provider and ref = p_ref;
  perform public.fulfill_order(v_order, p_provider, p_ref);
  return v_order;
end;
$$;

create or replace function public.admin_mark_paid(p_order uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform public.require_admin();
  perform public.fulfill_order(p_order, 'manual', 'admin:' || auth.uid()::text);
end;
$$;

create or replace function public.admin_cancel_order(p_order uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform public.require_admin();
  update public.orders set status = 'cancelled' where id = p_order and status = 'pending';
end;
$$;

revoke execute on function public.fulfill_order, public.apply_bank_mutation from public, anon, authenticated;
grant execute on function public.apply_bank_mutation to service_role;
revoke execute on function public.create_order, public.admin_mark_paid, public.admin_cancel_order from public, anon;
grant execute on function public.create_order, public.admin_mark_paid, public.admin_cancel_order to authenticated;
