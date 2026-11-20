-- EClub tahap 5: Learning Center (course, lesson, video YouTube, akses)
-- Cara pakai: Supabase > SQL Editor > New query > tempel seluruh isi file ini > Run.

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,80}$'),
  title text not null,
  summary text,
  description text,
  cover_url text,
  category text,
  level text,
  instructor text,
  -- public = semua orang, registered = pengguna login, plus = member Plus, purchase = harus dibeli (atau Plus bila include_in_plus)
  access text not null default 'registered' check (access in ('public', 'registered', 'plus', 'purchase')),
  include_in_plus boolean not null default true,
  price integer not null default 0 check (price >= 0),
  status text not null default 'draft' check (status in ('draft', 'published')),
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  summary text,
  content text,
  duration_min integer,
  -- null = ikut pengaturan course; 'preview' = bisa ditonton siapa saja sebagai cuplikan
  access text check (access is null or access in ('preview', 'public', 'registered', 'plus', 'purchase')),
  sort integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists lessons_course_idx on public.lessons (course_id, sort);

-- ID video dipisah agar hanya terkirim ke orang yang berhak menonton
create table if not exists public.lesson_videos (
  lesson_id uuid primary key references public.lessons (id) on delete cascade,
  youtube_id text not null check (youtube_id ~ '^[A-Za-z0-9_-]{6,20}$')
);

create table if not exists public.course_entitlements (
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  source text not null default 'manual',
  created_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

create table if not exists public.lesson_progress (
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_videos enable row level security;
alter table public.course_entitlements enable row level security;
alter table public.lesson_progress enable row level security;

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = '' as $$
  select public.my_role() in ('admin', 'super_admin');
$$;

create or replace function public.has_plus() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and plan = 'plus' and (plan_expires_at is null or plan_expires_at > now())
  );
$$;

-- Aturan akses satu lesson
create or replace function public.can_watch(lid uuid) returns boolean
language plpgsql stable security definer set search_path = '' as $$
declare
  l record;
  rule text;
begin
  if public.is_staff() then return true; end if;
  select ls.access as l_access, c.access as c_access, c.include_in_plus, c.status, c.id as cid
    into l from public.lessons ls join public.courses c on c.id = ls.course_id where ls.id = lid;
  if not found or l.status <> 'published' then return false; end if;
  rule := coalesce(l.l_access, l.c_access);
  if rule in ('preview', 'public') then return true; end if;
  if auth.uid() is null then return false; end if;
  if rule = 'registered' then return true; end if;
  if rule = 'plus' then return public.has_plus(); end if;
  -- purchase
  return exists (select 1 from public.course_entitlements e where e.user_id = auth.uid() and e.course_id = l.cid)
    or (l.include_in_plus and public.has_plus());
end;
$$;

drop policy if exists "course terbit bisa dilihat" on public.courses;
create policy "course terbit bisa dilihat" on public.courses for select using (status = 'published' or public.is_staff());
drop policy if exists "staff kelola course" on public.courses;
create policy "staff kelola course" on public.courses for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "lesson terbit bisa dilihat" on public.lessons;
create policy "lesson terbit bisa dilihat" on public.lessons for select
  using (public.is_staff() or exists (select 1 from public.courses c where c.id = course_id and c.status = 'published'));
drop policy if exists "staff kelola lesson" on public.lessons;
create policy "staff kelola lesson" on public.lessons for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "video untuk yang berhak" on public.lesson_videos;
create policy "video untuk yang berhak" on public.lesson_videos for select using (public.can_watch(lesson_id));
drop policy if exists "staff kelola video" on public.lesson_videos;
create policy "staff kelola video" on public.lesson_videos for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "hak akses milik sendiri" on public.course_entitlements;
create policy "hak akses milik sendiri" on public.course_entitlements for select using (auth.uid() = user_id or public.is_staff());
drop policy if exists "staff kelola hak akses" on public.course_entitlements;
create policy "staff kelola hak akses" on public.course_entitlements for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "progress milik sendiri" on public.lesson_progress;
create policy "progress milik sendiri" on public.lesson_progress for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id and public.can_watch(lesson_id));

grant select on public.courses, public.lessons, public.lesson_videos to anon, authenticated;
grant insert, update, delete on public.courses, public.lessons, public.lesson_videos to authenticated;
grant select, insert, delete on public.course_entitlements to authenticated;
grant select, insert, delete on public.lesson_progress to authenticated;
grant execute on function public.can_watch, public.is_staff, public.has_plus to anon, authenticated;
