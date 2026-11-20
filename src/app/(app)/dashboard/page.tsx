import Link from "next/link";
import { ArrowRight, CalendarCheck2, CheckCircle2, Circle, Flame, Gem, Plus, Quote } from "lucide-react";
import { getDailyRange, getDreams, getOpenActions, getProfile, getProgressStats, getWheelHistory } from "@/lib/data";
import { compactRupiah, dreamProgress, greeting, todayJakarta } from "@/lib/format";
import { DailyList } from "@/components/daily-list";
import { WheelChart, wheelAverage } from "@/components/wheel-chart";
import { STAGES } from "@/lib/journey";
import { ProgressBar, Ring } from "@/components/ui";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const today = todayJakarta();
  const [profile, dreams, actions, todayItems, wheel, stats] = await Promise.all([
    getProfile(),
    getDreams(),
    getOpenActions(4),
    getDailyRange(today, today),
    getWheelHistory(1),
    getProgressStats(),
  ]);
  const firstName = (profile.full_name || "Sahabat").split(" ")[0];
  const active = dreams.filter((d) => d.status === "active");
  const totalTarget = active.reduce((s, d) => s + (d.target_amount ?? 0), 0);
  const totalSaved = active.reduce((s, d) => s + d.saved_amount, 0);
  const overall = totalTarget ? Math.round((totalSaved / totalTarget) * 100) : 0;

  // Perkiraan posisi di Success Framework berdasarkan data yang sudah diisi.
  const steps = [
    { done: !!profile.success_definition, label: "Tuliskan definisi sukses Anda", href: "/profile#sukses" },
    { done: wheel.length > 0, label: "Nilai keseimbangan hidup (Wheel of Life)", href: "/wheel-of-life" },
    { done: dreams.length > 0, label: "Buat mimpi pertama Anda", href: "/goals/baru" },
    { done: stats.dailyTotal30 > 0, label: "Rencanakan aksi harian pertama", href: "/today" },
  ];
  const onboarding = steps.some((s) => !s.done);
  const stageIndex = !profile.success_definition || !wheel.length ? 0 : dreams.length === 0 ? 2 : 5;

  return (
    <div className="space-y-6 lg:space-y-8">
      <section className="animate-rise">
        <p className="text-sm font-medium text-muted">{greeting()},</p>
        <h1 className="text-[28px] font-bold tracking-tight text-heading lg:text-[34px]">{firstName} 👋</h1>
      </section>

      <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
        {/* Kartu utama */}
        <section className="relative overflow-hidden rounded-3xl bg-brand p-6 text-white shadow-lift lg:col-span-2 lg:p-8">
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
              <p className="text-3xl font-bold text-heading">{active.length}</p>
              <p className="text-xs text-muted">Mimpi aktif</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-heading">{actions.length}</p>
              <p className="text-xs text-muted">Aksi menunggu</p>
            </div>
          </div>
          <div className="mt-5">
            <div className="mb-1.5 flex justify-between text-xs">
              <span className="text-muted">Dana terkumpul</span>
              <span className="font-semibold text-heading">
                {compactRupiah(totalSaved)} / {compactRupiah(totalTarget)}
              </span>
            </div>
            <ProgressBar value={overall} />
          </div>
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
        {/* Aksi hari ini */}
        <section className="card p-6 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-bold text-heading">
              <CalendarCheck2 className="h-5 w-5 text-brand" /> Aksi hari ini
            </h3>
            <span className="flex items-center gap-1 rounded-full bg-gold-soft px-2.5 py-1 text-xs font-semibold text-brand">
              <Flame className="h-3.5 w-3.5" /> {stats.streak}
            </span>
          </div>
          <div className="mt-2">
            <DailyList items={todayItems} date={today} compact />
          </div>
          <Link href="/today" className="mt-3 inline-block text-sm font-semibold text-brand/80 hover:text-brand">
            Lihat semua
          </Link>
        </section>

        {/* Mimpi */}
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-heading">Mimpi saya</h3>
            <Link href="/goals" className="text-sm font-semibold text-heading/70 hover:text-heading">
              Lihat semua
            </Link>
          </div>
          {active.length === 0 ? (
            <Link href="/goals/baru" className="card flex flex-col items-center justify-center gap-3 border-dashed p-10 text-center hover:border-gold">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gold-soft text-gold">
                <Gem className="h-6 w-6" />
              </div>
              <p className="font-semibold text-heading">Tuliskan mimpi pertama Anda</p>
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
                    <span className="rounded-full bg-gold-soft px-2.5 py-1 text-[11px] font-semibold text-heading">{d.category}</span>
                    <p className="mt-3 line-clamp-2 font-semibold text-heading">{d.title}</p>
                    <div className="mt-4 mb-1.5 flex justify-between text-xs">
                      <span className="text-muted">{d.target_amount ? compactRupiah(d.target_amount) : "Tanpa target dana"}</span>
                      <span className="font-semibold text-heading">{p}%</span>
                    </div>
                    <ProgressBar value={p} />
                  </Link>
                );
              })}
              <Link
                href="/goals/baru"
                className="flex min-w-[40%] snap-start flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line p-5 text-sm font-semibold text-muted hover:border-gold hover:text-heading sm:hidden"
              >
                <Plus className="h-5 w-5" /> Mimpi baru
              </Link>
            </div>
          )}
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
        {onboarding ? (
          <section className="card p-6">
            <h3 className="font-bold text-heading">Mulai di sini</h3>
            <ul className="mt-3 space-y-1">
              {steps.map((st) => (
                <li key={st.label}>
                  <Link href={st.href} className="-mx-2 flex items-center gap-3 rounded-xl p-2 hover:bg-paper">
                    {st.done ? (
                      <CheckCircle2 className="h-[18px] w-[18px] shrink-0 text-success" />
                    ) : (
                      <Circle className="h-[18px] w-[18px] shrink-0 text-line" strokeWidth={2.2} />
                    )}
                    <span className={`text-sm font-medium ${st.done ? "text-muted line-through" : "text-ink"}`}>{st.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <section className="card p-6">
            <h3 className="font-bold text-heading">Langkah mimpi berikutnya</h3>
            <ul className="mt-3 space-y-1">
              {actions.length === 0 && <li className="text-sm text-muted">Semua langkah selesai. Tambahkan langkah baru di halaman mimpi.</li>}
              {actions.map((a) => (
                <li key={a.id}>
                  <Link href={`/goals/${a.dream_id}`} className="-mx-2 flex items-start gap-3 rounded-xl p-2 hover:bg-paper">
                    <Circle className="mt-0.5 h-[18px] w-[18px] shrink-0 text-line" strokeWidth={2.2} />
                    <span>
                      <span className="block text-sm font-medium text-ink">{a.title}</span>
                      <span className="block text-xs text-muted">{a.dream_title}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <Link href="/wheel-of-life" className="card flex items-center gap-4 p-6 transition hover:shadow-lift">
          {wheel[0] ? (
            <>
              <div className="w-[110px] shrink-0">
                <WheelChart scores={wheel[0].scores} size={110} labels={false} />
              </div>
              <div>
                <p className="eyebrow">Wheel of Life</p>
                <p className="mt-1 text-2xl font-bold text-heading">{wheelAverage(wheel[0].scores)}<span className="text-sm font-medium text-muted"> / 10</span></p>
                <p className="text-xs text-muted">Keseimbangan hidup Anda</p>
              </div>
            </>
          ) : (
            <div>
              <p className="eyebrow">Wheel of Life</p>
              <p className="mt-1 font-semibold text-heading">Seberapa seimbang hidup Anda?</p>
              <p className="mt-1 text-sm text-muted">Nilai 8 area kehidupan dalam 2 menit.</p>
            </div>
          )}
        </Link>

        {profile.success_definition ? (
          <section className="card flex gap-4 p-6">
            <Quote className="h-6 w-6 shrink-0 text-gold" />
            <div>
              <p className="eyebrow">Definisi sukses saya</p>
              <p className="mt-1.5 line-clamp-4 text-[15px] leading-relaxed text-ink">{profile.success_definition}</p>
            </div>
          </section>
        ) : (
          <Link href="/profile#sukses" className="card flex gap-4 p-6 hover:shadow-lift">
            <Quote className="h-6 w-6 shrink-0 text-gold" />
            <div>
              <p className="eyebrow">Definisi sukses saya</p>
              <p className="mt-1.5 text-sm text-muted">Apa arti sukses bagi Anda? Tuliskan di sini.</p>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
