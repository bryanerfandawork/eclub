"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { youtubeId } from "@/lib/lms";
import { SEF_STEPS } from "@/lib/sef";
import type { FormState } from "./auth";

const DEMO_MSG = "Mode demo: perubahan tidak disimpan.";
const ACCESS = ["public", "registered", "plus", "purchase"];
const SEF_KEYS: string[] = SEF_STEPS.map((s) => s.key);

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 70);
}

export async function toggleLessonDone(formData: FormData) {
  if (isDemoMode) return;
  const lessonId = String(formData.get("lesson_id"));
  const supabase = await createClient();
  if (formData.get("done") === "true") await supabase.from("lesson_progress").delete().eq("lesson_id", lessonId);
  else await supabase.from("lesson_progress").insert({ lesson_id: lessonId });
  revalidatePath("/learn", "layout");
}

export async function saveCourse(_: FormState, formData: FormData): Promise<FormState> {
  if (isDemoMode) return { error: DEMO_MSG };
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Judul wajib diisi." };
  const access = String(formData.get("access"));
  if (!ACCESS.includes(access)) return { error: "Akses tidak valid." };
  const row = {
    title: title.slice(0, 160),
    slug: slugify(String(formData.get("slug") || title)) || `course-${Date.now()}`,
    summary: String(formData.get("summary") ?? "").trim().slice(0, 300) || null,
    description: String(formData.get("description") ?? "").trim().slice(0, 5000) || null,
    cover_url: String(formData.get("cover_url") ?? "").trim().slice(0, 500) || null,
    category: String(formData.get("category") ?? "").trim().slice(0, 60) || null,
    level: String(formData.get("level") ?? "").trim().slice(0, 40) || null,
    instructor: String(formData.get("instructor") ?? "").trim().slice(0, 80) || null,
    access,
    include_in_plus: formData.get("include_in_plus") === "on",
    price: Number(String(formData.get("price") ?? "").replace(/[^\d]/g, "")) || 0,
    status: formData.get("status") === "published" ? "published" : "draft",
    sort: Number(formData.get("sort") ?? 0) || 0,
    sef_step: SEF_KEYS.includes(String(formData.get("sef_step"))) ? String(formData.get("sef_step")) : null,
  };
  const supabase = await createClient();
  const res = id
    ? await supabase.from("courses").update(row).eq("id", id).select("id").single()
    : await supabase.from("courses").insert(row).select("id").single();
  if (res.error) return { error: res.error.message.includes("duplicate") ? "Slug sudah dipakai course lain." : "Gagal menyimpan: " + res.error.message };
  revalidatePath("/learn", "layout");
  revalidatePath("/admin/kursus", "layout");
  if (!id) redirect(`/admin/kursus/${res.data.id}`);
  return { message: "Course tersimpan." };
}

export async function deleteCourse(formData: FormData) {
  if (isDemoMode) return;
  const supabase = await createClient();
  await supabase.from("courses").delete().eq("id", String(formData.get("id")));
  revalidatePath("/learn", "layout");
  redirect("/admin/kursus");
}

export async function saveLesson(_: FormState, formData: FormData): Promise<FormState> {
  if (isDemoMode) return { error: DEMO_MSG };
  const id = String(formData.get("id") ?? "");
  const courseId = String(formData.get("course_id"));
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Judul lesson wajib diisi." };
  const accessRaw = String(formData.get("access") ?? "");
  const access = accessRaw === "" ? null : ["preview", ...ACCESS].includes(accessRaw) ? accessRaw : null;
  const videoInput = String(formData.get("video") ?? "").trim();
  const vid = videoInput ? youtubeId(videoInput) : null;
  if (videoInput && !vid) return { error: "Link YouTube tidak dikenali." };

  const row = {
    course_id: courseId,
    title: title.slice(0, 160),
    summary: String(formData.get("summary") ?? "").trim().slice(0, 300) || null,
    content: String(formData.get("content") ?? "").trim().slice(0, 20000) || null,
    duration_min: Number(formData.get("duration_min")) || null,
    access,
    sort: Number(formData.get("sort") ?? 0) || 0,
  };
  const supabase = await createClient();
  const res = id
    ? await supabase.from("lessons").update(row).eq("id", id).select("id").single()
    : await supabase.from("lessons").insert(row).select("id").single();
  if (res.error) return { error: "Gagal menyimpan lesson: " + res.error.message };
  const lessonId = res.data.id;
  if (vid) {
    const { error } = await supabase.from("lesson_videos").upsert({ lesson_id: lessonId, youtube_id: vid });
    if (error) return { error: "Lesson tersimpan, tetapi video gagal: " + error.message };
  } else if (id && formData.get("clear_video") === "on") {
    await supabase.from("lesson_videos").delete().eq("lesson_id", lessonId);
  }
  revalidatePath("/learn", "layout");
  revalidatePath(`/admin/kursus/${courseId}`);
  return { message: id ? "Lesson diperbarui." : "Lesson ditambahkan." };
}

export async function deleteLesson(formData: FormData) {
  if (isDemoMode) return;
  const supabase = await createClient();
  await supabase.from("lessons").delete().eq("id", String(formData.get("id")));
  revalidatePath("/learn", "layout");
  revalidatePath(`/admin/kursus/${String(formData.get("course_id"))}`);
}

export async function grantCourse(_: FormState, formData: FormData): Promise<FormState> {
  if (isDemoMode) return { error: DEMO_MSG };
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const courseId = String(formData.get("course_id"));
  const supabase = await createClient();
  const { data: users } = await supabase.rpc("admin_list_users", { search: email, lim: 5, off: 0 });
  const u = (users as { id: string; email: string }[] | null)?.find((x) => x.email.toLowerCase() === email);
  if (!u) return { error: "Pengguna dengan email itu tidak ditemukan." };
  const { error } = await supabase.from("course_entitlements").upsert({ user_id: u.id, course_id: courseId, source: "manual" });
  if (error) return { error: "Gagal: " + error.message };
  return { message: `Akses diberikan ke ${email}.` };
}
