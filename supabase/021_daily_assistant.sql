-- 021: Asisten harian (pekerjaan/aktivitas rutin, kebiasaan terkait mimpi, laporan harian follow-up/tutup)
--      + ganti kode affiliate sendiri (1 kali). Aman dijalankan ulang.

-- 1. Pekerjaan / aktivitas rutin (Kuliah, Latihan sepak bola, Usaha katering, ...) yang mendukung mimpi tertentu.
create table if not exists public.works (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  name text not null check (char_length(name) between 1 and 60),
  dream_id uuid references public.dreams (id) on delete set null,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists works_user_idx on public.works (user_id, archived);
alter table public.works enable row level security;
drop policy if exists works_own on public.works;
create policy works_own on public.works for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update, delete on public.works to authenticated;
grant all on public.works to service_role;

-- 2. Kebiasaan bisa dikaitkan ke mimpi.
alter table public.habits add column if not exists dream_id uuid references public.dreams (id) on delete set null;

-- 3. Rencana aksi harian: bagian dari pekerjaan apa, status, dan berapa kali ditunda (follow-up).
alter table public.daily_actions add column if not exists work_id uuid references public.works (id) on delete set null;
alter table public.daily_actions add column if not exists status text not null default 'open';
alter table public.daily_actions add column if not exists origin_date date;
alter table public.daily_actions add column if not exists followups smallint not null default 0;
alter table public.daily_actions add column if not exists closed_at timestamptz;
do $$ begin
  alter table public.daily_actions add constraint daily_actions_status_chk check (status in ('open', 'done', 'closed'));
exception when duplicate_object then null; end $$;
update public.daily_actions set status = 'done' where done and status = 'open';
update public.daily_actions set origin_date = action_date where origin_date is null;
grant all on public.daily_actions to service_role;
grant all on public.habits, public.habit_logs to service_role;

-- 4. Paket gratis: 3 rencana aksi per hari (kebiasaan tidak dihitung). Plus tanpa batas.
update public.plan_features set label = 'Rencana aksi harian', description = 'Jumlah rencana aksi baru per hari (kebiasaan tidak dihitung)', free_limit = 3, unit = 'rencana/hari', enforced = true
  where key = 'daily_action' and free_limit is null;
update public.plan_features set label = 'Kebiasaan harian' where key = 'habits' and label = 'Habit tracker';

-- 5. Kode affiliate: member Plus boleh mengganti sekali, selama kode lama belum pernah dipakai.
alter table public.profiles add column if not exists ref_code_changed boolean not null default false;

create or replace function public.set_my_ref_code(p_code text) returns text
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid(); v_code text := upper(trim(coalesce(p_code, ''))); p record;
begin
  if v_uid is null then raise exception 'Silakan masuk'; end if;
  select plan, plan_expires_at, role, ref_code, ref_code_changed into p from public.profiles where id = v_uid;
  if not ((p.plan = 'plus' and (p.plan_expires_at is null or p.plan_expires_at > now())) or p.role in ('admin', 'super_admin')) then
    raise exception 'Khusus member Plus';
  end if;
  if p.ref_code_changed then raise exception 'Kode hanya bisa diganti satu kali'; end if;
  if v_code !~ '^[A-Z0-9]{4,15}$' then raise exception 'Kode 4-15 karakter, hanya huruf dan angka'; end if;
  if v_code = p.ref_code then raise exception 'Kode sama dengan yang sekarang'; end if;
  if exists (select 1 from public.referrals where referrer_id = v_uid)
     or exists (select 1 from public.orders where coupon_referrer = v_uid)
     or exists (select 1 from public.affiliate_commissions where referrer_id = v_uid) then
    raise exception 'Kode sudah pernah dipakai teman, jadi tidak bisa diganti';
  end if;
  begin
    update public.profiles set ref_code = v_code, ref_code_changed = true where id = v_uid;
  exception when unique_violation then
    raise exception 'Kode sudah dipakai orang lain, coba yang lain';
  end;
  return v_code;
end $$;
revoke execute on function public.set_my_ref_code from public, anon;
grant execute on function public.set_my_ref_code to authenticated;
