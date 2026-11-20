"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { ChevronDown, Lock, PlayCircle, Trash2 } from "lucide-react";
import { deleteLesson, grantCourse, saveLesson } from "@/app/actions/lms";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/ui";
import type { Lesson } from "@/lib/lms";

const ACCESS_OPTIONS = [
  ["", "Ikuti pengaturan course"],
  ["preview", "Cuplikan gratis (semua member)"],
  ["registered", "Gratis untuk semua member"],
  ["plus", "Khusus member Plus"],
  ["purchase", "Harus beli course"],
] as const;

export function LessonForm({ courseId, lesson, video, nextSort }: { courseId: string; lesson?: Lesson; video?: string; nextSort?: number }) {
  const [state, action] = useActionState(saveLesson, undefined);
  const [open, setOpen] = useState(!lesson);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.message && !lesson) ref.current?.reset();
  }, [state, lesson]);

  const fields = (
    <>
      <input type="hidden" name="course_id" value={courseId} />
      {lesson && <input type="hidden" name="id" value={lesson.id} />}
      <div className="grid gap-3 sm:grid-cols-[1fr_100px_90px]">
        <input name="title" defaultValue={lesson?.title} className="input" placeholder="Judul lesson" required />
        <input name="duration_min" type="number" min={0} defaultValue={lesson?.duration_min ?? ""} className="input" placeholder="Menit" />
        <input name="sort" type="number" defaultValue={lesson?.sort ?? nextSort ?? 0} className="input" title="Urutan" />
      </div>
      <input name="video" className="input" placeholder={video ? `Video sekarang: youtu.be/${video} (isi untuk mengganti)` : "Link video YouTube (unlisted)"} />
      {video && (
        <label className="flex items-center gap-2 text-xs text-muted">
          <input type="checkbox" name="clear_video" className="accent-brand" /> Hapus video dari lesson ini
        </label>
      )}
      <select name="access" defaultValue={lesson?.access ?? ""} className="input">
        {ACCESS_OPTIONS.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
      <input name="summary" defaultValue={lesson?.summary ?? ""} className="input" placeholder="Ringkasan singkat (opsional)" />
      <textarea name="content" defaultValue={lesson?.content ?? ""} rows={3} className="input resize-y" placeholder="Materi bacaan / catatan (opsional)" />
      <FormMessage state={state} />
      <div className="flex items-center justify-between">
        <SubmitButton className="btn-primary py-2">{lesson ? "Simpan lesson" : "Tambah lesson"}</SubmitButton>
      </div>
    </>
  );

  if (!lesson) {
    return (
      <form ref={ref} action={action} className="card space-y-3 p-5">
        <p className="font-bold text-heading">Tambah lesson</p>
        {fields}
      </form>
    );
  }

  return (
    <div className="card p-4">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-3 text-left">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-paper text-xs font-bold text-muted">{lesson.sort}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-heading">{lesson.title}</span>
          <span className="flex items-center gap-2 text-xs text-muted">
            {video ? <PlayCircle className="h-3 w-3 text-success" /> : <span className="text-danger">tanpa video</span>}
            {lesson.access ? (
              <span>
                <Lock className="mr-0.5 inline h-3 w-3" />
                {ACCESS_OPTIONS.find((o) => o[0] === lesson.access)?.[1]}
              </span>
            ) : null}
          </span>
        </span>
        <ChevronDown className={`h-4 w-4 text-muted transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="mt-4 space-y-3 border-t border-line pt-4">
          <form action={action} className="space-y-3">
            {fields}
          </form>
          <form action={deleteLesson}>
            <input type="hidden" name="id" value={lesson.id} />
            <input type="hidden" name="course_id" value={courseId} />
            <button className="flex items-center gap-1.5 text-xs font-medium text-danger/80 hover:text-danger">
              <Trash2 className="h-3.5 w-3.5" /> Hapus lesson
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export function GrantForm({ courseId }: { courseId: string }) {
  const [state, action] = useActionState(grantCourse, undefined);
  return (
    <form action={action} className="card space-y-3 p-5">
      <p className="font-bold text-heading">Beri akses manual</p>
      <p className="text-xs text-muted">Untuk peserta program atau pembeli di luar aplikasi.</p>
      <input type="hidden" name="course_id" value={courseId} />
      <div className="flex gap-2">
        <input name="email" type="email" className="input" placeholder="email@peserta.com" required />
        <SubmitButton className="btn-primary shrink-0 py-2" pendingText="…">Beri</SubmitButton>
      </div>
      <FormMessage state={state} />
    </form>
  );
}
