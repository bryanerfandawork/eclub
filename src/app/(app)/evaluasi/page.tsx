import Link from "next/link";
import { ArrowRight, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { getProgressStats } from "@/lib/data";
import { REVIEW_KEY } from "@/lib/steps-server";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { todayJakarta } from "@/lib/format";
import { ReviewForm } from "./form";

export const metadata = { title: "Evaluasi Mingguan" };

export default async function EvaluasiPage() {
  const stats = await getProgressStats();
  let syukur = 0;
  let habitDays = 0;
  let reviews: { id: string; answers: { win?: string; focus?: string }; created_at: string }[] = [];
  if (!isDemoMode) {
    const supabase = await createClient();
    const { data: rv } = await supabase.from("assessment_results").select("id, answers, created_at").eq("assessment_key", REVIEW_KEY).order("created_at", { ascending: false }).limit(4);
    reviews = (rv ?? []) as typeof reviews;
    const [g, h] = await Promise.all([
      supabase.from("gratitude_entries").select("id", { count: "exact", head: true }).gte("entry_date", todayJakarta(-6)),
      supabase.from("habit_logs").select("log_date").gte("log_date", todayJakarta(-6)),
    ]);
    syukur = g.count ?? 0;
    habitDays = new Set((h.data ?? []).map((r) => r.log_date)).size;
  }
  const actionDays = stats.last7.filter((d) => d.done > 0).length;
  const doneThisWeek = !!reviews[0] && Date.now() - new Date(reviews[0].created_at).getTime() < 7 * 86_400_000;
  const tiles = [
    { label: "Hari dengan aksi selesai", value: `${actionDays}/7`, ok: actionDays >= 3, href: "/today" },
    { label: "Hari kebiasaan dicentang", value: `${habitDays}/7`, ok: habitDays >= 3, href: "/kebiasaan" },
    { label: "Catatan syukur", value: `${syukur}`, ok: syukur > 0, href: "/kebiasaan#syukur" },
    { label: "Rangkaian konsisten", value: `${stats.streak} hari`, ok: stats.streak >= 3, href: "/progress" },
  ];
  return (
    <>
      <PageHeader eyebrow="Langkah 5 · Evaluasi Berkala" title="Cek kompas minggu ini" desc="2 menit setiap minggu: lihat angka Anda, rayakan yang berhasil, dan tentukan satu fokus minggu depan." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className={`rounded-2xl border p-4 transition hover:shadow-soft ${t.ok ? "border-success/30 bg-success/5" : "border-line bg-white"}`}>
            <p className="text-2xl font-bold text-heading">{t.value}</p>
            <p className="mt-0.5 text-xs text-muted">{t.label}</p>
          </Link>
        ))}
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <ReviewForm done={doneThisWeek} />
        <aside className="space-y-4">
          <div className="card p-5">
            <p className="flex items-center gap-2 font-bold text-heading">
              <RefreshCw className="h-4 w-4 text-brand" /> Perbarui rencana bila perlu
            </p>
            <p className="mt-1 text-sm text-muted">Penghasilan berubah? Ada ide baru? Sesuaikan supaya hitungan mimpi tetap tepat.</p>
            <div className="mt-3 space-y-2">
              {[
                ["Perbarui penghasilan & pengeluaran", "/income"],
                ["Perbarui rencana income", "/rencana"],
                ["Perbarui target harian", "/target"],
              ].map(([l, h]) => (
                <Link key={h} href={h} className="flex items-center justify-between rounded-xl bg-paper px-3 py-2.5 text-sm font-medium text-heading hover:text-brand">
                  {l} <ArrowRight className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>
          {reviews.length > 0 && (
            <div className="card p-5">
              <p className="font-bold text-heading">Evaluasi sebelumnya</p>
              <ul className="mt-3 space-y-3">
                {reviews.map((r) => {
                  const a = r.answers;
                  return (
                    <li key={r.id} className="text-sm">
                      <p className="text-xs text-muted">{new Date(r.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long" })}</p>
                      <p className="text-ink">✓ {a.win}</p>
                      <p className="text-muted">→ {a.focus}</p>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
