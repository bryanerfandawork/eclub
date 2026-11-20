import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink, Trash2 } from "lucide-react";
import { deleteCourse } from "@/app/actions/lms";
import { getCourseVideos, listCourses } from "@/lib/lms";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { Lesson } from "@/lib/lms";
import { CourseForm } from "../course-form";
import { GrantForm, LessonForm } from "./lesson-form";

export default async function AdminCourseEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = (await listCourses(true)).find((c) => c.id === id);
  if (!course) notFound();
  let lessons: Lesson[] = [];
  if (!isDemoMode) {
    const supabase = await createClient();
    const { data } = await supabase.from("lessons").select("*").eq("course_id", id).order("sort").order("created_at");
    lessons = (data ?? []) as Lesson[];
  }
  const videos = await getCourseVideos(lessons.map((l) => l.id));
  const nextSort = lessons.length ? Math.max(...lessons.map((l) => l.sort)) + 1 : 1;

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <Link href="/admin/kursus" className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-brand">
          <ChevronLeft className="h-4 w-4" /> Semua course
        </Link>
        <Link href={`/learn/${course.slug}`} className="inline-flex items-center gap-1 text-sm font-medium text-brand">
          Lihat sebagai pengguna <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <section className="space-y-4 lg:col-span-3">
          <h2 className="font-bold text-heading">Lesson ({lessons.length})</h2>
          {lessons.map((l) => (
            <LessonForm key={l.id} courseId={id} lesson={l} video={videos[l.id]} />
          ))}
          <LessonForm courseId={id} nextSort={nextSort} />
          <p className="rounded-xl bg-gold-soft px-4 py-3 text-xs leading-relaxed text-heading">
            Tips: unggah video ke YouTube dengan visibilitas <b>Unlisted</b> (Tidak publik), lalu tempel link-nya di sini. Video tidak muncul di pencarian YouTube dan link-nya hanya dikirim ke pengguna yang berhak. Namun, siapa pun yang sudah mendapat link tetap bisa membagikannya.
          </p>
        </section>
        <aside className="space-y-4 lg:col-span-2">
          <h2 className="font-bold text-heading">Pengaturan course</h2>
          <CourseForm course={course} />
          <GrantForm courseId={id} />
          <form action={deleteCourse} className="text-right">
            <input type="hidden" name="id" value={id} />
            <button className="inline-flex items-center gap-1.5 text-sm font-medium text-danger/80 hover:text-danger">
              <Trash2 className="h-4 w-4" /> Hapus course
            </button>
          </form>
        </aside>
      </div>
    </>
  );
}
