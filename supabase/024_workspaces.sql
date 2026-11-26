-- 024: Ruang Kerja tim (Tahap 1) + username member + pemberitahuan di aplikasi.
--      Tabel goal & sprint sudah disiapkan untuk Tahap 2 (belum dipakai tampilan).
--      Aman dijalankan ulang.

-- =====================================================================
-- 1. Username EClub (unik, huruf kecil/angka/titik/garis bawah, 3-20 karakter)
-- =====================================================================
alter table public.profiles add column if not exists username text;
-- 'invite' = mendaftar karena undangan tim (dashboard dibuat sederhana dulu).
alter table public.profiles add column if not exists signup_source text;
create unique index if not exists profiles_username_uq on public.profiles (lower(username));
do $$ begin
  alter table public.profiles add constraint profiles_username_chk check (username is null or username ~ '^[a-z0-9_.]{3,20}$');
exception when duplicate_object then null; end $$;

-- Buat username otomatis dari nama, mis. "Budi Santoso" -> budisantoso / budisantoso27
create or replace function public.gen_username(p_name text) returns text
language plpgsql security definer set search_path = '' as $$
declare base text; cand text; i int := 0;
begin
  base := left(regexp_replace(lower(coalesce(p_name, '')), '[^a-z0-9]', '', 'g'), 14);
  if char_length(base) < 3 then base := 'member'; end if;
  cand := base;
  while exists (select 1 from public.profiles where lower(username) = cand) loop
    i := i + 1;
    cand := base || (10 + floor(random() * (case when i < 5 then 90 else 9990 end)))::int;
  end loop;
  return cand;
end $$;
revoke execute on function public.gen_username from public, anon, authenticated;

create or replace function public.profiles_set_username() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.username is null then new.username := public.gen_username(new.full_name); end if;
  return new;
end $$;
drop trigger if exists profiles_username_trg on public.profiles;
create trigger profiles_username_trg before insert on public.profiles
  for each row execute function public.profiles_set_username();

-- Isi username untuk member yang sudah ada.
do $$ declare r record; begin
  for r in select id, full_name from public.profiles where username is null loop
    update public.profiles set username = public.gen_username(r.full_name) where id = r.id;
  end loop;
end $$;

-- Ganti username sendiri.
create or replace function public.set_my_username(p_username text) returns text
language plpgsql security definer set search_path = '' as $$
declare v text := lower(trim(coalesce(p_username, '')));
begin
  if auth.uid() is null then raise exception 'Silakan masuk'; end if;
  if v !~ '^[a-z0-9_.]{3,20}$' then raise exception 'Username 3-20 karakter: huruf kecil, angka, titik, atau garis bawah'; end if;
  if exists (select 1 from public.profiles where lower(username) = v and id <> auth.uid()) then
    raise exception 'Username sudah dipakai orang lain';
  end if;
  update public.profiles set username = v where id = auth.uid();
  return v;
end $$;
revoke execute on function public.set_my_username from public, anon;
grant execute on function public.set_my_username to authenticated;

-- =====================================================================
-- 2. Tabel ruang kerja
-- =====================================================================
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  name text not null check (char_length(name) between 1 and 60),
  kind text not null default 'company' check (kind in ('company', 'project')),
  description text check (description is null or char_length(description) <= 300),
  end_date date,
  dream_id uuid references public.dreams (id) on delete set null,
  invite_code text not null unique default substr(md5(gen_random_uuid()::text), 1, 10),
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  status text not null default 'invited' check (status in ('invited', 'active')),
  invited_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  joined_at timestamptz,
  primary key (workspace_id, user_id)
);
create index if not exists workspace_members_user_idx on public.workspace_members (user_id, status);

-- Tahap 2: goal ruang kerja (mis. "Omzet 100 juta Maret").
create table if not exists public.ws_goals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  target_value numeric(16, 2),
  current_value numeric(16, 2) not null default 0,
  unit text,
  due_date date,
  status text not null default 'active' check (status in ('active', 'achieved', 'dropped')),
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

-- Tahap 2: sprint harian / mingguan / bulanan yang mengejar goal.
create table if not exists public.ws_sprints (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  kind text not null check (kind in ('daily', 'weekly', 'monthly')),
  starts_on date not null,
  ends_on date not null,
  goal_id uuid references public.ws_goals (id) on delete set null,
  focus text,
  review text,
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create table if not exists public.ws_tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  description text check (description is null or char_length(description) <= 2000),
  assignee_id uuid references auth.users (id) on delete set null,
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  -- Tanggal tugas muncul di Laporan Harian penanggung jawab. "Lanjut besok" menggeser tanggal ini.
  plan_date date not null default ((now() at time zone 'Asia/Jakarta')::date),
  due_date date,
  status text not null default 'open' check (status in ('open', 'done', 'closed')),
  followups smallint not null default 0,
  done_at timestamptz,
  goal_id uuid references public.ws_goals (id) on delete set null,
  sprint_id uuid references public.ws_sprints (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists ws_tasks_ws_idx on public.ws_tasks (workspace_id, status, plan_date);
create index if not exists ws_tasks_assignee_idx on public.ws_tasks (assignee_id, status, plan_date);

create table if not exists public.ws_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.ws_tasks (id) on delete cascade,
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index if not exists ws_comments_task_idx on public.ws_comments (task_id, created_at);

-- Pemberitahuan di dalam aplikasi (lonceng).
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  body text,
  url text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications (user_id, read_at, created_at desc);

-- =====================================================================
-- 3. Fungsi bantu (dipakai aturan keamanan)
-- =====================================================================
create or replace function public.ws_role(p_ws uuid) returns text
language sql stable security definer set search_path = '' as $$
  select role from public.workspace_members where workspace_id = p_ws and user_id = auth.uid() and status = 'active';
$$;

create or replace function public.ws_is_member(p_ws uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.workspace_members where workspace_id = p_ws and user_id = auth.uid() and status = 'active');
$$;

create or replace function public.ws_is_manager(p_ws uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.workspace_members where workspace_id = p_ws and user_id = auth.uid() and status = 'active' and role in ('owner', 'admin'));
$$;

-- Pemilik masih Plus (atau staf)? Kalau Plus habis, ruang kerja hanya bisa dilihat.
create or replace function public.ws_owner_active(p_ws uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.workspaces w join public.profiles p on p.id = w.owner_id
    where w.id = p_ws and not w.archived
      and ((p.plan = 'plus' and (p.plan_expires_at is null or p.plan_expires_at > now())) or p.role in ('admin', 'super_admin'))
  );
$$;

-- Batas anggota (selain pemilik): Plus bulanan vs tahunan. Diatur di Admin > Paket.
create or replace function public.ws_member_cap(p_ws uuid) returns int
language plpgsql stable security definer set search_path = '' as $$
declare p record; v_month int; v_year int;
begin
  select coalesce((select (value #>> '{}')::int from public.app_settings where key = 'team_max_monthly'), 5),
         coalesce((select (value #>> '{}')::int from public.app_settings where key = 'team_max_yearly'), 15)
    into v_month, v_year;
  select pr.role, pr.plan_expires_at into p from public.workspaces w join public.profiles pr on pr.id = w.owner_id where w.id = p_ws;
  if p.role in ('admin', 'super_admin') or p.plan_expires_at is null or p.plan_expires_at > now() + interval '45 days' then
    return v_year;
  end if;
  return v_month;
end $$;

grant execute on function public.ws_role, public.ws_is_member, public.ws_is_manager, public.ws_owner_active, public.ws_member_cap to authenticated;

-- =====================================================================
-- 4. Aturan keamanan (RLS). Pemilik tim hanya melihat data tim,
--    tidak pernah mimpi, keuangan, atau kebiasaan anggota.
-- =====================================================================
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.ws_goals enable row level security;
alter table public.ws_sprints enable row level security;
alter table public.ws_tasks enable row level security;
alter table public.ws_comments enable row level security;
alter table public.notifications enable row level security;

drop policy if exists ws_select on public.workspaces;
create policy ws_select on public.workspaces for select
  using (exists (select 1 from public.workspace_members m where m.workspace_id = id and m.user_id = auth.uid()));
drop policy if exists ws_owner_update on public.workspaces;
create policy ws_owner_update on public.workspaces for update
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists ws_owner_delete on public.workspaces;
create policy ws_owner_delete on public.workspaces for delete using (owner_id = auth.uid());

drop policy if exists wsm_select on public.workspace_members;
create policy wsm_select on public.workspace_members for select
  using (user_id = auth.uid() or public.ws_is_member(workspace_id));

drop policy if exists wsg_select on public.ws_goals;
create policy wsg_select on public.ws_goals for select using (public.ws_is_member(workspace_id));
drop policy if exists wsg_manage on public.ws_goals;
create policy wsg_manage on public.ws_goals for all using (public.ws_is_manager(workspace_id)) with check (public.ws_is_manager(workspace_id));

drop policy if exists wss_select on public.ws_sprints;
create policy wss_select on public.ws_sprints for select using (public.ws_is_member(workspace_id));
drop policy if exists wss_manage on public.ws_sprints;
create policy wss_manage on public.ws_sprints for all using (public.ws_is_manager(workspace_id)) with check (public.ws_is_manager(workspace_id));

drop policy if exists wst_select on public.ws_tasks;
create policy wst_select on public.ws_tasks for select using (public.ws_is_member(workspace_id));
drop policy if exists wst_insert on public.ws_tasks;
create policy wst_insert on public.ws_tasks for insert with check (
  public.ws_is_manager(workspace_id) and public.ws_owner_active(workspace_id) and created_by = auth.uid()
  and (assignee_id is null or exists (select 1 from public.workspace_members m where m.workspace_id = ws_tasks.workspace_id and m.user_id = assignee_id and m.status = 'active'))
);
drop policy if exists wst_update on public.ws_tasks;
create policy wst_update on public.ws_tasks for update
  using (public.ws_is_manager(workspace_id) or assignee_id = auth.uid())
  with check (public.ws_is_member(workspace_id));
drop policy if exists wst_delete on public.ws_tasks;
create policy wst_delete on public.ws_tasks for delete using (public.ws_is_manager(workspace_id));

-- Anggota biasa hanya boleh mengubah status tugasnya sendiri (selesai / lanjut besok).
create or replace function public.ws_tasks_guard() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  new.updated_at := now();
  if new.status = 'done' and old.status <> 'done' then new.done_at := now(); end if;
  if new.status <> 'done' then new.done_at := null; end if;
  if auth.uid() is not null and coalesce(current_setting('eclub.ws_bypass', true), '') <> '1'
     and not public.ws_is_manager(old.workspace_id) then
    if new.workspace_id <> old.workspace_id or new.title <> old.title or new.description is distinct from old.description
       or new.assignee_id is distinct from old.assignee_id or new.created_by is distinct from old.created_by
       or new.due_date is distinct from old.due_date or new.goal_id is distinct from old.goal_id
       or new.sprint_id is distinct from old.sprint_id or new.status = 'closed' then
      raise exception 'Hanya pemilik atau admin tim yang boleh mengubah isi tugas';
    end if;
  end if;
  if new.assignee_id is distinct from old.assignee_id and new.assignee_id is not null
     and not exists (select 1 from public.workspace_members m where m.workspace_id = new.workspace_id and m.user_id = new.assignee_id and m.status = 'active') then
    raise exception 'Penanggung jawab harus anggota tim';
  end if;
  return new;
end $$;
drop trigger if exists ws_tasks_guard_trg on public.ws_tasks;
create trigger ws_tasks_guard_trg before update on public.ws_tasks for each row execute function public.ws_tasks_guard();

drop policy if exists wsc_select on public.ws_comments;
create policy wsc_select on public.ws_comments for select using (public.ws_is_member(workspace_id));
drop policy if exists wsc_insert on public.ws_comments;
create policy wsc_insert on public.ws_comments for insert with check (
  user_id = auth.uid() and public.ws_is_member(workspace_id)
  and exists (select 1 from public.ws_tasks t where t.id = task_id and t.workspace_id = ws_comments.workspace_id)
);
drop policy if exists wsc_delete on public.ws_comments;
create policy wsc_delete on public.ws_comments for delete using (user_id = auth.uid() or public.ws_is_manager(workspace_id));

drop policy if exists notif_own on public.notifications;
create policy notif_own on public.notifications for select using (user_id = auth.uid());
drop policy if exists notif_own_update on public.notifications;
create policy notif_own_update on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists notif_own_delete on public.notifications;
create policy notif_own_delete on public.notifications for delete using (user_id = auth.uid());

grant select, update, delete on public.workspaces to authenticated;
grant select on public.workspace_members to authenticated;
grant select, insert, update, delete on public.ws_goals, public.ws_sprints, public.ws_tasks to authenticated;
grant select, insert, delete on public.ws_comments to authenticated;
grant select, update, delete on public.notifications to authenticated;
grant all on public.workspaces, public.workspace_members, public.ws_goals, public.ws_sprints, public.ws_tasks, public.ws_comments, public.notifications to service_role;

-- =====================================================================
-- 5. Aksi lewat fungsi (dicek di database, tidak bisa diakali dari HP)
-- =====================================================================

-- Buat ruang kerja: khusus Plus. Pembuat otomatis jadi Pemilik.
create or replace function public.ws_create(p_name text, p_kind text, p_end date default null, p_desc text default null, p_dream uuid default null) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'Silakan masuk'; end if;
  if not (public.has_plus() or public.is_staff()) then raise exception 'Membuat ruang kerja khusus member Plus'; end if;
  if (select count(*) from public.workspaces where owner_id = v_uid and not archived) >= 20 then
    raise exception 'Maksimal 20 ruang kerja aktif. Arsipkan yang sudah selesai.';
  end if;
  if p_dream is not null and not exists (select 1 from public.dreams where id = p_dream and user_id = v_uid) then p_dream := null; end if;
  insert into public.workspaces (owner_id, name, kind, end_date, description, dream_id)
    values (v_uid, left(trim(p_name), 60), case when p_kind = 'project' then 'project' else 'company' end,
            case when p_kind = 'project' then p_end else null end, nullif(left(trim(coalesce(p_desc, '')), 300), ''), p_dream)
    returning id into v_id;
  insert into public.workspace_members (workspace_id, user_id, role, status, joined_at) values (v_id, v_uid, 'owner', 'active', now());
  return v_id;
end $$;

-- Undang lewat username. Yang diundang harus menerima dulu.
create or replace function public.ws_invite(p_ws uuid, p_username text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_target uuid; v_row record; v_cnt int;
begin
  if not public.ws_is_manager(p_ws) then raise exception 'Hanya pemilik atau admin tim yang bisa mengundang'; end if;
  if not public.ws_owner_active(p_ws) then raise exception 'Paket Plus pemilik tim sudah berakhir'; end if;
  select id into v_target from public.profiles where lower(username) = lower(trim(both '@ ' from coalesce(p_username, '')));
  if v_target is null then raise exception 'Username tidak ditemukan. Kalau belum punya akun EClub, kirim link undangan saja.'; end if;
  select * into v_row from public.workspace_members where workspace_id = p_ws and user_id = v_target;
  if found then
    raise exception '%', case when v_row.status = 'active' then 'Orang ini sudah menjadi anggota tim' else 'Orang ini sudah diundang, tinggal menunggu diterima' end;
  end if;
  select count(*) into v_cnt from public.workspace_members where workspace_id = p_ws and role <> 'owner';
  if v_cnt >= public.ws_member_cap(p_ws) then raise exception 'Batas anggota tim sudah penuh (% orang)', public.ws_member_cap(p_ws); end if;
  insert into public.workspace_members (workspace_id, user_id, role, status, invited_by) values (p_ws, v_target, 'member', 'invited', auth.uid());
  return v_target;
end $$;

-- Terima / tolak undangan.
create or replace function public.ws_respond(p_ws uuid, p_accept boolean) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if p_accept then
    update public.workspace_members set status = 'active', joined_at = now() where workspace_id = p_ws and user_id = auth.uid() and status = 'invited';
  else
    delete from public.workspace_members where workspace_id = p_ws and user_id = auth.uid() and status = 'invited';
  end if;
  if not found then raise exception 'Undangan tidak ditemukan'; end if;
end $$;

-- Info link undangan (boleh dibuka sebelum login).
create or replace function public.ws_invite_info(p_code text)
returns table (id uuid, name text, kind text, owner_name text, members bigint)
language sql stable security definer set search_path = '' as $$
  select w.id, w.name, w.kind, p.full_name, (select count(*) from public.workspace_members m where m.workspace_id = w.id and m.status = 'active')
  from public.workspaces w join public.profiles p on p.id = w.owner_id
  where w.invite_code = p_code and not w.archived;
$$;

-- Gabung lewat link undangan (membuka link = menerima undangan).
create or replace function public.ws_join(p_code text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := auth.uid(); v_ws uuid; v_row record; v_cnt int;
begin
  if v_uid is null then raise exception 'Silakan masuk'; end if;
  select id into v_ws from public.workspaces where invite_code = p_code and not archived;
  if v_ws is null then raise exception 'Link undangan tidak berlaku. Minta link baru ke pemilik tim.'; end if;
  select * into v_row from public.workspace_members where workspace_id = v_ws and user_id = v_uid;
  if found then
    if v_row.status = 'invited' then update public.workspace_members set status = 'active', joined_at = now() where workspace_id = v_ws and user_id = v_uid; end if;
  else
    if not public.ws_owner_active(v_ws) then raise exception 'Ruang kerja ini sedang tidak menerima anggota baru'; end if;
    select count(*) into v_cnt from public.workspace_members where workspace_id = v_ws and role <> 'owner';
    if v_cnt >= public.ws_member_cap(v_ws) then raise exception 'Tim ini sudah penuh. Hubungi pemilik tim.'; end if;
    insert into public.workspace_members (workspace_id, user_id, role, status, joined_at) values (v_ws, v_uid, 'member', 'active', now());
  end if;
  -- Akun yang baru dibuat dari link undangan: dashboard disederhanakan dulu.
  update public.profiles p set signup_source = 'invite'
    from auth.users u
    where p.id = v_uid and u.id = v_uid and p.signup_source is null and coalesce(u.raw_user_meta_data ->> 'via_invite', '') = '1';
  return v_ws;
end $$;

-- Ubah peran anggota (hanya pemilik). Peran: admin / member.
create or replace function public.ws_set_role(p_ws uuid, p_user uuid, p_role text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if public.ws_role(p_ws) is distinct from 'owner' then raise exception 'Hanya pemilik tim yang bisa mengubah peran'; end if;
  if p_role not in ('admin', 'member') then raise exception 'Peran tidak valid'; end if;
  update public.workspace_members set role = p_role where workspace_id = p_ws and user_id = p_user and role <> 'owner';
end $$;

-- Keluarkan anggota (pemilik/admin), batalkan undangan, atau keluar sendiri.
create or replace function public.ws_remove(p_ws uuid, p_user uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare v_role text; v_my text := public.ws_role(p_ws);
begin
  select role into v_role from public.workspace_members where workspace_id = p_ws and user_id = p_user;
  if v_role is null then return; end if;
  if v_role = 'owner' then raise exception 'Pemilik tidak bisa dikeluarkan. Arsipkan ruang kerja bila sudah selesai.'; end if;
  if p_user <> auth.uid() and not (v_my = 'owner' or (v_my = 'admin' and v_role = 'member')) then
    raise exception 'Anda tidak punya izin mengeluarkan anggota ini';
  end if;
  delete from public.workspace_members where workspace_id = p_ws and user_id = p_user;
  -- Tugas yang belum selesai jadi tanpa penanggung jawab, supaya tidak hilang.
  perform set_config('eclub.ws_bypass', '1', true);
  update public.ws_tasks set assignee_id = null where workspace_id = p_ws and assignee_id = p_user and status = 'open';
end $$;

-- Daftar anggota + nama & username (hanya untuk sesama anggota tim).
create or replace function public.ws_people(p_ws uuid)
returns table (user_id uuid, full_name text, username text, role text, status text, joined_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select m.user_id, p.full_name, p.username, m.role, m.status, m.joined_at
  from public.workspace_members m join public.profiles p on p.id = m.user_id
  where m.workspace_id = p_ws and public.ws_is_member(p_ws)
  order by case m.role when 'owner' then 0 when 'admin' then 1 else 2 end, m.status, p.full_name;
$$;

-- Undangan yang menunggu jawaban saya.
create or replace function public.my_ws_invites()
returns table (workspace_id uuid, name text, kind text, inviter text, created_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select w.id, w.name, w.kind, coalesce(p.full_name, 'Pemilik tim'), m.created_at
  from public.workspace_members m join public.workspaces w on w.id = m.workspace_id
  left join public.profiles p on p.id = m.invited_by
  where m.user_id = auth.uid() and m.status = 'invited' and not w.archived
  order by m.created_at desc;
$$;

-- Kirim pemberitahuan ke sesama anggota (atau yang diundang) di ruang kerja yang sama.
create or replace function public.ws_notify(p_ws uuid, p_users uuid[], p_title text, p_body text, p_url text) returns int
language plpgsql security definer set search_path = '' as $$
declare n int;
begin
  if not public.ws_is_member(p_ws) then return 0; end if;
  insert into public.notifications (user_id, title, body, url)
    select m.user_id, left(p_title, 120), left(p_body, 300), left(p_url, 200)
    from public.workspace_members m
    where m.workspace_id = p_ws and m.user_id = any (p_users) and m.user_id <> auth.uid();
  get diagnostics n = row_count;
  return n;
end $$;

revoke execute on function public.ws_create, public.ws_invite, public.ws_respond, public.ws_join, public.ws_set_role, public.ws_remove, public.ws_people, public.my_ws_invites, public.ws_notify from public, anon;
grant execute on function public.ws_create, public.ws_invite, public.ws_respond, public.ws_join, public.ws_set_role, public.ws_remove, public.ws_people, public.my_ws_invites, public.ws_notify to authenticated;
revoke execute on function public.ws_invite_info from public;
grant execute on function public.ws_invite_info to anon, authenticated;

-- =====================================================================
-- 6. Pengaturan batas anggota (bisa diubah di Admin > Paket)
-- =====================================================================
insert into public.app_settings (key, value) values ('team_max_monthly', '5'::jsonb), ('team_max_yearly', '15'::jsonb)
  on conflict (key) do nothing;

-- Baris di tabel perbandingan paket.
insert into public.plan_features (key, label, description, free_limit, plus_limit, unit, enforced, sort)
  values ('team_workspace', 'Ruang Kerja Tim', 'Buat ruang kerja perusahaan/project, undang tim, bagi tugas & diskusi. Anggota yang diundang boleh akun gratis.', 0, null, null, true, 38)
  on conflict (key) do nothing;
