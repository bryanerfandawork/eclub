import "server-only";
import { isDemoMode } from "./supabase/config";
import { createClient } from "./supabase/server";
import { SEF_STEPS, type SefStepKey } from "./sef";

export type Access = "public" | "registered" | "plus" | "purchase";
export type Course = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  description: string | null;
  cover_url: string | null;
  category: string | null;
  level: string | null;
  instructor: string | null;
  access: Access;
  include_in_plus: boolean;
  price: number;
  status: "draft" | "published";
  sort: number;
  sef_step?: SefStepKey | null;
};
export type Lesson = {
  id: string;
  course_id: string;
  title: string;
  summary: string | null;
  content: string | null;
  duration_min: number | null;
  access: "preview" | Access | null;
  sort: number;
};

export const ACCESS_LABEL: Record<string, string> = {
  public: "Gratis",
  registered: "Gratis untuk member",
  plus: "EClub Plus",
  purchase: "Berbayar",
  preview: "Cuplikan gratis",
};

export function youtubeId(input: string) {
  const s = input.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  const m = s.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/|\/live\/)([A-Za-z0-9_-]{11})/);
  return m?.[1] ?? null;
}

const demoCourse: Course = {
  id: "demo-c1",
  slug: "fondasi-entrepreneur",
  title: "Fondasi Entrepreneur: Fase SURVIVE",
  summary: "Mengenali potensi, memahami pasar, dan mendapatkan pelanggan pertama.",
  description: "Course pembuka Sustainable Entrepreneur Framework. Cocok untuk Anda yang baru memulai usaha atau ingin menata ulang fondasinya.",
  cover_url: null,
  category: "Entrepreneurship",
  level: "Pemula",
  instructor: "Tim EClub",
  access: "plus",
  include_in_plus: true,
  price: 199000,
  status: "published",
  sort: 0,
  sef_step: "personal_mapping",
};
const demoLessons: Lesson[] = [
  { id: "l1", course_id: "demo-c1", title: "Selamat datang: entrepreneurnya dulu", summary: null, content: null, duration_min: 6, access: "preview", sort: 0 },
  { id: "l2", course_id: "demo-c1", title: "Personal mapping untuk entrepreneur", summary: null, content: null, duration_min: 14, access: null, sort: 1 },
  { id: "l3", course_id: "demo-c1", title: "Menemukan pelanggan pertama", summary: null, content: null, duration_min: 18, access: null, sort: 2 },
];

export async function listCourses(includeDrafts = false): Promise<Course[]> {
  if (isDemoMode) return [demoCourse];
  const supabase = await createClient();
  let q = supabase.from("courses").select("*").order("sort").order("created_at", { ascending: false });
  if (!includeDrafts) q = q.eq("status", "published");
  const { data } = await q;
  return (data ?? []) as Course[];
}

export async function getCourseBySlug(slug: string) {
  if (isDemoMode) {
    if (slug !== demoCourse.slug) return null;
    return { course: demoCourse, lessons: demoLessons, watchable: new Set(["l1"]), done: new Set<string>() };
  }
  const supabase = await createClient();
  const { data: course } = await supabase.from("courses").select("*").eq("slug", slug).maybeSingle();
  if (!course) return null;
  const { data: lessons } = await supabase.from("lessons").select("*").eq("course_id", course.id).order("sort").order("created_at");
  const ids = (lessons ?? []).map((l) => l.id);
  const [{ data: vids }, { data: prog }] = await Promise.all([
    ids.length ? supabase.from("lesson_videos").select("lesson_id").in("lesson_id", ids) : Promise.resolve({ data: [] as { lesson_id: string }[] }),
    ids.length ? supabase.from("lesson_progress").select("lesson_id").in("lesson_id", ids) : Promise.resolve({ data: [] as { lesson_id: string }[] }),
  ]);
  // Lesson tanpa video tetap bisa dibuka bila aturan aksesnya mengizinkan; cek lewat fungsi database.
  const watchable = new Set((vids ?? []).map((v) => v.lesson_id));
  const noVideo = ids.filter((id) => !watchable.has(id));
  if (noVideo.length) {
    const checks = await Promise.all(noVideo.map((id) => supabase.rpc("can_watch", { lid: id })));
    noVideo.forEach((id, i) => checks[i].data === true && watchable.add(id));
  }
  return {
    course: course as Course,
    lessons: (lessons ?? []) as Lesson[],
    watchable,
    done: new Set((prog ?? []).map((p) => p.lesson_id)),
  };
}

export async function getLessonVideo(lessonId: string): Promise<string | null> {
  if (isDemoMode) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("lesson_videos").select("youtube_id").eq("lesson_id", lessonId).maybeSingle();
  return data?.youtube_id ?? null;
}

/** Untuk admin: ID video semua lesson dalam satu course. */
export async function getCourseVideos(lessonIds: string[]): Promise<Record<string, string>> {
  if (isDemoMode || !lessonIds.length) return {};
  const supabase = await createClient();
  const { data } = await supabase.from("lesson_videos").select("lesson_id, youtube_id").in("lesson_id", lessonIds);
  return Object.fromEntries((data ?? []).map((v) => [v.lesson_id, v.youtube_id]));
}

export type SefProgress = {
  /** Jumlah lesson & yang selesai per course. */
  courses: Record<string, { total: number; done: number }>;
  /** Langkah SEF yang sudah terbuka (jenjang: langkah berikutnya terbuka setelah semua kelas di langkah sebelumnya selesai). */
  unlocked: Set<SefStepKey>;
  /** Persentase selesai per langkah (null = belum ada kelas). */
  stepPct: Record<SefStepKey, number | null>;
};

export async function getSefProgress(courses: Course[]): Promise<SefProgress> {
  const map: SefProgress["courses"] = {};
  if (!isDemoMode && courses.length) {
    const supabase = await createClient();
    const { data: ls } = await supabase.from("lessons").select("id, course_id").in("course_id", courses.map((c) => c.id));
    const ids = (ls ?? []).map((l) => l.id);
    const { data: prog } = ids.length ? await supabase.from("lesson_progress").select("lesson_id").in("lesson_id", ids) : { data: [] };
    const done = new Set((prog ?? []).map((p) => p.lesson_id));
    for (const l of ls ?? []) {
      map[l.course_id] ??= { total: 0, done: 0 };
      map[l.course_id].total++;
      if (done.has(l.id)) map[l.course_id].done++;
    }
  }
  const unlocked = new Set<SefStepKey>();
  const stepPct = {} as SefProgress["stepPct"];
  let open = true;
  for (const step of SEF_STEPS) {
    if (open) unlocked.add(step.key);
    const inStep = courses.filter((c) => c.sef_step === step.key && c.status === "published");
    const total = inStep.reduce((s, c) => s + (map[c.id]?.total ?? 0), 0);
    const done = inStep.reduce((s, c) => s + (map[c.id]?.done ?? 0), 0);
    stepPct[step.key] = total ? Math.round((done / total) * 100) : null;
    // Langkah tanpa kelas tidak menghalangi langkah berikutnya.
    if (total && done < total) open = false;
  }
  return { courses: map, unlocked, stepPct };
}

/** Jenjang SEF: course terkunci jika langkah sebelumnya belum selesai (admin selalu bisa membuka). */
export async function sefLockedStep(course: Course, isStaff: boolean): Promise<string | null> {
  if (!course.sef_step || isStaff) return null;
  const prog = await getSefProgress(await listCourses());
  if (prog.unlocked.has(course.sef_step)) return null;
  const blocking = SEF_STEPS.find((s) => !prog.unlocked.has(s.key));
  const idx = SEF_STEPS.findIndex((s) => s.key === blocking?.key);
  return SEF_STEPS[Math.max(0, idx - 1)]?.name ?? "sebelumnya";
}
