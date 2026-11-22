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
