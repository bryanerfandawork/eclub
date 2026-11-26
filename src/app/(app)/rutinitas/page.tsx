import Link from "next/link";
import { Archive, BellRing, Briefcase, Repeat, Sparkles } from "lucide-react";
import { archiveHabit } from "@/app/actions/habits";
import { archiveWork } from "@/app/actions/works";
import { PageHeader } from "@/components/ui";
import { getHabitsToday, getWorks } from "@/lib/assistant";
import { getDreams } from "@/lib/data";
import { AddHabit, AddWork } from "./client";
import { getSettings } from "@/lib/plans";
import { assistantConfig } from "@/lib/assistant-config";
import { TeamCard } from "@/components/team/team-card";

export const metadata = { title: "Rutinitas Harian" };

export default async function RutinitasPage() {
  const [works, { habits }, all, settings] = await Promise.all([getWorks(), getHabitsToday(), getDreams(), getSettings()]);
  const cfg = assistantConfig(settings);
  const dreams = all.filter((d) => d.status === "active").map((d) => ({ id: d.id, title: d.title }));
  const dreamTitle = (id?: string | null) => dreams.find((d) => d.id === id)?.title;

  return (
    <>
      <PageHeader
        eyebrow="Langkah 4 · Rutinitas harian"
        title="Apa yang Anda jalani setiap hari?"
        desc="Tulis pekerjaan atau aktivitas rutin Anda dan kebiasaan baik yang ingin dibangun. Kaitkan masing-masing ke mimpi, supaya setiap hari terasa ada artinya."
      />
      <div className="mb-5">
        <TeamCard variant="compact" />
      </div>
      <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
        <section className="card p-5 lg:p-6">
          <h2 className="flex items-center gap-2 font-bold text-heading">
            <Briefcase className="h-5 w-5 text-brand" /> Pekerjaan & aktivitas
          </h2>
          <p className="mt-1 text-xs text-muted">Wadah untuk rencana aksi harian. Misal: usaha katering, kuliah, latihan sepak bola.</p>
          <ul className="mt-3 space-y-2">
            {works.map((w) => (
              <li key={w.id} className="flex items-center gap-3 rounded-2xl border border-line p-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
                  <Briefcase className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-heading">{w.name}</span>
                  <span className="block truncate text-xs text-muted">{dreamTitle(w.dream_id) ? `✨ ${dreamTitle(w.dream_id)}` : "Belum dikaitkan ke mimpi"}</span>
                </span>
                <form action={archiveWork}>
                  <input type="hidden" name="id" value={w.id} />
                  <button className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-paper" aria-label="Arsipkan" title="Arsipkan">
                    <Archive className="h-4 w-4" />
                  </button>
                </form>
              </li>
            ))}
          </ul>
          <AddWork existing={works.map((w) => w.name)} dreams={dreams} ideas={cfg.workIdeas} />
        </section>

        <section className="card p-5 lg:p-6">
          <h2 className="flex items-center gap-2 font-bold text-heading">
            <Repeat className="h-5 w-5 text-gold" /> Kebiasaan harian
          </h2>
          <p className="mt-1 text-xs text-muted">Hal kecil yang diulang setiap hari. Tidak dihitung dalam batas rencana aksi.</p>
          <ul className="mt-3 space-y-2">
            {habits.map((h) => (
              <li key={h.id} className="flex items-center gap-3 rounded-2xl border border-line p-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-paper text-xl">{h.emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-heading">{h.name}</span>
                  <span className="block truncate text-xs text-muted">{dreamTitle(h.dream_id) ? `✨ ${dreamTitle(h.dream_id)}` : "Kebiasaan umum"}</span>
                </span>
                <form action={archiveHabit}>
                  <input type="hidden" name="id" value={h.id} />
                  <button className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-paper" aria-label="Arsipkan" title="Arsipkan">
                    <Archive className="h-4 w-4" />
                  </button>
                </form>
              </li>
            ))}
          </ul>
          <AddHabit existing={habits.map((h) => h.name)} dreams={dreams} ideas={cfg.habitIdeas} />
        </section>
      </div>

      <section className="mt-5 flex gap-3 rounded-2xl border border-gold/40 bg-gold-soft/40 p-4 text-sm text-ink lg:mt-6">
        <BellRing className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
        <p>
          <b>Setelah ini, EClub jadi asisten harian Anda.</b> Setiap hari Anda cukup membuka <Link href="/today" className="font-semibold text-brand underline">Laporan Harian</Link>: centang kebiasaan, tulis rencana aksi per pekerjaan, lalu tandai selesai, lanjut besok, atau tutup. Malam hari kami ingatkan yang belum selesai.
        </p>
      </section>
      {dreams.length === 0 && (
        <p className="mt-3 flex items-center gap-2 text-xs text-muted">
          <Sparkles className="h-4 w-4 text-gold" /> Belum ada mimpi aktif. <Link href="/goals" className="font-semibold text-brand">Tulis mimpi dulu</Link> agar bisa dikaitkan.
        </p>
      )}
    </>
  );
}
