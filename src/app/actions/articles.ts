"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "./auth";

const STEPS = ["spark", "personal_mapping", "acquisition", "systemation", "transformation", "investation"];

export async function saveArticle(_: FormState, formData: FormData): Promise<FormState> {
  if (isDemoMode) return { error: "Mode demo: perubahan belum bisa disimpan." };
  const f = (k: string) => String(formData.get(k) ?? "").trim();
  const id = f("id");
  const title = f("title");
  const slug = (f("slug") || title).toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90);
  const body = String(formData.get("body") ?? "");
  if (!title || slug.length < 2) return { error: "Judul wajib diisi." };
  const words = body.split(/\s+/).filter(Boolean).length;
  const row = {
    slug,
    title,
    excerpt: f("excerpt") || null,
    category: f("category") || null,
    sef_step: STEPS.includes(f("sef_step")) ? f("sef_step") : null,
    access: f("access") === "plus" ? "plus" : "free",
    status: f("status") === "published" ? "published" : "draft",
    read_min: Math.max(1, Math.round(words / 200)),
  };
  const supabase = await createClient();
  let articleId = id;
  if (id) {
    const { error } = await supabase.from("articles").update(row).eq("id", id);
    if (error) return { error: error.code === "23505" ? "Slug sudah dipakai artikel lain." : "Gagal menyimpan. Pastikan SQL tahap 15 sudah dijalankan." };
  } else {
    const { data, error } = await supabase.from("articles").insert(row).select("id").single();
    if (error || !data) return { error: error?.code === "23505" ? "Slug sudah dipakai artikel lain." : "Gagal menyimpan. Pastikan SQL tahap 15 sudah dijalankan." };
    articleId = data.id;
  }
  const { error: e2 } = await supabase.from("article_bodies").upsert({ article_id: articleId, body });
  if (e2) return { error: "Judul tersimpan, tetapi isi gagal disimpan. Coba lagi." };
  revalidatePath("/artikel");
  revalidatePath("/admin/artikel");
  if (!id) redirect(`/admin/artikel/${articleId}`);
  return { message: "Artikel tersimpan." };
}

export async function deleteArticle(formData: FormData) {
  if (isDemoMode) return;
  const supabase = await createClient();
  await supabase.from("articles").delete().eq("id", String(formData.get("id")));
  revalidatePath("/artikel");
  redirect("/admin/artikel");
}
