-- EClub 014: target harian (produk gratis 3), profil domisili & ulang tahun, event per kota, kolaborasi/in-house.
-- Aman dijalankan ulang.

-- 1. Member gratis boleh menyimpan 3 produk (Plus tanpa batas).
drop policy if exists "produk plus tulis" on public.fin_products;
create policy "produk plus tulis" on public.fin_products for insert with check (
  auth.uid() = user_id and (public.has_plus() or public.is_staff()
    or (select count(*) from public.fin_products p where p.user_id = auth.uid()) < 3)
);

-- 2. Data diri: tanggal lahir & domisili (kode wilayah Kemendagri).
alter table public.profiles add column if not exists birth_date date;
alter table public.profiles add column if not exists province text;
alter table public.profiles add column if not exists regency text;
grant update (birth_date, province, regency) on public.profiles to authenticated;
create index if not exists profiles_regency_idx on public.profiles (regency);
insert into public.app_settings (key, value) values
  ('birthday_promo', '"Sebagai hadiah, nikmati potongan spesial EClub Plus minggu ini. Balas pesan ini untuk klaim promonya ya!"')
on conflict (key) do nothing;
update public.plan_features set description = 'Laba rugi otomatis, cetak PDF, produk tanpa batas (gratis: 3 produk)' where key = 'finance_reports';

-- 3. Event per kota: kolom domisili event + daftar event terdekat untuk halaman depan (publik).
alter table public.events add column if not exists regency text;
alter table public.events add column if not exists location text;
create or replace function public.public_events() returns table (id uuid, title text, speaker text, starts_at timestamptz, price integer, plus_price integer, regency text, location text)
language sql stable security definer set search_path = '' as $$
  select id, title, speaker, starts_at, price, plus_price, regency, location from public.events
  where published and starts_at > now() order by starts_at limit 3;
$$;
grant execute on function public.public_events to anon, authenticated;

-- 4. Permintaan in-house training & kolaborasi (dari halaman depan, tanpa login).
create table if not exists public.collab_inquiries (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('inhouse', 'workshop', 'speaker', 'partner', 'lainnya')),
  name text not null,
  organization text,
  whatsapp text not null,
  participants integer,
  city text,
  message text,
  status text not null default 'baru' check (status in ('baru', 'dihubungi', 'deal', 'batal')),
  created_at timestamptz not null default now()
);
alter table public.collab_inquiries enable row level security;
drop policy if exists "staf baca kolaborasi" on public.collab_inquiries;
create policy "staf baca kolaborasi" on public.collab_inquiries for select using (public.is_staff());
drop policy if exists "staf ubah kolaborasi" on public.collab_inquiries;
create policy "staf ubah kolaborasi" on public.collab_inquiries for update using (public.is_staff()) with check (public.is_staff());
grant select, update on public.collab_inquiries to authenticated;

create or replace function public.submit_inquiry(p_kind text, p_name text, p_org text, p_wa text, p_participants integer, p_city text, p_message text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  if coalesce(length(trim(p_name)), 0) < 2 or coalesce(length(regexp_replace(p_wa, '\D', '', 'g')), 0) < 9 then raise exception 'Isi nama dan nomor WhatsApp yang valid'; end if;
  if (select count(*) from public.collab_inquiries where created_at > now() - interval '1 hour') > 30 then raise exception 'Sedang banyak permintaan, coba lagi sebentar'; end if;
  insert into public.collab_inquiries (kind, name, organization, whatsapp, participants, city, message)
  values (case when p_kind in ('inhouse', 'workshop', 'speaker', 'partner') then p_kind else 'lainnya' end,
          left(trim(p_name), 80), left(nullif(trim(p_org), ''), 120), left(regexp_replace(p_wa, '[^\d+]', '', 'g'), 20),
          case when p_participants between 1 and 100000 then p_participants end, left(nullif(trim(p_city), ''), 80), left(nullif(trim(p_message), ''), 1000))
  returning id into v_id;
  return v_id;
end;
$$;
grant execute on function public.submit_inquiry to anon, authenticated;

-- Daftar event untuk member kini menyertakan kota & lokasi.
create or replace function public.events_overview() returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Silakan masuk'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('id', e.id, 'title', e.title, 'description', e.description, 'speaker', e.speaker, 'starts_at', e.starts_at,
      'duration_min', e.duration_min, 'price', e.price, 'plus_price', e.plus_price, 'capacity', e.capacity, 'regency', e.regency, 'location', e.location,
      'seats', (select count(*) from public.event_registrations r where r.event_id = e.id and r.status = 'confirmed'),
      'registered', r.status = 'confirmed',
      'meet_link', case when r.status = 'confirmed' then e.meet_link end,
      'recording_url', case when r.status = 'confirmed' or public.has_plus() then e.recording_url end) order by e.starts_at desc)
    from public.events e left join public.event_registrations r on r.event_id = e.id and r.user_id = auth.uid()
    where e.published and e.starts_at > now() - interval '120 days'), '[]'::jsonb);
end;
$$;
