import Link from "next/link";
import { CalendarDays, Gem, Plus } from "lucide-react";
import { PageHeader, ProgressBar } from "@/components/ui";
import { getDreams } from "@/lib/data";
import { compactRupiah, dreamProgress, tanggal } from "@/lib/format";

export const metadata = { title: "My Dreams" };

const STATUS: Record<string, string> = { active: "Aktif", achieved: "Tercapai 🎉", paused: "Ditunda" };

export default async function GoalsPage() {
  const dreams = await getDreams();
  return (
    <>
      <PageHeader
        eyebrow="Dream to Reality"
        title="Mimpi saya"
        desc="Tuliskan mimpi, beri target, lalu pecah menjadi langkah nyata."
        action={
          <Link href="/goals/baru" className="btn-primary self-start">
            <Plus className="h-4 w-4" /> Mimpi baru
          </Link>
        }
      />
      {dreams.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gold-soft text-gold">
            <Gem className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-bold text-heading">Belum ada mimpi</h2>
          <p className="max-w-sm text-sm text-muted">Mulai dari satu mimpi yang paling berarti bagi Anda saat ini.</p>
          <Link href="/goals/baru" className="btn-gold mt-2">
            Tulis mimpi pertama
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {dreams.map((d, i) => {
            const p = dreamProgress(d.target_amount, d.saved_amount);
            return (
              <Link
                key={d.id}
                href={`/goals/${d.id}`}
                className={`card flex animate-rise flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-lift ${d.status !== "active" ? "opacity-75" : ""}`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-gold-soft px-2.5 py-1 text-[11px] font-semibold text-heading">{d.category}</span>
                  <span className="text-[11px] font-medium text-muted">{STATUS[d.status]}</span>
                </div>
                <h2 className="mt-3 line-clamp-2 text-[17px] font-bold text-heading">{d.title}</h2>
                {d.why && <p className="mt-1 line-clamp-2 text-sm text-muted">{d.why}</p>}
                <div className="mt-auto pt-5">
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="text-muted">
                      {compactRupiah(d.saved_amount)} {d.target_amount ? `/ ${compactRupiah(d.target_amount)}` : ""}
                    </span>
                    <span className="font-semibold text-heading">{p}%</span>
                  </div>
                  <ProgressBar value={p} />
                  {d.target_date && (
                    <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
                      <CalendarDays className="h-3.5 w-3.5" /> Target {tanggal(d.target_date)}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
