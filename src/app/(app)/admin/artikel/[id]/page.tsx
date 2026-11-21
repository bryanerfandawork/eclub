import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { ArticleForm, type ArticleRow } from "./form";

export const metadata = { title: "Admin · Edit artikel" };

export default async function EditArticle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let row: ArticleRow = { id: "", slug: "", title: "", excerpt: "", category: "", sef_step: "", access: "free", status: "draft", body: "" };
  if (id !== "baru") {
    if (isDemoMode) notFound();
    const supabase = await createClient();
    const [{ data: a }, { data: b }] = await Promise.all([
      supabase.from("articles").select("*").eq("id", id).maybeSingle(),
      supabase.from("article_bodies").select("body").eq("article_id", id).maybeSingle(),
    ]);
    if (!a) notFound();
    row = { ...a, excerpt: a.excerpt ?? "", category: a.category ?? "", sef_step: a.sef_step ?? "", body: b?.body ?? "" };
  }
  return (
    <section className="card p-5 lg:p-6">
      <Link href="/admin/artikel" className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-brand">
        <ChevronLeft className="h-4 w-4" /> Semua artikel
      </Link>
      <ArticleForm row={row} />
    </section>
  );
}
