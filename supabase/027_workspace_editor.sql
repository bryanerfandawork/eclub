-- 027: Peran "Editor" tim (dulu "Admin"). Editor = boleh mengelola tugas, tahapan, target, dll.
--      Syarat: akun Editor harus member Plus (atau staf EClub), dan hanya pemilik yang bisa mengangkat.
--      Kalau Plus si Editor habis, haknya otomatis kembali seperti anggota biasa (perannya tetap tersimpan).
--      Nilai di database tetap 'admin'. Butuh SQL 024-026. Aman dijalankan ulang.

-- 1. Apakah akun ini Plus aktif (atau staf)?
create or replace function public.ws_user_plus(p_user uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles p
    where p.id = p_user
      and ((p.plan = 'plus' and (p.plan_expires_at is null or p.plan_expires_at > now())) or p.role in ('admin', 'super_admin'))
  );
$$;
revoke execute on function public.ws_user_plus from public, anon;
grant execute on function public.ws_user_plus to authenticated;

-- 2. Pengelola tim = pemilik, atau Editor yang masih Plus.
create or replace function public.ws_is_manager(p_ws uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = p_ws and user_id = auth.uid() and status = 'active'
      and (role = 'owner' or (role = 'admin' and public.ws_user_plus(auth.uid())))
  );
$$;

-- 3. Hanya pemilik yang mengangkat Editor, dan Editor harus Plus serta sudah menerima undangan.
create or replace function public.ws_set_role(p_ws uuid, p_user uuid, p_role text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if public.ws_role(p_ws) is distinct from 'owner' then raise exception 'Hanya pemilik tim yang bisa mengubah peran'; end if;
  if p_role not in ('admin', 'member') then raise exception 'Peran tidak valid'; end if;
  if p_role = 'admin' then
    if not exists (select 1 from public.workspace_members where workspace_id = p_ws and user_id = p_user and status = 'active') then
      raise exception 'Orang ini belum menerima undangan';
    end if;
    if not public.ws_user_plus(p_user) then raise exception 'Editor harus member Plus'; end if;
  end if;
  update public.workspace_members set role = p_role where workspace_id = p_ws and user_id = p_user and role <> 'owner';
end $$;

-- 4. Daftar orang + info Plus (supaya pemilik tahu siapa yang bisa jadi Editor).
drop function if exists public.ws_people(uuid);
create function public.ws_people(p_ws uuid)
returns table (user_id uuid, full_name text, username text, role text, status text, joined_at timestamptz, plus boolean)
language sql stable security definer set search_path = '' as $$
  select m.user_id, p.full_name, p.username, m.role, m.status, m.joined_at, public.ws_user_plus(m.user_id)
  from public.workspace_members m join public.profiles p on p.id = m.user_id
  where m.workspace_id = p_ws and public.ws_is_member(p_ws)
  order by case m.role when 'owner' then 0 when 'admin' then 1 else 2 end, m.status, p.full_name;
$$;
revoke execute on function public.ws_people from public, anon;
grant execute on function public.ws_people to authenticated;

-- 5. Mengeluarkan anggota: pemilik siapa saja; Editor (yang masih Plus) hanya anggota biasa; atau keluar sendiri.
create or replace function public.ws_remove(p_ws uuid, p_user uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare v_role text; v_my text := public.ws_role(p_ws);
begin
  select role into v_role from public.workspace_members where workspace_id = p_ws and user_id = p_user;
  if v_role is null then return; end if;
  if v_role = 'owner' then raise exception 'Pemilik tidak bisa dikeluarkan. Arsipkan ruang kerja bila sudah selesai.'; end if;
  if p_user <> auth.uid() and not (v_my = 'owner' or (v_my = 'admin' and v_role = 'member' and public.ws_is_manager(p_ws))) then
    raise exception 'Anda tidak punya izin mengeluarkan anggota ini';
  end if;
  delete from public.workspace_members where workspace_id = p_ws and user_id = p_user;
  perform set_config('eclub.ws_bypass', '1', true);
  update public.ws_tasks set assignee_id = null where workspace_id = p_ws and assignee_id = p_user and status = 'open';
end $$;
