import Link from "next/link";
import { ArrowRight, CalendarDays, CalendarRange, RefreshCw, Sun } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { getProgressStats } from "@/lib/data";
import { REVIEW_KEY, RITME_KEY } from "@/lib/steps-server";
import { getAssessmentResults } from "@/lib/data";
import { ackStep } from "@/app/actions/journey";
import { PendingButton } from "@/components/pending-button";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { todayJakarta } from "@/lib/format";
import { ReviewForm } from "./form";

export const metadata = { title: "Evaluasi Berkala" };

const RHYTHM = [
  {
    icon: Sun,
    when: "Setiap hari · 3 menit",
    title: "Laporan harian",
    body: "Lapor keuangan hari ini, centang kebiasaan, laporkan rencana aksi (selesai, lanjut besok, atau tutup), lalu tulis 3 hal yang disyukuri. Pukul 19.00 kami ingatkan yang belum selesai.",
    links: [["Buka laporan harian", "/today"], ["Jurnal syukur", "/kebiasaan"]],
  },
  {
    icon: CalendarDays,
    when: "Setiap Minggu · 2 menit",
    title: "Evaluasi mingguan",
    body: "Minggu malam Anda menerima Rapor Mingguan: berapa persen rencana selesai dan mimpi mana yang paling maju. Lalu isi evaluasi singkat di bawah.",
    links: [["Isi evaluasi minggu ini", "#mingguan"]],
  },
  {
    icon: CalendarRange,
    when: "Setiap bulan · 10 menit",
    title: "Progres bulanan",
    body: "Lihat grafik progres sebulan, lalu perbarui langkah 2 sampai 4 bila ada yang berubah: penghasilan, rencana income, pekerjaan, atau kebiasaan. Tiap 3 bulan, ulangi tes 8 Wheel.",
    links: [["Lihat progres", "/progress"], ["Atur rutinitas", "/rutinitas"]],
  },
];

export default async function EvaluasiPage() {
  const [stats, ritme] = await Promise.all([getProgressStats(), getAssessmentResults(RITME_KEY, 1)]);
  const ready = ritme.length > 0;
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
    { label: "Hari dengan rencana selesai", value: `${actionDays}/7`, ok: actionDays >= 3, href: "/today" },
    { label: "Hari kebiasaan dicentang", value: `${habitDays}/7`, ok: habitDays >= 3, href: "/today" },
    { label: "Catatan syukur", value: `${syukur}`, ok: syukur > 0, href: "/kebiasaan" },
    { label: "Rangkaian konsisten", value: `${stats.streak} hari`, ok: stats.streak >= 3, href: "/progress" },
  ];
  return (
    <>
      <PageHeader
        eyebrow="Langkah 5 · Evaluasi Berkala"
        title="Evaluasi bukan isian, tapi ritme"
        desc="Langkah 1 sampai 4 adalah peta. Langkah 5 menjaga Anda tetap di jalur: sedikit setiap hari, sejenak setiap minggu, dan tinjau ulang setiap bulan."
      />
      <div className="mb-8 grid gap-4 lg:grid-cols-3">
        {RHYTHM.map((r, i) => (
          <section key={r.title} className="card flex flex-col p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-white">
                <r.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-semibold tracking-wide text-gold uppercase">{r.when}</p>
                <h2 className="font-bold text-heading">
                  {i + 1}. {r.title}
                </h2>
              </div>
            </div>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-ink">{r.body}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {r.links.map(([l, h]) => (
                <Link key={h} href={h} className="rounded-full bg-paper px-3 py-1.5 text-xs font-semibold text-brand hover:bg-gold-soft">
                  {l} ›
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
      <section className={`mb-10 rounded-3xl p-6 text-center ${ready ? "border border-success/30 bg-success/5" : "bg-brand text-white shadow-lift"}`}>
        {ready ? (
          <>
            <p className="text-lg font-bold text-success">✓ Anda siap menjalankan ritme ini</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted">Mulai hari ini, cukup buka Laporan Harian setiap hari: lapor keuangan, checklist rencana aksi & kebiasaan, lalu syukur.</p>
            <Link href="/today" className="btn-primary mt-4 py-3">
              Buka laporan hari ini <ArrowRight className="h-4 w-4" />
            </Link>
          </>
        ) : (
          <>
            <p className="text-lg font-bold">Siap menjalankan ritme ini?</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-white/75">Dengan menekan tombol di bawah, perjalanan 5 langkah Anda selesai. Selanjutnya Home fokus pada laporan harian Anda.</p>
            <form action={ackStep} className="mt-4">
              <input type="hidden" name="step" value="ritme" />
              <input type="hidden" name="next" value="/dashboard?selesai=1" />
              <PendingButton className="btn-gold w-full py-3 sm:w-auto">Saya paham & siap rutin mengisi ✓</PendingButton>
            </form>
          </>
        )}
      </section>

      <h2 id="mingguan" className="mb-3 scroll-mt-24 text-xl font-bold text-heading">
        Evaluasi minggu ini
      </h2>
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
                ["Perbarui pekerjaan & kebiasaan", "/rutinitas"],
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
