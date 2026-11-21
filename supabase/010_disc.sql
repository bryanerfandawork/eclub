-- EClub 010: Tes DISC (menggantikan Wheel of Life) + Laporan Lengkap DISC berbayar
-- Hasil tes disimpan di assessment_results (assessment_key = 'disc').

create table if not exists public.report_unlocks (
  user_id uuid not null references auth.users (id) on delete cascade,
  report_key text not null,
  source text not null default 'order',
  created_at timestamptz not null default now(),
  primary key (user_id, report_key)
);
alter table public.report_unlocks enable row level security;
drop policy if exists "unlock milik sendiri" on public.report_unlocks;
create policy "unlock milik sendiri" on public.report_unlocks for select using (auth.uid() = user_id or public.is_staff());
grant select on public.report_unlocks to authenticated;

-- Harga laporan (bisa diubah admin)
insert into public.app_settings (key, value) values ('disc_report_price', '29000') on conflict (key) do nothing;

-- Paket & fitur: laporan lengkap DISC (Gratis terkunci, Plus termasuk). Wheel of Life tidak dipakai lagi.
insert into public.plan_features (key, label, description, free_limit, plus_limit, unit, enforced, sort)
values ('disc_report', 'Laporan lengkap DISC', 'Interpretasi mendalam, rekomendasi karier & bisnis', 0, null, null, true, 45)
on conflict (key) do nothing;
delete from public.plan_features where key = 'wheel_history';

-- Produk baru di pesanan
alter table public.orders drop constraint if exists orders_product_check;
alter table public.orders add constraint orders_product_check check (product in ('plus_monthly', 'plus_yearly', 'course', 'disc_report'));

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
  elsif p_product = 'disc_report' then
    if exists (select 1 from public.report_unlocks where user_id = auth.uid() and report_key = 'disc') then
      raise exception 'Anda sudah memiliki laporan ini';
    end if;
    select (value #>> '{}')::integer into v_base from public.app_settings where key = 'disc_report_price';
    v_title := 'Laporan Lengkap DISC';
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
  elsif o.product = 'disc_report' then
    insert into public.report_unlocks (user_id, report_key, source) values (o.user_id, 'disc', 'order')
    on conflict do nothing;
  end if;
end;
$$;
revoke execute on function public.fulfill_order from public, anon, authenticated;
