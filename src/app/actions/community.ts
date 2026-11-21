"use server";

import { revalidatePath } from "next/cache";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "./auth";

const CIRCLES = ["umum", "survive", "sustain", "scale", "spread"];
const KINDS = ["cerita", "menang", "tanya", "insight"];

function friendly(msg: string) {
  if (msg.includes("Batas")) return msg.replace(/^.*?(Batas[^\n]*)$/, "$1");
  return msg.includes("relation") || msg.includes("function") ? "Komunitas belum aktif (SQL tahap 13)." : "Gagal mengirim. Coba lagi.";
}

export async function createPost(_: FormState, formData: FormData): Promise<FormState> {
  if (isDemoMode) return { error: "Mode demo: postingan belum bisa dikirim." };
  const body = String(formData.get("body") ?? "").trim();
  const circle = String(formData.get("circle"));
  const kind = String(formData.get("kind"));
  if (body.length < 2) return { error: "Tulis sesuatu dulu ya." };
  const supabase = await createClient();
  const { error } = await supabase.from("community_posts").insert({ body: body.slice(0, 2000), circle: CIRCLES.includes(circle) ? circle : "umum", kind: KINDS.includes(kind) ? kind : "cerita" });
  if (error) return { error: friendly(error.message) };
  revalidatePath("/komunitas");
  return { message: "Terkirim ✓" };
}

export async function createComment(_: FormState, formData: FormData): Promise<FormState> {
  if (isDemoMode) return { error: "Mode demo." };
  const body = String(formData.get("body") ?? "").trim();
  const post = String(formData.get("post"));
  if (!body) return { error: "Komentar kosong." };
  const supabase = await createClient();
  const { error } = await supabase.from("community_comments").insert({ post_id: post, body: body.slice(0, 1000) });
  if (error) return { error: friendly(error.message) };
  revalidatePath(`/komunitas/${post}`);
  revalidatePath("/komunitas");
  return { message: "Terkirim ✓" };
}

export async function toggleLike(formData: FormData) {
  if (isDemoMode) return;
  const post = String(formData.get("post"));
  const liked = formData.get("liked") === "1";
  const supabase = await createClient();
  if (liked) {
    const { data: u } = await supabase.auth.getUser();
    await supabase.from("community_likes").delete().eq("post_id", post).eq("user_id", u.user?.id ?? "");
  } else await supabase.from("community_likes").insert({ post_id: post });
  revalidatePath("/komunitas");
  revalidatePath(`/komunitas/${post}`);
}

export async function deletePost(formData: FormData) {
  if (isDemoMode) return;
  const supabase = await createClient();
  await supabase.from("community_posts").delete().eq("id", String(formData.get("id")));
  revalidatePath("/komunitas");
}

export async function deleteComment(formData: FormData) {
  if (isDemoMode) return;
  const supabase = await createClient();
  await supabase.from("community_comments").delete().eq("id", String(formData.get("id")));
  revalidatePath(`/komunitas/${String(formData.get("post"))}`);
}

export async function togglePin(formData: FormData) {
  if (isDemoMode) return;
  const supabase = await createClient();
  await supabase.from("community_posts").update({ pinned: formData.get("pinned") !== "1" }).eq("id", String(formData.get("id")));
  revalidatePath("/komunitas");
}
