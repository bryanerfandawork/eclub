-- 026: Ruang Kerja Tim putaran 3: checklist di dalam tugas, status "sedang dikerjakan" (papan),
--      tugas berulang (harian/mingguan/bulanan), dan diskusi tim per ruang kerja.
--      Butuh SQL 024 & 025. Aman dijalankan ulang.

-- 1. Kolom baru di tugas
alter table public.ws_tasks add column if not exists started_at timestamptz;
alter table public.ws_tasks add column if not exists repeat text;
do $$ begin
  alter table public.ws_tasks add constraint ws_tasks_repeat_chk check (repeat is null or repeat in ('daily', 'weekly', 'monthly'));
exception when duplicate_object then null; end $$;

-- 2. Checklist (langkah kecil) di dalam tugas
create table if not exists public.ws_task_items (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.ws_tasks (id) on delete cascade,
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  done boolean not null default false,
  sort int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists ws_task_items_task_idx on public.ws_task_items (task_id, sort);
alter table public.ws_task_items enable row level security;

-- Boleh diubah oleh pemilik/admin, atau oleh penanggung jawab tugas itu.
create or replace function public.ws_can_edit_task(p_task uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.ws_tasks t
    where t.id = p_task and (public.ws_is_manager(t.workspace_id) or (t.assignee_id = auth.uid() and public.ws_is_member(t.workspace_id)))
  );
$$;
grant execute on function public.ws_can_edit_task to authenticated;

drop policy if exists wsi_select on public.ws_task_items;
create policy wsi_select on public.ws_task_items for select using (public.ws_is_member(workspace_id));
drop policy if exists wsi_write on public.ws_task_items;
create policy wsi_write on public.ws_task_items for all
  using (public.ws_can_edit_task(task_id))
  with check (public.ws_can_edit_task(task_id) and exists (select 1 from public.ws_tasks t where t.id = task_id and t.workspace_id = ws_task_items.workspace_id));
grant select, insert, update, delete on public.ws_task_items to authenticated;
grant all on public.ws_task_items to service_role;

-- 3. Diskusi tim (obrolan satu ruang kerja)
create table if not exists public.ws_messages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index if not exists ws_messages_ws_idx on public.ws_messages (workspace_id, created_at desc);
alter table public.ws_messages enable row level security;
drop policy if exists wsmsg_select on public.ws_messages;
create policy wsmsg_select on public.ws_messages for select using (public.ws_is_member(workspace_id));
drop policy if exists wsmsg_insert on public.ws_messages;
create policy wsmsg_insert on public.ws_messages for insert with check (user_id = auth.uid() and public.ws_is_member(workspace_id));
drop policy if exists wsmsg_delete on public.ws_messages;
create policy wsmsg_delete on public.ws_messages for delete using (user_id = auth.uid() or public.ws_is_manager(workspace_id));
grant select, insert, delete on public.ws_messages to authenticated;
grant all on public.ws_messages to service_role;

-- 4. Aturan ubah tugas: "berulang" hanya pemilik/admin.
create or replace function public.ws_tasks_guard() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_bypass boolean := coalesce(current_setting('eclub.ws_bypass', true), '') = '1';
begin
  new.updated_at := now();
  if new.status = 'done' and old.status <> 'done' then new.done_at := now(); end if;
  if new.status <> 'done' then new.done_at := null; end if;
  if auth.uid() is not null and not v_bypass then
    if not public.ws_is_manager(old.workspace_id) then
      if new.workspace_id <> old.workspace_id or new.title <> old.title or new.description is distinct from old.description
         or new.assignee_id is distinct from old.assignee_id or new.created_by is distinct from old.created_by
         or new.due_date is distinct from old.due_date or new.goal_id is distinct from old.goal_id
         or new.sprint_id is distinct from old.sprint_id or new.section_id is distinct from old.section_id
         or new.important is distinct from old.important or new.archived is distinct from old.archived
         or new.repeat is distinct from old.repeat or new.status = 'closed' then
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
    raise exception 'Tahapan tidak ditemukan';
  end if;
  return new;
end $$;

-- 5. Tugas berulang: saat ditandai selesai, otomatis dibuat tugas berikutnya (checklist ikut, belum dicentang).
create or replace function public.ws_tasks_repeat() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_step interval; v_new uuid;
begin
  if new.repeat is null or new.status <> 'done' or old.status = 'done' then return new; end if;
  v_step := case new.repeat when 'daily' then interval '1 day' when 'weekly' then interval '7 days' else interval '1 month' end;
  -- Jangan dobel kalau dicentang-batal-centang lagi.
  if exists (select 1 from public.ws_tasks x where x.workspace_id = new.workspace_id and x.title = new.title and x.repeat = new.repeat
             and x.status = 'open' and x.assignee_id is not distinct from new.assignee_id and x.plan_date > new.plan_date) then
    return new;
  end if;
  insert into public.ws_tasks (workspace_id, title, description, assignee_id, created_by, plan_date, due_date, section_id, goal_id, important, repeat)
    values (new.workspace_id, new.title, new.description, new.assignee_id, new.created_by,
            greatest((new.plan_date + v_step)::date, ((now() at time zone 'Asia/Jakarta')::date)),
            case when new.due_date is null then null else greatest((new.due_date + v_step)::date, ((now() at time zone 'Asia/Jakarta')::date)) end,
            new.section_id, new.goal_id, new.important, new.repeat)
    returning id into v_new;
  insert into public.ws_task_items (task_id, workspace_id, title, sort)
    select v_new, i.workspace_id, i.title, i.sort from public.ws_task_items i where i.task_id = new.id;
  return new;
end $$;
drop trigger if exists ws_tasks_repeat_trg on public.ws_tasks;
create trigger ws_tasks_repeat_trg after update on public.ws_tasks for each row execute function public.ws_tasks_repeat();
