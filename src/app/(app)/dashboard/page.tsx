import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle, Compass, Gem, Plus, Quote } from "lucide-react";
import { getDreams, getOpenActions, getProfile } from "@/lib/data";
import { compactRupiah, dreamProgress, greeting } from "@/lib/format";
import { STAGES } from "@/lib/journey";
import { ProgressBar, Ring } from "@/components/ui";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const [profile, dreams, actions] = await Promise.all([getProfile(), getDreams(), getOpenActions(4)]);
  const firstName = (profile.full_name || "Sahabat").split(" ")[0];
  const active = dreams.filter((d) => d.status === "active");
  const totalTarget = active.reduce((s, d) => s + (d.target_amount ?? 0), 0);
  const totalSaved = active.reduce((s, d) => s + d.saved_amount, 0);
  const overall = totalTarget ? Math.round((totalSaved / totalTarget) * 100) : 0;

  // Perkiraan posisi di Success Framework berdasarkan data yang sudah diisi.
  const stageIndex = !profile.success_definition ? 0 : dreams.length === 0 ? 2 : 5;
  const steps = [
    { done: !!profile.success_definition, label: "Tuliskan definisi sukses Anda", href: "/profile#sukses" },
    { done: dreams.length > 0, label: "Buat mimpi pertama Anda", href: "/goals/baru" },
    { done: actions.length > 0 || dreams.length > 1, label: "Tentukan langkah aksi pertama", href: "/goals" },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      <section className="animate-rise">
        <p className="text-sm font-medium text-muted">{greeting()},</p>
        <h1 className="text-[28px] font-bold tracking-tight text-navy lg:text-[34px]">{firstName} 👋</h1>
      </section>

      <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
        {/* Kartu utama */}
        <section className="relative overflow-hidden rounded-3xl bg-navy p-6 text-white shadow-lift lg:col-span-2 lg:p-8">
          <div className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
          <p className="eyebrow">Perjalanan Anda</p>
          <div className="mt-3 flex items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold">
                Tahap {STAGES[stageIndex].no} · {STAGES[stageIndex].name}
              </h2>
              <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-white/70">{STAGES[stageIndex].desc}</p>
            </div>
            <div className="relative hidden shrink-0 sm:block">
              <Ring value={overall} size={84} />
              <span className="absolute inset-0 grid place-items-center text-sm font-bold">{overall}%</span>
            </div>
          </div>
          <div className="mt-6 flex gap-1.5">
            {STAGES.map((s, i) => (
              <div key={s.id} className={`h-1.5 flex-1 rounded-full ${i <= stageIndex ? "bg-gold" : "bg-white/15"}`} />
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/journey" className="btn-gold">
              Lanjutkan perjalanan <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Ringkasan */}
        <section className="card p-6">
          <p className="eyebrow">Ringkasan mimpi</p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-3xl font-bold text-navy">{active.length}</p>
              <p className="text-xs text-muted">Mimpi aktif</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-navy">{actions.length}</p>
              <p className="text-xs text-muted">Aksi menunggu</p>
            </div>
          </div>
          <div className="mt-5">
            <div className="mb-1.5 flex justify-between text-xs">
              <span className="text-muted">Dana terkumpul</span>
              <span className="font-semibold text-navy">
                {compactRupiah(totalSaved)} / {compactRupiah(totalTarget)}
              </span>
            </div>
            <ProgressBar value={overall} />
          </div>
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
        {/* Langkah awal / aksi */}
        <section className="card p-6 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-navy">{actions.length ? "Aksi berikutnya" : "Mulai di sini"}</h3>
            <Compass className="h-5 w-5 text-gold" strokeWidth={1.8} />
          </div>
          <ul className="mt-4 space-y-1">
            {actions.length
              ? actions.map((a) => (
                  <li key={a.id}>
                    <Link href={`/goals/${a.dream_id}`} className="flex items-start gap-3 rounded-xl p-2 -mx-2 hover:bg-paper">
                      <Circle className="mt-0.5 h-[18px] w-[18px] shrink-0 text-line" strokeWidth={2.2} />
                      <span>
                        <span className="block text-sm font-medium text-ink">{a.title}</span>
                        <span className="block text-xs text-muted">{a.dream_title}</span>
                      </span>
                    </Link>
                  </li>
                ))
              : steps.map((s) => (
                  <li key={s.label}>
                    <Link href={s.href} className="flex items-center gap-3 rounded-xl p-2 -mx-2 hover:bg-paper">
                      {s.done ? (
                        <CheckCircle2 className="h-[18px] w-[18px] text-success" />
                      ) : (
                        <Circle className="h-[18px] w-[18px] text-line" strokeWidth={2.2} />
                      )}
                      <span className={`text-sm font-medium ${s.done ? "text-muted line-through" : "text-ink"}`}>{s.label}</span>
                    </Link>
                  </li>
                ))}
          </ul>
        </section>

        {/* Mimpi */}
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-navy">Mimpi saya</h3>
            <Link href="/goals" className="text-sm font-semibold text-navy/70 hover:text-navy">
              Lihat semua
            </Link>
          </div>
          {active.length === 0 ? (
            <Link href="/goals/baru" className="card flex flex-col items-center justify-center gap-3 border-dashed p-10 text-center hover:border-gold">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gold-soft text-gold">
                <Gem className="h-6 w-6" />
              </div>
              <p className="font-semibold text-navy">Tuliskan mimpi pertama Anda</p>
              <p className="max-w-xs text-sm text-muted">Mimpi yang ditulis dan direncanakan jauh lebih mungkin terwujud.</p>
            </Link>
          ) : (
            <div className="-mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0">
              {active.slice(0, 4).map((d) => {
                const p = dreamProgress(d.target_amount, d.saved_amount);
                return (
                  <Link
                    key={d.id}
                    href={`/goals/${d.id}`}
                    className="card min-w-[78%] snap-start p-5 transition hover:-translate-y-0.5 hover:shadow-lift sm:min-w-0"
                  >
                    <span className="rounded-full bg-gold-soft px-2.5 py-1 text-[11px] font-semibold text-navy">{d.category}</span>
                    <p className="mt-3 line-clamp-2 font-semibold text-navy">{d.title}</p>
                    <div className="mt-4 mb-1.5 flex justify-between text-xs">
                      <span className="text-muted">{d.target_amount ? compactRupiah(d.target_amount) : "Tanpa target dana"}</span>
                      <span className="font-semibold text-navy">{p}%</span>
                    </div>
                    <ProgressBar value={p} />
                  </Link>
                );
              })}
              <Link
                href="/goals/baru"
                className="flex min-w-[40%] snap-start flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line p-5 text-sm font-semibold text-muted hover:border-gold hover:text-navy sm:hidden"
              >
                <Plus className="h-5 w-5" /> Mimpi baru
              </Link>
            </div>
          )}
        </section>
      </div>

      {profile.success_definition && (
        <section className="card flex gap-4 p-6">
          <Quote className="h-6 w-6 shrink-0 text-gold" />
          <div>
            <p className="eyebrow">Definisi sukses saya</p>
            <p className="mt-1.5 text-[15px] leading-relaxed text-ink">{profile.success_definition}</p>
          </div>
        </section>
      )}
    </div>
  );
}
