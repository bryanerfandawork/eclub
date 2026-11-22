import Link from "next/link";
import { ArrowRight, Repeat } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { todayJakarta } from "@/lib/format";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { GratitudeForm } from "./client";

export const metadata = { title: "Jurnal Syukur" };

type Entry = { entry_date: string; items: string[]; mood: number | null };
const MOODS = ["", "😞", "😕", "😐", "🙂", "😄"];

export default async function SyukurPage() {
  const today = todayJakarta();
  let entries: Entry[] = [];
  let ready = true;
  if (isDemoMode) {
    entries = [{ entry_date: todayJakarta(-1), items: ["Pesanan katering 50 box", "Anak juara kelas"], mood: 5 }];
  } else {
    const supabase = await createClient();
    const g = await supabase.from("gratitude_entries").select("entry_date, items, mood").order("entry_date", { ascending: false }).limit(14);
    if (g.error) ready = false;
    entries = (g.data ?? []) as Entry[];
  }
  if (!ready) return <div className="card p-6 text-sm text-muted">Fitur ini sedang disiapkan.</div>;
  const todayEntry = entries.find((e) => e.entry_date === today);
  const past = entries.filter((e) => e.entry_date !== today);

  return (
    <>
      <PageHeader eyebrow="Evaluasi harian · Syukur" title="Tutup hari dengan syukur" desc="Rasa syukur adalah bahan bakar spark Anda. Cukup 1 menit sebelum tidur." />
      <div className="grid gap-5 lg:grid-cols-5 lg:gap-6">
        <section className="card p-5 lg:col-span-3 lg:p-6">
          <h2 className="font-bold text-heading">Jurnal syukur hari ini</h2>
          <p className="mt-0.5 mb-4 text-xs text-muted">Riset psikologi positif: menulis 3 hal yang disyukuri secara rutin membantu suasana hati dan optimisme.</p>
          <GratitudeForm items={todayEntry?.items ?? []} mood={todayEntry?.mood ?? null} />
        </section>
        <aside className="space-y-5 lg:col-span-2">
          <Link href="/today" className="card flex items-center gap-3 p-5 hover:shadow-lift">
            <Repeat className="h-5 w-5 shrink-0 text-gold" />
            <span className="min-w-0 flex-1 text-sm">
              <span className="block font-semibold text-heading">Kebiasaan & rencana aksi</span>
              <span className="block text-muted">Sekarang dicentang di Laporan Harian.</span>
            </span>
            <ArrowRight className="h-4 w-4 text-muted" />
          </Link>
          {past.length > 0 && (
            <section className="card p-5">
              <h3 className="font-bold text-heading">Catatan sebelumnya</h3>
              <ul className="mt-2 space-y-3">
                {past.slice(0, 7).map((e) => (
                  <li key={e.entry_date} className="text-sm">
                    <p className="text-xs font-semibold text-muted">
                      {new Date(e.entry_date + "T00:00:00").toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short" })} {e.mood ? MOODS[e.mood] : ""}
                    </p>
                    <ul className="mt-1 list-disc pl-5 text-ink">
                      {e.items.map((it, i) => (
                        <li key={i}>{it}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </>
  );
}
