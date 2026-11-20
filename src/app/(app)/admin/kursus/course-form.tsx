"use client";

import { useActionState } from "react";
import { saveCourse } from "@/app/actions/lms";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/ui";
import type { Course } from "@/lib/lms";
import { SEF_PHASES, SEF_STEPS } from "@/lib/sef";

export function CourseForm({ course }: { course?: Course }) {
  const [state, action] = useActionState(saveCourse, undefined);
  return (
    <form action={action} className="card space-y-4 p-5 lg:p-6">
      {course && <input type="hidden" name="id" value={course.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Judul course</label>
          <input name="title" defaultValue={course?.title} className="input" required />
        </div>
        <div>
          <label className="label">Slug (alamat URL)</label>
          <input name="slug" defaultValue={course?.slug} className="input" placeholder="otomatis dari judul" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Langkah SEF (urutan belajar)</label>
          <select name="sef_step" defaultValue={course?.sef_step ?? ""} className="input">
            <option value="">Tidak masuk jalur SEF (kelas umum)</option>
            {SEF_PHASES.map((p) => (
              <optgroup key={p.key} label={`Fase ${p.name}`}>
                {SEF_STEPS.filter((s) => s.phase === p.key).map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.no}. {s.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted">Kelas di langkah berikutnya terbuka setelah member menyelesaikan semua kelas di langkah sebelumnya.</p>
        </div>
        <div>
          <label className="label">Kategori</label>
          <input name="category" defaultValue={course?.category ?? ""} className="input" placeholder="Entrepreneurship" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Ringkasan singkat</label>
          <input name="summary" defaultValue={course?.summary ?? ""} className="input" maxLength={300} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Deskripsi</label>
          <textarea name="description" defaultValue={course?.description ?? ""} rows={4} className="input resize-y" />
        </div>
        <div>
          <label className="label">Level</label>
          <input name="level" defaultValue={course?.level ?? ""} className="input" placeholder="Pemula" />
        </div>
        <div>
          <label className="label">Pengajar</label>
          <input name="instructor" defaultValue={course?.instructor ?? ""} className="input" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Link gambar cover <span className="font-normal text-muted">(opsional)</span></label>
          <input name="cover_url" defaultValue={course?.cover_url ?? ""} className="input" placeholder="https://…" />
        </div>
      </div>
      <div className="rounded-xl bg-paper p-4">
        <p className="text-sm font-bold text-heading">Siapa yang boleh menonton?</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <label className="label">Akses</label>
            <select name="access" defaultValue={course?.access ?? "registered"} className="input">
              <option value="registered">Gratis untuk semua member</option>
              <option value="plus">Khusus member Plus</option>
              <option value="purchase">Harus dibeli</option>
            </select>
          </div>
          <div>
            <label className="label">Harga (jika dibeli)</label>
            <input name="price" inputMode="numeric" defaultValue={course?.price ? String(course.price) : ""} className="input" placeholder="0" />
          </div>
          <label className="flex items-center gap-2 self-end pb-3 text-sm text-ink">
            <input type="checkbox" name="include_in_plus" defaultChecked={course?.include_in_plus ?? true} className="h-4 w-4 accent-brand" />
            Gratis untuk member Plus
          </label>
        </div>
        <p className="mt-2 text-xs text-muted">Setiap lesson bisa diatur berbeda, misalnya dijadikan cuplikan gratis.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Status</label>
          <select name="status" defaultValue={course?.status ?? "draft"} className="input">
            <option value="draft">Draf (belum tampil)</option>
            <option value="published">Terbit</option>
          </select>
        </div>
        <div>
          <label className="label">Urutan tampil</label>
          <input name="sort" type="number" defaultValue={course?.sort ?? 0} className="input" />
        </div>
      </div>
      <FormMessage state={state} />
      <SubmitButton>{course ? "Simpan course" : "Buat course"}</SubmitButton>
    </form>
  );
}
