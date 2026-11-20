-- EClub tahap 4: hasil assessment (8 Wheel Entrepreneur), paket Gratis/Plus, dan Super Admin
-- Cara pakai: Supabase > SQL Editor > New query > tempel seluruh isi file ini > Run.

create table if not exists public.assessment_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  assessment_key text not null,
  answers jsonb not null,
  scores jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists assessment_user_idx on public.assessment_results (user_id, assessment_key, created_at desc);

alter table public.assessment_results enable row level security;

drop policy if exists "hasil milik sendiri" on public.assessment_results;
create policy "hasil milik sendiri" on public.assessment_results
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, delete on public.assessment_results to authenticated;

-- =====================================================================
-- Paket (Gratis / Plus), peran pengguna, dan Super Admin
-- =====================================================================

-- Peran & paket disimpan di profil
alter table public.profiles add column if not exists role text not null default 'member';
alter table public.profiles add column if not exists plan text not null default 'free';
alter table public.profiles add column if not exists plan_expires_at timestamptz;
do $$ begin
  alter table public.profiles add constraint profiles_role_check check (role in ('member', 'mentor', 'admin', 'super_admin'));
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.profiles add constraint profiles_plan_check check (plan in ('free', 'plus'));
exception when duplicate_object then null; end $$;

-- Pengguna biasa TIDAK boleh mengubah peran/paketnya sendiri: hanya kolom tertentu yang boleh diisi.
revoke insert, update on public.profiles from authenticated;
grant insert (id, full_name, segment, success_definition, updated_at) on public.profiles to authenticated;
grant update (id, full_name, segment, success_definition, updated_at) on public.profiles to authenticated;

-- Fitur & batasnya per paket (diatur dari halaman admin). null = tanpa batas, 0 = terkunci.
create table if not exists public.plan_features (
  key text primary key,
  label text not null,
  description text,
  free_limit integer check (free_limit is null or free_limit >= 0),
  plus_limit integer check (plus_limit is null or plus_limit >= 0),
  unit text,
  enforced boolean not null default true,
  sort integer not null default 0
);
alter table public.plan_features enable row level security;
drop policy if exists "fitur bisa dibaca" on public.plan_features;
create policy "fitur bisa dibaca" on public.plan_features for select using (true);
grant select on public.plan_features to anon, authenticated;

insert into public.plan_features (key, label, description, free_limit, plus_limit, unit, enforced, sort) values
  ('dreams', 'Dream Planner', 'Jumlah mimpi yang bisa direncanakan', 1, null, 'mimpi', true, 10),
  ('daily_action', 'Daily Action', 'Aksi harian & rangkaian konsisten', null, null, null, true, 20),
  ('my_life', 'My Life', 'Definisi sukses, nilai, visi, dan dokumen hidup', null, null, null, true, 30),
  ('wheel_history', 'Wheel of Life', 'Riwayat penilaian yang bisa dibandingkan', 2, 24, 'riwayat', true, 40),
  ('assessment_attempts', '8 Wheel Entrepreneur', 'Jumlah tes dalam 3 bulan', 1, null, 'kali / 3 bulan', true, 50),
  ('ai_messages', 'AI Companion', 'Kuota pesan AI per bulan', 20, 300, 'pesan/bulan', false, 60),
  ('premium_articles', 'Artikel premium', 'Akses artikel premium', 0, null, null, false, 70),
  ('paid_courses', 'Course berbayar', 'Akses course khusus member', 0, null, null, false, 80)
on conflict (key) do nothing;

-- Pengaturan umum (harga, kontak) yang bisa diubah admin
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null
);
alter table public.app_settings enable row level security;
drop policy if exists "pengaturan bisa dibaca" on public.app_settings;
create policy "pengaturan bisa dibaca" on public.app_settings for select using (true);
grant select on public.app_settings to anon, authenticated;
insert into public.app_settings (key, value) values
  ('plus_price_monthly', '49000'),
  ('plus_price_yearly', '499000'),
  ('upgrade_contact', '""')
on conflict (key) do nothing;

-- Cek peran (dipakai fungsi admin)
create or replace function public.my_role() returns text
language sql stable security definer set search_path = '' as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'member');
$$;

create or replace function public.require_admin(super boolean default false) returns void
language plpgsql stable security definer set search_path = '' as $$
begin
  if public.my_role() = 'super_admin' then return; end if;
  if not super and public.my_role() = 'admin' then return; end if;
  raise exception 'Akses ditolak';
end;
$$;

-- Ringkasan untuk dashboard admin
create or replace function public.admin_stats() returns json
language plpgsql stable security definer set search_path = '' as $$
begin
  perform public.require_admin();
  return json_build_object(
    'users', (select count(*) from public.profiles),
    'plus', (select count(*) from public.profiles where plan = 'plus' and (plan_expires_at is null or plan_expires_at > now())),
    'new_7d', (select count(*) from public.profiles where created_at > now() - interval '7 days'),
    'dreams', (select count(*) from public.dreams),
    'daily_done_7d', (select count(*) from public.daily_actions where done and action_date > current_date - 7),
    'assessments', (select count(*) from public.assessment_results)
  );
end;
$$;

-- Daftar pengguna (tanpa isi jawaban/data pribadi mereka)
create or replace function public.admin_list_users(search text default '', lim integer default 50, off integer default 0)
returns table (id uuid, email text, full_name text, segment text, role text, plan text, plan_expires_at timestamptz, created_at timestamptz, last_sign_in_at timestamptz, dreams_count bigint)
language plpgsql stable security definer set search_path = '' as $$
begin
  perform public.require_admin();
  return query
    select p.id, u.email::text, p.full_name, p.segment, p.role, p.plan, p.plan_expires_at, p.created_at, u.last_sign_in_at,
      (select count(*) from public.dreams d where d.user_id = p.id)
    from public.profiles p join auth.users u on u.id = p.id
    where search = '' or u.email ilike '%' || search || '%' or p.full_name ilike '%' || search || '%'
    order by p.created_at desc
    limit least(lim, 200) offset off;
end;
$$;

create or replace function public.admin_set_plan(target uuid, new_plan text, expires timestamptz default null) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform public.require_admin();
  update public.profiles set plan = new_plan, plan_expires_at = case when new_plan = 'plus' then expires else null end, updated_at = now()
  where id = target;
end;
$$;

create or replace function public.admin_set_role(target uuid, new_role text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform public.require_admin(true);
  if target = auth.uid() and new_role <> 'super_admin' then
    raise exception 'Tidak bisa menurunkan peran diri sendiri';
  end if;
  update public.profiles set role = new_role, updated_at = now() where id = target;
end;
$$;

create or replace function public.admin_update_feature(fkey text, new_free integer, new_plus integer, new_label text, new_description text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform public.require_admin(true);
  update public.plan_features
    set free_limit = new_free, plus_limit = new_plus, label = coalesce(nullif(new_label, ''), label), description = new_description
  where key = fkey;
end;
$$;

create or replace function public.admin_set_setting(skey text, svalue jsonb) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform public.require_admin(true);
  insert into public.app_settings (key, value) values (skey, svalue)
  on conflict (key) do update set value = excluded.value;
end;
$$;

revoke execute on function public.admin_stats, public.admin_list_users, public.admin_set_plan, public.admin_set_role,
  public.admin_update_feature, public.admin_set_setting, public.require_admin, public.my_role from public, anon;
grant execute on function public.admin_stats, public.admin_list_users, public.admin_set_plan, public.admin_set_role,
  public.admin_update_feature, public.admin_set_setting, public.require_admin, public.my_role to authenticated;
