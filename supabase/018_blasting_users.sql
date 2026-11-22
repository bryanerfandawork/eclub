-- 018: Blasting (email + WhatsApp) untuk remarketing dari Admin.
-- Aman dijalankan ulang.

-- 1) Berhenti menerima email promosi (WA memakai kolom wa_opt_in yang sudah ada).
alter table public.profiles add column if not exists email_opt_out boolean not null default false;
grant select (email_opt_out) on public.profiles to authenticated;
grant update (email_opt_out) on public.profiles to authenticated;

-- 2) Riwayat blasting.
create table if not exists public.blasts (
  id uuid primary key default gen_random_uuid(),
  channel text not null check (channel in ('email', 'whatsapp')),
  subject text,
  message text not null,
  filters jsonb not null default '{}'::jsonb,
  summary text,
  recipients integer not null default 0,
  sent integer not null default 0,
  failed integer not null default 0,
  status text not null default 'sending',
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.blasts enable row level security;
drop policy if exists "staff kelola blasts" on public.blasts;
create policy "staff kelola blasts" on public.blasts for all using (public.is_staff()) with check (public.is_staff());
grant select, insert, update on public.blasts to authenticated;
grant all on public.blasts to service_role;

-- 3) Daftar fitur otomatis: semua tabel publik yang punya kolom user_id
--    (fitur baru yang menyimpan data per member otomatis muncul sebagai filter).
create or replace function public.admin_blast_features()
returns table (table_name text, users bigint)
language plpgsql security definer set search_path = '' as $$
declare r record;
begin
  if not public.is_staff() then raise exception 'Khusus admin'; end if;
  for r in
    select c.table_name::text as t
    from information_schema.columns c
    join information_schema.tables tb on tb.table_schema = c.table_schema and tb.table_name = c.table_name and tb.table_type = 'BASE TABLE'
    where c.table_schema = 'public' and c.column_name = 'user_id'
      and c.table_name not in ('profiles', 'notification_log', 'push_secrets', 'payment_events', 'blasts', 'lesson_videos')
    order by 1
  loop
    table_name := r.t;
    execute format('select count(distinct user_id) from public.%I', r.t) into users;
    return next;
  end loop;
end $$;

-- 4) Member yang punya data di satu tabel fitur.
create or replace function public.admin_blast_feature_users(p_table text)
returns setof uuid
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_staff() then raise exception 'Khusus admin'; end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = p_table and column_name = 'user_id'
  ) then raise exception 'Tabel tidak dikenal'; end if;
  return query execute format('select distinct user_id from public.%I where user_id is not null', p_table);
end $$;

-- 5) Tes yang sudah dikerjakan (otomatis: setiap jenis tes baru ikut muncul).
create or replace function public.admin_blast_tests()
returns table (user_id uuid, assessment_key text)
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_staff() then raise exception 'Khusus admin'; end if;
  return query select distinct a.user_id, a.assessment_key from public.assessment_results a;
end $$;

-- 6) Progres kelas per member: sudah mulai / selesai.
create or replace function public.admin_blast_courses()
returns table (user_id uuid, course_id uuid, done integer, total integer)
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_staff() then raise exception 'Khusus admin'; end if;
  return query
    with t as (select l.course_id, count(*)::integer as n from public.lessons l group by l.course_id)
    select lp.user_id, l.course_id, count(distinct lp.lesson_id)::integer, max(t.n)
    from public.lesson_progress lp
    join public.lessons l on l.id = lp.lesson_id
    join t on t.course_id = l.course_id
    group by lp.user_id, l.course_id;
end $$;

revoke execute on function public.admin_blast_features, public.admin_blast_feature_users, public.admin_blast_tests, public.admin_blast_courses from public, anon;
grant execute on function public.admin_blast_features, public.admin_blast_feature_users, public.admin_blast_tests, public.admin_blast_courses to authenticated, service_role;

-- ========== Bagian 2: terakhir aktif + daftar pengguna untuk admin ==========

-- 7) Kapan terakhir membuka aplikasi (diperbarui otomatis saat member membuka halaman, maks tiap 10 menit).
alter table public.profiles add column if not exists last_seen_at timestamptz;
create or replace function public.touch_last_seen() returns void
language sql security definer set search_path = '' as $$
  update public.profiles set last_seen_at = now()
  where id = auth.uid() and (last_seen_at is null or last_seen_at < now() - interval '10 minutes');
$$;
revoke execute on function public.touch_last_seen from public, anon;
grant execute on function public.touch_last_seen to authenticated;

-- 8) Daftar pengguna dengan urutan pilihan admin.
create or replace function public.admin_users(search text default '', sort text default 'created', dir text default 'desc', lim integer default 50, off integer default 0)
returns table (id uuid, email text, full_name text, segment text, role text, plan text, plan_expires_at timestamptz, created_at timestamptz,
  last_sign_in_at timestamptz, last_active timestamptz, whatsapp text, province text, regency text, birth_date date, dreams_count bigint, total bigint)
language plpgsql stable security definer set search_path = '' as $$
begin
  perform public.require_admin();
  return query
    with base as (
      select p.id, u.email::text as email, p.full_name, p.segment, p.role, p.plan, p.plan_expires_at, p.created_at, u.last_sign_in_at,
        greatest(p.last_seen_at, u.last_sign_in_at) as last_active, p.whatsapp, p.province, p.regency, p.birth_date,
        (select count(*) from public.dreams d where d.user_id = p.id) as dreams_count
      from public.profiles p join auth.users u on u.id = p.id
      where coalesce(search, '') = '' or u.email ilike '%' || search || '%' or p.full_name ilike '%' || search || '%' or p.whatsapp ilike '%' || search || '%'
    )
    select b.*, count(*) over () as total from base b
    order by
      case when sort = 'name' and dir = 'asc' then lower(b.full_name) end asc nulls last,
      case when sort = 'name' and dir = 'desc' then lower(b.full_name) end desc nulls last,
      case when sort = 'email' and dir = 'asc' then b.email end asc nulls last,
      case when sort = 'email' and dir = 'desc' then b.email end desc nulls last,
      case when sort = 'active' and dir = 'asc' then b.last_active end asc nulls first,
      case when sort = 'active' and dir = 'desc' then b.last_active end desc nulls last,
      case when sort = 'plan' and dir = 'asc' then b.plan end asc nulls last,
      case when sort = 'plan' and dir = 'desc' then b.plan end desc nulls last,
      case when sort = 'created' and dir = 'asc' then b.created_at end asc,
      b.created_at desc
    limit least(greatest(lim, 1), 5000) offset greatest(off, 0);
end $$;
revoke execute on function public.admin_users from public, anon;
grant execute on function public.admin_users to authenticated;
