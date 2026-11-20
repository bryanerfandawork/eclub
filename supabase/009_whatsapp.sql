-- EClub 009: Notifikasi WhatsApp (Fonnte). Member harus mengaktifkan sendiri (opt-in).
alter table public.profiles add column if not exists whatsapp text;
alter table public.profiles add column if not exists wa_opt_in boolean not null default false;
alter table public.profiles add column if not exists wa_daily boolean not null default true;
grant update (whatsapp, wa_opt_in, wa_daily) on public.profiles to authenticated;

-- Catatan pengiriman (untuk pembatasan: maksimal 1 pengingat per hari per orang). Hanya server yang menulis.
create table if not exists public.notification_log (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null,
  status text not null,
  created_at timestamptz not null default now()
);
create index if not exists notification_log_user_idx on public.notification_log (user_id, created_at desc);
alter table public.notification_log enable row level security;
drop policy if exists "log notifikasi milik sendiri" on public.notification_log;
create policy "log notifikasi milik sendiri" on public.notification_log for select using (auth.uid() = user_id);
grant select on public.notification_log to authenticated;
