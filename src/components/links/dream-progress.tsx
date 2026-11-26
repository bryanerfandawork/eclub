import Link from "next/link";
import { Gem } from "lucide-react";
import { getDreams } from "@/lib/data";
import { dreamProgress, rupiah } from "@/lib/format";

/** Ringkasan kemajuan tiap mimpi aktif: menghubungkan Evaluasi & Progres kembali ke Mimpi. */
export async function DreamProgress({ title = "Kemajuan mimpi" }: { title?: string }) {
  const dreams = (await getDreams()).filter((d) => d.status === "active");
  return (
    <div className="card p-5">
      <p className="flex items-center gap-2 font-bold text-heading">
        <Gem className="h-4 w-4 text-gold" /> {title}
      </p>
      {dreams.length === 0 ? (
        <p className="mt-2 text-sm text-muted">
          Belum ada mimpi aktif.{" "}
          <Link href="/goals/baru" className="font-semibold text-brand">
            Tulis mimpi ›
          </Link>
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {dreams.slice(0, 5).map((d) => {
            const p = dreamProgress(d.target_amount, d.saved_amount);
            return (
              <li key={d.id}>
                <Link href={`/goals/${d.id}`} className="block rounded-xl p-1 -m-1 hover:bg-paper">
                  <div className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="truncate font-semibold text-heading">{d.title}</span>
                    <span className="shrink-0 text-xs text-muted">{d.target_amount ? `${p}%` : "belum ada angka"}</span>
                  </div>
                  {d.target_amount ? (
                    <>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-paper">
                        <div className="h-full rounded-full bg-gold" style={{ width: `${Math.max(p, 2)}%` }} />
                      </div>
                      <p className="mt-1 text-[11px] text-muted">
                        {rupiah(d.saved_amount)} dari {rupiah(d.target_amount)}
                      </p>
                    </>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
