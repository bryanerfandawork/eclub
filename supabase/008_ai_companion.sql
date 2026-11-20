-- EClub 008: AI Companion (riwayat percakapan + pencatatan pemakaian)
create table if not exists public.ai_messages (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  input_tokens integer,
  output_tokens integer,
  created_at timestamptz not null default now()
);
create index if not exists ai_messages_user_idx on public.ai_messages (user_id, created_at desc);
alter table public.ai_messages enable row level security;

drop policy if exists "pesan ai milik sendiri" on public.ai_messages;
create policy "pesan ai milik sendiri" on public.ai_messages
  for select using (auth.uid() = user_id);
drop policy if exists "tambah pesan ai sendiri" on public.ai_messages;
create policy "tambah pesan ai sendiri" on public.ai_messages
  for insert with check (auth.uid() = user_id);
-- Sengaja tanpa izin hapus/ubah, supaya kuota harian tidak bisa diakali.
grant select, insert on public.ai_messages to authenticated;

-- Kuota AI per hari (bisa diubah di Admin > Paket & Fitur)
update public.plan_features
  set description = 'Kuota pesan AI per hari', unit = 'pesan/hari', free_limit = 5, plus_limit = 50, enforced = true
  where key = 'ai_messages';

-- Ringkasan pemakaian untuk admin
create or replace function public.admin_ai_usage() returns json
language plpgsql stable security definer set search_path = '' as $$
begin
  perform public.require_admin();
  return json_build_object(
    'today', (select count(*) from public.ai_messages where role = 'user' and created_at >= date_trunc('day', now() at time zone 'Asia/Jakarta') at time zone 'Asia/Jakarta'),
    'month', (select count(*) from public.ai_messages where role = 'user' and created_at >= now() - interval '30 days'),
    'tokens_in', (select coalesce(sum(input_tokens), 0) from public.ai_messages where created_at >= now() - interval '30 days'),
    'tokens_out', (select coalesce(sum(output_tokens), 0) from public.ai_messages where created_at >= now() - interval '30 days')
  );
end $$;
revoke execute on function public.admin_ai_usage from public, anon;
grant execute on function public.admin_ai_usage to authenticated;
