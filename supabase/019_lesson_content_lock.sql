-- 019: Kunci isi materi kelas.
-- Sebelumnya kolom lessons.content (materi bacaan) bisa dibaca siapa saja lewat API publik,
-- termasuk materi kelas Plus/berbayar. Sekarang isi materi hanya diberikan ke yang berhak
-- lewat fungsi lesson_content(). Judul & ringkasan tetap publik untuk halaman pratinjau.
-- Aman dijalankan ulang.

revoke select on public.lessons from anon, authenticated;
grant select (id, course_id, title, summary, duration_min, access, sort, created_at) on public.lessons to anon, authenticated;
grant all on public.lessons to service_role;

create or replace function public.lesson_content(lid uuid) returns text
language plpgsql stable security definer set search_path = '' as $$
begin
  if public.is_staff() or public.can_watch(lid) then
    return (select content from public.lessons where id = lid);
  end if;
  return null;
end $$;
revoke execute on function public.lesson_content from public;
grant execute on function public.lesson_content to anon, authenticated, service_role;
