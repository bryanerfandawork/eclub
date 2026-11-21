import Link from "next/link";
import { Crown, Plus } from "lucide-react";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { ArticleMeta } from "@/lib/articles";

export const metadata = { title: "Admin · Artikel" };

export default async function AdminArticles() {
  let rows: ArticleMeta[] = [];
  let failed = false;
  if (!isDemoMode) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("articles").select("id, slug, title, excerpt, category, sef_step, access, read_min, published_at, status").order("published_at", { ascending: false });
    failed = !!error;
    rows = (data ?? []) as ArticleMeta[];
  }
  return (
    <section className="card p-5 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-heading">Artikel</h2>
          <p className="mt-1 text-sm text-muted">Tampil di halaman publik /artikel. Artikel Plus hanya bisa dibaca penuh oleh member Plus.</p>
        </div>
        <Link href="/admin/artikel/baru" className="btn-primary">
          <Plus className="h-4 w-4" /> Artikel baru
        </Link>
      </div>
      {failed ? (
        <p className="py-8 text-center text-sm text-muted">Jalankan SQL tahap 15 dulu.</p>
      ) : rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">Belum ada artikel.</p>
      ) : (
        <ul className="mt-3 divide-y divide-line text-sm">
          {rows.map((a) => (
            <li key={a.id}>
              <Link href={`/admin/artikel/${a.id}`} className="flex items-center gap-3 py-3 hover:text-brand">
                <span className="flex-1 font-semibold text-heading">{a.title}</span>
                {a.access === "plus" && <Crown className="h-4 w-4 text-gold" />}
                <span className="text-xs text-muted">{a.category}</span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${a.status === "published" ? "bg-success/10 text-success" : "bg-paper text-muted"}`}>{a.status === "published" ? "Terbit" : "Draf"}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
