-- 028: Ruang Kerja putaran 4: tugas dikerjakan lebih dari 1 orang, bukti selesai,
--      checklist bisa di-CC ke orang lain (muncul di Laporan Harian-nya).
--      Butuh SQL 024-027. Aman dijalankan ulang.

-- 1. Kolom baru
alter table public.ws_tasks add column if not exists helpers uuid[] not null default '{}';
alter table public.ws_tasks add column if not exists proof_link text;
alter table public.ws_tasks add column if not exists proof_note text;
do $$ begin
  alter table public.ws_tasks add constraint ws_tasks_proof_chk check ((proof_link is null or char_length(proof_link) <= 500) and (proof_note is null or char_length(proof_note) <= 2000));
exception when duplicate_object then null; end $$;
create index if not exists ws_tasks_helpers_idx on public.ws_tasks using gin (helpers);

alter table public.workspaces add column if not exists require_proof boolean not null default false;

alter table public.ws_task_items add column if not exists assignee_id uuid references auth.users (id) on delete set null;
alter table public.ws_task_items add column if not exists plan_date date;
alter table public.ws_task_items add column if not exists done_at timestamptz;
create index if not exists ws_task_items_assignee_idx on public.ws_task_items (assignee_id, done, plan_date);

-- 2. Saya ikut mengerjakan tugas ini? (penanggung jawab utama atau rekan)
create or replace function public.ws_on_task(p_task uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.ws_tasks t
    where t.id = p_task and (t.assignee_id = auth.uid() or auth.uid() = any (t.helpers)) and public.ws_is_member(t.workspace_id)
  );
$$;
grant execute on function public.ws_on_task to authenticated;

create or replace function public.ws_can_edit_task(p_task uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.ws_tasks t where t.id = p_task and public.ws_is_manager(t.workspace_id)) or public.ws_on_task(p_task);
$$;

-- Rekan kerja juga boleh mengubah status (selesai, lanjut besok, bukti).
drop policy if exists wst_update on public.ws_tasks;
create policy wst_update on public.ws_tasks for update
  using (public.ws_is_manager(workspace_id) or assignee_id = auth.uid() or auth.uid() = any (helpers))
  with check (public.ws_is_member(workspace_id));

-- Orang yang di-CC checklist boleh mencentang langkahnya sendiri.
drop policy if exists wsi_update_mine on public.ws_task_items;
create policy wsi_update_mine on public.ws_task_items for update
  using (assignee_id = auth.uid() and public.ws_is_member(workspace_id))
  with check (assignee_id = auth.uid() and public.ws_is_member(workspace_id));

-- 3. Penjaga: rekan kerja & CC harus anggota tim; hanya pemilik/editor yang mengubah daftar rekan.
create or replace function public.ws_tasks_helpers_guard() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_bypass boolean := coalesce(current_setting('eclub.ws_bypass', true), '') = '1';
begin
  new.helpers := array(select distinct x from unnest(coalesce(new.helpers, '{}')) x where x is distinct from new.assignee_id);
  if tg_op = 'UPDATE' and new.helpers is distinct from old.helpers and auth.uid() is not null and not v_bypass
     and not public.ws_is_manager(old.workspace_id) then
    raise exception 'Hanya pemilik atau editor tim yang boleh mengubah siapa yang mengerjakan';
  end if;
  if exists (select 1 from unnest(new.helpers) x
             where not exists (select 1 from public.workspace_members m where m.workspace_id = new.workspace_id and m.user_id = x)) then
    raise exception 'Yang ikut mengerjakan harus anggota tim';
  end if;
  return new;
end $$;
drop trigger if exists ws_tasks_helpers_trg on public.ws_tasks;
create trigger ws_tasks_helpers_trg before insert or update on public.ws_tasks for each row execute function public.ws_tasks_helpers_guard();

create or replace function public.ws_items_guard() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.done and (tg_op = 'INSERT' or not old.done) then new.done_at := now(); end if;
  if not new.done then new.done_at := null; end if;
  if new.assignee_id is not null and (tg_op = 'INSERT' or new.assignee_id is distinct from old.assignee_id)
     and not exists (select 1 from public.workspace_members m where m.workspace_id = new.workspace_id and m.user_id = new.assignee_id) then
    raise exception 'Hanya bisa di-CC ke anggota tim';
  end if;
  -- Orang yang di-CC (bukan pengelola tugas) hanya boleh mencentang.
  if tg_op = 'UPDATE' and auth.uid() is not null and not public.ws_can_edit_task(old.task_id)
     and (new.title <> old.title or new.assignee_id is distinct from old.assignee_id or new.plan_date is distinct from old.plan_date
          or new.task_id <> old.task_id or new.sort <> old.sort) then
    raise exception 'Anda hanya bisa mencentang langkah ini';
  end if;
  return new;
end $$;
drop trigger if exists ws_items_guard_trg on public.ws_task_items;
create trigger ws_items_guard_trg before insert or update on public.ws_task_items for each row execute function public.ws_items_guard();

-- 4. Orang keluar / menolak undangan: lepas dari daftar rekan & CC checklist.
create or replace function public.ws_member_gone() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform set_config('eclub.ws_bypass', '1', true);
  update public.ws_tasks set helpers = array_remove(helpers, old.user_id) where workspace_id = old.workspace_id and old.user_id = any (helpers);
  update public.ws_task_items set assignee_id = null where workspace_id = old.workspace_id and assignee_id = old.user_id and not done;
  return old;
end $$;
drop trigger if exists ws_member_gone_trg on public.workspace_members;
create trigger ws_member_gone_trg after delete on public.workspace_members for each row execute function public.ws_member_gone();

-- 5. Tugas berulang: rekan kerja & CC checklist ikut terbawa ke tugas berikutnya; bukti dikosongkan.
create or replace function public.ws_tasks_repeat() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_step interval; v_new uuid; v_plan date;
begin
  if new.repeat is null or new.status <> 'done' or old.status = 'done' then return new; end if;
  v_step := case new.repeat when 'daily' then interval '1 day' when 'weekly' then interval '7 days' else interval '1 month' end;
  if exists (select 1 from public.ws_tasks x where x.workspace_id = new.workspace_id and x.title = new.title and x.repeat = new.repeat
             and x.status = 'open' and x.assignee_id is not distinct from new.assignee_id and x.plan_date > new.plan_date) then
    return new;
  end if;
  v_plan := greatest((new.plan_date + v_step)::date, ((now() at time zone 'Asia/Jakarta')::date));
  insert into public.ws_tasks (workspace_id, title, description, assignee_id, helpers, created_by, plan_date, due_date, section_id, goal_id, important, repeat)
    values (new.workspace_id, new.title, new.description, new.assignee_id, new.helpers, new.created_by, v_plan,
            case when new.due_date is null then null else greatest((new.due_date + v_step)::date, ((now() at time zone 'Asia/Jakarta')::date)) end,
            new.section_id, new.goal_id, new.important, new.repeat)
    returning id into v_new;
  insert into public.ws_task_items (task_id, workspace_id, title, sort, assignee_id, plan_date)
    select v_new, i.workspace_id, i.title, i.sort, i.assignee_id, case when i.assignee_id is null then null else v_plan end
    from public.ws_task_items i where i.task_id = new.id;
  return new;
end $$;
