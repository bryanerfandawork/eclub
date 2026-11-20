import Link from "next/link";
import { CourseCover } from "@/components/course-cover";
import { ACCESS_LABEL, listCourses } from "@/lib/lms";
import { CourseForm } from "./course-form";

export const metadata = { title: "Admin · Course" };

export default async function AdminCourses() {
  const courses = await listCourses(true);
  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <section className="space-y-3 lg:col-span-2">
        <h2 className="font-bold text-heading">Semua course ({courses.length})</h2>
        {courses.map((c) => (
          <Link key={c.id} href={`/admin/kursus/${c.id}`} className="card flex items-center gap-3 overflow-hidden p-3 hover:shadow-lift">
            <div className="w-24 shrink-0 overflow-hidden rounded-lg">
              <CourseCover url={c.cover_url} title={c.title} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-heading">{c.title}</p>
              <p className="text-xs text-muted">
                {c.status === "published" ? "Terbit" : "Draf"} · {ACCESS_LABEL[c.access]}
              </p>
            </div>
          </Link>
        ))}
        {courses.length === 0 && <p className="text-sm text-muted">Belum ada course.</p>}
      </section>
      <section className="lg:col-span-3">
        <h2 className="mb-3 font-bold text-heading">Buat course baru</h2>
        <CourseForm />
      </section>
    </div>
  );
}
