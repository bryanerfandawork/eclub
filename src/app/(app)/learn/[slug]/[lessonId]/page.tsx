import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronLeft, Lock, PlayCircle } from "lucide-react";
import { toggleLessonDone } from "@/app/actions/lms";
import { SubmitButton } from "@/components/submit-button";
import { getCourseBySlug, getLessonVideo, sefLockedStep } from "@/lib/lms";
import { getAccount } from "@/lib/plans";

export default async function LessonPage({ params }: { params: Promise<{ slug: string; lessonId: string }> }) {
  const { slug, lessonId } = await params;
  const data = await getCourseBySlug(slug);
  if (!data) notFound();
  const { course: c, lessons, watchable, done } = data;
  const idx = lessons.findIndex((l) => l.id === lessonId);
  if (idx < 0) notFound();
  const lesson = lessons[idx];
  const account = await getAccount();
  const sefBlock = await sefLockedStep(c, account.role === "admin" || account.role === "super_admin");
  const canWatch = !sefBlock && watchable.has(lesson.id);
  const vid = canWatch ? await getLessonVideo(lesson.id) : null;
  const prev = lessons[idx - 1];
  const next = lessons[idx + 1];
  const isDone = done.has(lesson.id);

  return (
    <div className="mx-auto max-w-4xl">
      <Link href={`/learn/${c.slug}`} className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-brand">
        <ChevronLeft className="h-4 w-4" /> {c.title}
      </Link>
      <div className="overflow-hidden rounded-2xl bg-heading shadow-lift">
        {canWatch && vid ? (
          <div className="relative aspect-video">
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${vid}?rel=0&modestbranding=1&playsinline=1`}
              title={lesson.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        ) : (
          <div className="grid aspect-video place-items-center p-6 text-center text-white">
            {canWatch ? (
              <div>
                <PlayCircle className="mx-auto h-10 w-10 text-gold" />
                <p className="mt-3 text-sm text-white/70">Lesson ini berupa materi bacaan.</p>
              </div>
            ) : (
              <div>
                <Lock className="mx-auto h-10 w-10 text-gold" />
                <p className="mt-3 font-semibold">Lesson ini terkunci</p>
                {sefBlock ? (
                  <>
                    <p className="mt-1 text-sm text-white/70">Selesaikan dulu kelas di langkah {sefBlock}.</p>
                    <Link href="/learn" className="btn-gold mt-4">Lihat urutan belajar</Link>
                  </>
                ) : (
                  <Link href={c.access === "purchase" ? `/beli/course/${c.slug}` : "/paket"} className="btn-gold mt-4">
                    {c.access === "purchase" ? "Beli course" : "Upgrade ke Plus"}
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow">
            Lesson {idx + 1} dari {lessons.length}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-heading">{lesson.title}</h1>
          {lesson.summary && <p className="mt-1 text-muted">{lesson.summary}</p>}
        </div>
        {canWatch && (
          <form action={toggleLessonDone}>
            <input type="hidden" name="lesson_id" value={lesson.id} />
            <input type="hidden" name="done" value={String(isDone)} />
            <SubmitButton className={isDone ? "btn-ghost" : "btn-primary"} pendingText="…">
              <CheckCircle2 className={`h-4 w-4 ${isDone ? "text-success" : ""}`} /> {isDone ? "Sudah selesai" : "Tandai selesai"}
            </SubmitButton>
          </form>
        )}
      </div>

      {canWatch && lesson.content && <article className="card mt-6 p-6 leading-relaxed whitespace-pre-line text-ink">{lesson.content}</article>}

      <nav className="mt-8 flex justify-between gap-3">
        {prev ? (
          <Link href={`/learn/${c.slug}/${prev.id}`} className="btn-ghost">
            <ArrowLeft className="h-4 w-4" /> Sebelumnya
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/learn/${c.slug}/${next.id}`} className="btn-primary">
            Berikutnya <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </nav>
    </div>
  );
}
