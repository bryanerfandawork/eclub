import Link from "next/link";
import { ArrowRight, BookOpen, Briefcase, CalendarCheck2, Crosshair, FolderKanban, Sprout, Wallet } from "lucide-react";
import { getDailyRange } from "@/lib/data";
import { getHabitsToday, getWorks, statusOf } from "@/lib/assistant";
import { getMyWorkspaces } from "@/lib/team";
import { todayJakarta } from "@/lib/format";

/**
 * "Yang menggerakkan mimpi ini": satu tempat yang menunjukkan semua fitur yang terhubung
 * ke sebuah mimpi (pekerjaan rutin, kebiasaan, rencana aksi, ruang kerja tim, tabungan),
 * dan tombol untuk menyambungkan yang belum.
 */
export async function DreamLinks({ dreamId, hasTarget, hasSavings }: { dreamId: string; hasTarget: boolean; hasSavings: boolean }) {
  const today = todayJakarta();
  const [works, hb, wss, daily] = await Promise.all([getWorks(), getHabitsToday(), getMyWorkspaces(), getDailyRange(todayJakarta(-6), todayJakarta(7))]);
  const myWorks = works.filter((w) => w.dream_id === dreamId);
  const workIds = new Set(myWorks.map((w) => w.id));
  const myHabits = hb.habits.filter((h) => h.dream_id === dreamId);
  // workspaces(*) ikut membawa dream_id (SQL 025), walau belum ada di tipe Workspace.
  const myWs = wss.filter((w) => (w as typeof w & { dream_id?: string | null }).dream_id === dreamId && !w.archived);
  const plans = daily.filter((a) => (a.dream_id === dreamId || (a.work_id && workIds.has(a.work_id))) && statusOf(a) !== "closed");
  const weekDone = plans.filter((a) => a.action_date <= today && statusOf(a) === "done").length;
  const upcoming = plans.filter((a) => a.action_date >= today && statusOf(a) === "open").slice(0, 4);
  const habitDays = (id: string) => hb.logs.filter((l) => l.habit_id === id && l.log_date >= todayJakarta(-6)).length;

  const rows: { icon: typeof Sprout; title: string; ok: boolean; body: React.ReactNode; href: string; cta: string }[] = [
    {
      icon: Briefcase,
      title: "Pekerjaan & aktivitas rutin",
      ok: myWorks.length > 0,
      body: myWorks.length ? myWorks.map((w) => w.name).join(" · ") : "Belum ada. Kaitkan pekerjaan (usaha, kuliah, karier) yang membawa Anda ke mimpi ini.",
      href: "/rutinitas",
      cta: myWorks.length ? "Atur" : "Kaitkan",
    },
    {
      icon: Sprout,
      title: "Kebiasaan pendukung",
      ok: myHabits.length > 0,
      body: myHabits.length ? myHabits.map((h) => `${h.emoji} ${h.name} (${habitDays(h.id)}/7 hari)`).join(" · ") : "Belum ada. Kebiasaan kecil harian yang konsisten adalah mesin mimpi.",
      href: "/rutinitas",
      cta: myHabits.length ? "Atur" : "Tambah",
    },
    {
      icon: CalendarCheck2,
      title: "Rencana aksi harian",
      ok: plans.length > 0,
      body: plans.length ? (
        <>
          {weekDone} selesai dalam 7 hari terakhir.
          {upcoming.length > 0 && <span className="block text-muted">Berikutnya: {upcoming.map((a) => a.title).join(" · ")}</span>}
        </>
      ) : (
        "Belum ada rencana harian untuk mimpi ini. Jadwalkan langkah aksi di kiri ke hari ini."
      ),
      href: "/today",
      cta: "Buka",
    },
    {
      icon: Wallet,
      title: "Tabungan di kantong",
      ok: hasSavings,
      body: hasSavings ? "Uangnya sudah disisihkan di kantong Anda (lihat di atas)." : "Sisihkan uang di kantong Keuangan untuk mimpi ini. Saldo mimpi ikut bertambah otomatis.",
      href: "/keuangan",
      cta: hasSavings ? "Lihat" : "Tabung",
    },
    {
      icon: FolderKanban,
      title: "Ruang kerja tim",
      ok: myWs.length > 0,
      body: myWs.length
        ? myWs.map((w) => `${w.name}${w.open ? ` (${w.open} tugas terbuka)` : ""}`).join(" · ")
        : "Mimpi besar jarang dicapai sendirian. Buat project atau perusahaan, ajak tim, dan kaitkan ke mimpi ini.",
      href: myWs.length === 1 ? `/tim/${myWs[0].id}` : "/tim",
      cta: myWs.length ? "Buka" : "Buat",
    },
  ];
  const linked = rows.filter((r) => r.ok).length;

  return (
    <section className="card mt-6 p-5 lg:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-bold text-heading">Yang menggerakkan mimpi ini</h2>
        <span className="text-xs font-medium text-muted">{linked}/{rows.length} terhubung</span>
      </div>
      <p className="mt-1 text-sm text-muted">Semakin banyak yang terhubung, semakin besar peluang mimpi ini tercapai. Semua yang terhubung ikut muncul di Laporan Harian.</p>
      <ul className="mt-4 divide-y divide-line">
        {rows.map((r) => (
          <li key={r.title} className="flex items-start gap-3 py-3">
            <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${r.ok ? "bg-success/10 text-success" : "bg-paper text-muted"}`}>
              <r.icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-heading">{r.title}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-ink">{r.body}</p>
            </div>
            <Link href={r.href} className="shrink-0 rounded-full bg-paper px-3 py-1.5 text-xs font-semibold text-brand hover:bg-gold-soft">
              {r.cta} ›
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
        {hasTarget && (
          <Link href="/target" className="inline-flex items-center gap-1.5 rounded-full bg-gold-soft px-3 py-1.5 text-xs font-semibold text-brand hover:brightness-95">
            <Crosshair className="h-3.5 w-3.5" /> Hitung target jualan harian
          </Link>
        )}
        <Link href="/rencana" className="inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1.5 text-xs font-semibold text-brand hover:bg-gold-soft">
          <ArrowRight className="h-3.5 w-3.5" /> Rencana income untuk mendanai
        </Link>
        <Link href="/learn" className="inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1.5 text-xs font-semibold text-brand hover:bg-gold-soft">
          <BookOpen className="h-3.5 w-3.5" /> Kelas sesuai tahap saya
        </Link>
      </div>
    </section>
  );
}
