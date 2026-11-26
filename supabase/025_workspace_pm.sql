-- 025: Ruang Kerja Tim putaran 2: bagian/divisi, tugas penting, arsip tugas, hasil tugas untuk tabungan mimpi,
--      tugas boleh diberikan ke anggota yang belum menerima undangan, target tim (goal).
--      Butuh SQL 024. Aman dijalankan ulang.

-- 1. Bagian / divisi di dalam ruang kerja (Marketing, Produksi, Keuangan, ...)
create table if not exists public.ws_sections (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  sort int not null default 0,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists ws_sections_ws_idx on public.ws_sections (workspace_id, archived, sort);
alter table public.ws_sections enable row level security;
drop policy if exists wssec_select on public.ws_sections;
create policy wssec_select on public.ws_sections for select using (public.ws_is_member(workspace_id));
drop policy if exists wssec_manage on public.ws_sections;
create policy wssec_manage on public.ws_sections for all using (public.ws_is_manager(workspace_id)) with check (public.ws_is_manager(workspace_id));
grant select, insert, update, delete on public.ws_sections to authenticated;
grant all on public.ws_sections to service_role;

-- 2. Kolom baru di tugas
alter table public.ws_tasks add column if not exists section_id uuid references public.ws_sections (id) on delete set null;
alter table public.ws_tasks add column if not exists important boolean not null default false;
alter table public.ws_tasks add column if not exists archived boolean not null default false;
-- Hasil tugas untuk pemilik: disisihkan untuk mimpi ('saved') atau tidak ('skipped').
alter table public.ws_tasks add column if not exists result_state text;
alter table public.ws_tasks add column if not exists result_amount bigint;
do $$ begin
  alter table public.ws_tasks add constraint ws_tasks_result_chk check (result_state is null or result_state in ('saved', 'skipped'));
exception when duplicate_object then null; end $$;
create index if not exists ws_tasks_section_idx on public.ws_tasks (section_id);

-- 3. Penanggung jawab boleh anggota yang masih "menunggu diterima".
drop policy if exists wst_insert on public.ws_tasks;
create policy wst_insert on public.ws_tasks for insert with check (
  public.ws_is_manager(workspace_id) and public.ws_owner_active(workspace_id) and created_by = auth.uid()
  and (assignee_id is null or exists (select 1 from public.workspace_members m where m.workspace_id = ws_tasks.workspace_id and m.user_id = assignee_id))
  and (section_id is null or exists (select 1 from public.ws_sections s where s.id = section_id and s.workspace_id = ws_tasks.workspace_id))
);

create or replace function public.ws_tasks_guard() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_bypass boolean := coalesce(current_setting('eclub.ws_bypass', true), '') = '1';
begin
  new.updated_at := now();
  if new.status = 'done' and old.status <> 'done' then new.done_at := now(); end if;
  if new.status <> 'done' then new.done_at := null; end if;
  if auth.uid() is not null and not v_bypass then
    if not public.ws_is_manager(old.workspace_id) then
      -- Anggota biasa hanya boleh mengubah status tugasnya sendiri (selesai / lanjut besok).
      if new.workspace_id <> old.workspace_id or new.title <> old.title or new.description is distinct from old.description
         or new.assignee_id is distinct from old.assignee_id or new.created_by is distinct from old.created_by
         or new.due_date is distinct from old.due_date or new.goal_id is distinct from old.goal_id
         or new.sprint_id is distinct from old.sprint_id or new.section_id is distinct from old.section_id
         or new.important is distinct from old.important or new.archived is distinct from old.archived
         or new.status = 'closed' then
        raise exception 'Hanya pemilik atau admin tim yang boleh mengubah isi tugas';
      end if;
    end if;
    if (new.result_state is distinct from old.result_state or new.result_amount is distinct from old.result_amount)
       and public.ws_role(old.workspace_id) is distinct from 'owner' then
      raise exception 'Hanya pemilik ruang kerja yang mencatat hasil tugas';
    end if;
  end if;
  if new.assignee_id is distinct from old.assignee_id and new.assignee_id is not null
     and not exists (select 1 from public.workspace_members m where m.workspace_id = new.workspace_id and m.user_id = new.assignee_id) then
    raise exception 'Penanggung jawab harus anggota tim';
  end if;
  if new.section_id is distinct from old.section_id and new.section_id is not null
     and not exists (select 1 from public.ws_sections s where s.id = new.section_id and s.workspace_id = new.workspace_id) then
    raise exception 'Bagian tidak ditemukan';
  end if;
  return new;
end $$;

-- 4. Saat undangan ditolak / dibatalkan, tugas untuk orang itu jadi tanpa penanggung jawab.
create or replace function public.ws_respond(p_ws uuid, p_accept boolean) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if p_accept then
    update public.workspace_members set status = 'active', joined_at = now() where workspace_id = p_ws and user_id = auth.uid() and status = 'invited';
    if not found then raise exception 'Undangan tidak ditemukan'; end if;
  else
    delete from public.workspace_members where workspace_id = p_ws and user_id = auth.uid() and status = 'invited';
    if not found then raise exception 'Undangan tidak ditemukan'; end if;
    perform set_config('eclub.ws_bypass', '1', true);
    update public.ws_tasks set assignee_id = null where workspace_id = p_ws and assignee_id = auth.uid() and status = 'open';
  end if;
end $$;

-- 5. Target tim: manager boleh mengubah angka capaian.
alter table public.ws_goals add column if not exists section_id uuid references public.ws_sections (id) on delete set null;
