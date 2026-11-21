import "server-only";
import { isDemoMode } from "./supabase/config";
import { createClient } from "./supabase/server";

export const CIRCLES = [
  { key: "umum", label: "Semua", emoji: "🌱", desc: "Ruang umum untuk semua member" },
  { key: "survive", label: "Survive", emoji: "🔥", desc: "Mencari pelanggan pertama & pendapatan stabil" },
  { key: "sustain", label: "Sustain", emoji: "⚙️", desc: "Membangun sistem, keuangan, dan tim" },
  { key: "scale", label: "Scale Up", emoji: "🚀", desc: "Digitalisasi dan ekspansi" },
  { key: "spread", label: "Spread Up", emoji: "🌳", desc: "Aset, investasi, dan dampak" },
] as const;

export const KINDS = [
  { key: "cerita", label: "Cerita", emoji: "💬" },
  { key: "menang", label: "Kemenangan", emoji: "🎉" },
  { key: "tanya", label: "Tanya", emoji: "❓" },
  { key: "insight", label: "Insight", emoji: "💡" },
] as const;

export type Post = {
  id: string; user_id: string; circle: string; kind: string; body: string; author_name: string | null; author_plus: boolean; pinned: boolean; created_at: string;
  comments: number; likes: number; liked: boolean;
};
export type Comment = { id: string; user_id: string; body: string; author_name: string | null; author_plus: boolean; created_at: string };

type Row = Omit<Post, "comments" | "likes" | "liked"> & { community_comments: { count: number }[]; community_likes: { count: number }[] };

export async function me(): Promise<string | null> {
  if (isDemoMode) return "demo";
  const supabase = await createClient();
  return (await supabase.auth.getUser()).data.user?.id ?? null;
}

async function withLikes(rows: Row[]): Promise<Post[]> {
  const uid = await me();
  let mine = new Set<string>();
  if (rows.length && uid) {
    const supabase = await createClient();
    const { data } = await supabase.from("community_likes").select("post_id").eq("user_id", uid).in("post_id", rows.map((r) => r.id));
    mine = new Set((data ?? []).map((d) => d.post_id));
  }
  return rows.map(({ community_comments, community_likes, ...r }) => ({ ...r, comments: community_comments?.[0]?.count ?? 0, likes: community_likes?.[0]?.count ?? 0, liked: mine.has(r.id) }));
}

const SELECT = "id, user_id, circle, kind, body, author_name, author_plus, pinned, created_at, community_comments(count), community_likes(count)";

export async function listPosts(circle: string): Promise<Post[] | null> {
  if (isDemoMode) {
    const t = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();
    return [
      { id: "p0", user_id: "x", circle: "umum", kind: "cerita", body: "Selamat datang di Komunitas EClub! 👋 Perkenalkan diri Anda: nama, usaha yang sedang dijalankan, dan satu mimpi terbesar Anda tahun depan.", author_name: "Tim EClub", author_plus: true, pinned: true, created_at: t(30), comments: 12, likes: 24, liked: false },
      { id: "p1", user_id: "y", circle: "survive", kind: "menang", body: "Alhamdulillah, minggu ini tembus 50 pesanan katering pertama setelah ikut kelas Acquisition. Kuncinya: fokus 1 segmen dulu (kantor sekitar).", author_name: "Rina", author_plus: true, pinned: false, created_at: t(3), comments: 4, likes: 17, liked: true },
      { id: "p2", user_id: "z", circle: "sustain", kind: "tanya", body: "Teman-teman, berapa persen idealnya gaji diri sendiri dari laba bersih? Saya masih sering campur uang usaha.", author_name: "Dimas", author_plus: false, pinned: false, created_at: t(6), comments: 6, likes: 5, liked: false },
    ].filter((p) => circle === "umum" || p.circle === circle);
  }
  const supabase = await createClient();
  let q = supabase.from("community_posts").select(SELECT).order("pinned", { ascending: false }).order("created_at", { ascending: false }).limit(40);
  if (circle !== "umum") q = q.eq("circle", circle);
  const { data, error } = await q;
  if (error) return null;
  return withLikes((data ?? []) as unknown as Row[]);
}

export async function getPost(id: string): Promise<{ post: Post; comments: Comment[] } | null> {
  if (isDemoMode) {
    const posts = await listPosts("umum");
    const post = posts?.find((p) => p.id === id) ?? posts?.[0];
    return post ? { post, comments: [{ id: "c1", user_id: "q", body: "Keren! Semangat terus 🔥", author_name: "Andi", author_plus: false, created_at: new Date().toISOString() }] } : null;
  }
  const supabase = await createClient();
  const { data } = await supabase.from("community_posts").select(SELECT).eq("id", id).maybeSingle();
  if (!data) return null;
  const [post] = await withLikes([data as unknown as Row]);
  const { data: c } = await supabase.from("community_comments").select("id, user_id, body, author_name, author_plus, created_at").eq("post_id", id).order("created_at");
  return { post, comments: (c ?? []) as Comment[] };
}

export function ago(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (m < 1) return "baru saja";
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}
