-- 030: Kupon 50% untuk Plus, kode umum NEWECLUB, harga baru, dan Plus yang lebih kuat.
-- Jalankan SETELAH PR-nya di-merge. Aman dijalankan ulang.

-- 1. Harga & kupon (semua bisa diubah lagi di Admin > Paket)
insert into public.app_settings (key, value) values
  ('plus_price_monthly', '158000'), ('plus_price_yearly', '1380000'), ('coupon_discount', '50')
on conflict (key) do update set value = excluded.value;
insert into public.app_settings (key, value) values
  ('coupon_discount_other', '10'), ('general_coupon_code', '"NEWECLUB"')
on conflict (key) do nothing;

-- 2. Pakai kupon.
--    Kode member Plus  -> pembeli dapat potongan, pemilik kode dapat komisi.
--    Kode umum (NEWECLUB) -> pembeli dapat potongan yang sama. Komisi tetap ke affiliate
--    yang mengajak (link ?ref yang dibawa, atau yang tercatat saat daftar).
--    Paket Plus memakai coupon_discount (50%), produk lain coupon_discount_other (10%).
drop function if exists public.apply_coupon(uuid, text);
create or replace function public.apply_coupon(p_order uuid, p_code text, p_ref text default null) returns public.orders
language plpgsql security definer set search_path = '' as $$
declare o public.orders; v_owner uuid; v_pct int; v_base int; v_disc int; v_code int; v_c text := upper(trim(coalesce(p_code, ''))); v_general text;
begin
  if auth.uid() is null then raise exception 'Silakan masuk'; end if;
  select * into o from public.orders where id = p_order and user_id = auth.uid() for update;
  if not found or o.status <> 'pending' or o.expires_at <= now() then raise exception 'Pesanan tidak bisa diubah'; end if;
  if o.coupon_code is not null then raise exception 'Kupon sudah dipakai di pesanan ini'; end if;
  if v_c = '' then raise exception 'Masukkan kode kupon'; end if;
  select upper(trim(coalesce((select value #>> '{}' from public.app_settings where key = 'general_coupon_code'), ''))) into v_general;

  if v_general <> '' and v_c = v_general then
    -- Kode umum: cari affiliate yang mengajak (link yang dibawa dulu, lalu catatan saat daftar).
    if p_ref is not null and trim(p_ref) <> '' then
      select id into v_owner from public.profiles
        where ref_code = upper(trim(p_ref)) and id <> auth.uid()
          and ((plan = 'plus' and (plan_expires_at is null or plan_expires_at > now())) or role in ('admin', 'super_admin'));
    end if;
    if v_owner is null then
      select r.referrer_id into v_owner from public.referrals r where r.user_id = auth.uid();
    end if;
  else
    select id into v_owner from public.profiles
      where ref_code = v_c
        and ((plan = 'plus' and (plan_expires_at is null or plan_expires_at > now())) or role in ('admin', 'super_admin'));
    if v_owner is null then raise exception 'Kode kupon tidak valid atau sudah tidak aktif'; end if;
    if v_owner = auth.uid() then raise exception 'Kupon milik sendiri tidak bisa dipakai'; end if;
  end if;

  if o.product like 'plus%' then
    select coalesce((select (value #>> '{}')::int from public.app_settings where key = 'coupon_discount'), 50) into v_pct;
  else
    select coalesce((select (value #>> '{}')::int from public.app_settings where key = 'coupon_discount_other'), 10) into v_pct;
  end if;
  v_disc := floor(o.base_amount * least(greatest(v_pct, 0), 90) / 100.0);
  v_base := o.base_amount - v_disc;
  for i in 1..50 loop
    v_code := 1 + floor(random() * 499)::integer;
    exit when not exists (select 1 from public.orders where status = 'pending' and amount = v_base + v_code and id <> o.id);
    v_code := null;
  end loop;
  if v_code is null then raise exception 'Sistem sedang sibuk, coba lagi sebentar'; end if;
  update public.orders set base_amount = v_base, discount = v_disc, unique_code = v_code, amount = v_base + v_code,
      coupon_code = v_c, coupon_referrer = case when v_owner = auth.uid() then null else v_owner end
    where id = o.id returning * into o;
  return o;
end;
$$;
revoke execute on function public.apply_coupon(uuid, text, text) from public, anon;
grant execute on function public.apply_coupon(uuid, text, text) to authenticated;

-- 3. Paket: catat lewat chat khusus Plus, buku usaha tambahan & keluarga khusus Plus, bantuan prioritas.
update public.plan_features set label = 'Asisten Catat (catat lewat chat)',
  description = 'Cukup cerita transaksi Anda seperti chat, asisten yang mengisi dan merapikan laporan keuangan. Paket gratis mencatat lewat formulir.',
  free_limit = 0, plus_limit = null, unit = null
  where key = 'fin_smart';
update public.plan_features set label = 'Usaha tambahan & keuangan keluarga',
  description = 'Gratis: 1 buku usaha. Plus: tambah usaha tanpa batas, keuangan keluarga bersama pasangan, dan ajak staf ikut mencatat (yang diajak boleh akun gratis).'
  where key = 'fin_books';
insert into public.plan_features (key, label, description, free_limit, plus_limit, unit, enforced, sort) values
  ('priority_support', 'Bantuan prioritas WhatsApp', 'Tanya langsung ke tim EClub lewat WhatsApp, dijawab lebih dulu', 0, null, null, true, 92)
on conflict (key) do nothing;
