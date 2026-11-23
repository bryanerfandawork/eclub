import Link from "next/link";
import { ArrowRight, BookOpen, Circle, Crown, Gem, Lock, Newspaper, Sparkles, Target, TrendingUp, Users } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { ackStep } from "@/app/actions/journey";
import { PendingButton } from "@/components/pending-button";
import { getAssessmentResults, getDreams, getProfile } from "@/lib/data";
import { getDiscResult } from "@/lib/disc/server";
import { INSIGHTS } from "@/lib/disc/insights";
import type { Factor } from "@/lib/disc/score";
import { ASSETS, KIND_LABEL, KIND_SEF, recommend, summarize, type Assets, type IncomeKind } from "@/lib/income";
import { getIncomeProfile } from "@/lib/income-server";
import { listCourses } from "@/lib/lms";
import { listArticles } from "@/lib/articles";
import { getLimit } from "@/lib/plans";
import { PLACEMENT_COPY, PLACEMENT_KEY, type Placement } from "@/lib/placement";
import { compactRupiah, rupiah } from "@/lib/format";
import { getJourney } from "@/lib/steps-server";

export const metadata = { title: "Rekap & Rekomendasi" };

const KINDS: IncomeKind[] = ["active", "massive", "passive"];
const STEP_OF: Record<IncomeKind, string[]> = { active: ["personal_mapping", "acquisition"], massive: ["systemation", "transformation"], passive: ["investation"] };

export default async function RekapPage() {
  const [profile, dreams, disc, placed, income, courses, articles, recoLimit, journey] = await Promise.all([
    getProfile(),
    getDreams(),
    getDiscResult(),
    getAssessmentResults(PLACEMENT_KEY, 1),
    getIncomeProfile().catch(() => null),
    listCourses(),
    listArticles(),
    getLimit("income_reco"),
    getJourney(),
  ]);
  const placement = (placed[0]?.scores as unknown as { placement?: Placement } | undefined)?.placement;
  const nat = disc?.result?.natural;
  const order = nat?.values ? (Object.entries(nat.values) as [Factor, number][]).sort((a, b) => b[1] - a[1]).map(([f]) => f) : [];
  const discLite = nat?.primary ? { primary: nat.primary, secondary: order.find((f) => f !== nat.primary) ?? null } : null;
  const s = income ? summarize(income, dreams) : null;
  const reco = income && recoLimit !== 0 ? recommend(income, discLite) : null;
  const missing = journey.steps.slice(0, 4).flatMap((st) => st.items.filter((i) => !i.optional && !i.done && i.key !== "rekap").map((i) => ({ ...i, step: st.no })));
  const focus: IncomeKind = s?.focus ?? "active";
  const stepCourses = courses.filter((c) => (placement && c.sef_step === placement) || (c.sef_step && STEP_OF[focus].includes(c.sef_step))).slice(0, 3);
  const helpSlugs = ["active-massive-passive-income", "memulai-massive-income-side-hustle", "berapa-harus-menabung-untuk-mimpi", "mencatat-pengeluaran-bulanan"];
  const reads = [...articles.filter((a) => helpSlugs.includes(a.slug)), ...articles.filter((a) => a.access === "free" && !helpSlugs.includes(a.slug))].slice(0, 3);
  const chips = income ? [...income.interests, ...income.talents, ...income.passions].slice(0, 6) : [];
  const assetsHave = income ? (Object.keys(ASSETS) as (keyof Assets)[]).filter((k) => income.assets[k].length) : [];
  const faster = s?.monthsNow && s.monthsWithPlan ? s.monthsNow - s.monthsWithPlan : 0;
  const firstName = (profile.full_name || "Sahabat").split(" ")[0];

  return (
    <>
      <PageHeader eyebrow="Langkah 4 · Rekap" title={`${firstName}, ini peta Anda dalam satu halaman`} desc="Langkah 4 terakhir: semua yang sudah Anda isi di langkah 1 sampai 4, beserta rekomendasi kelas, ide income, bacaan, dan mentoring. Baca sampai bawah, lalu tandai selesai." />

      {missing.length > 0 && (
        <div className="mb-6 rounded-2xl border border-gold/40 bg-gold-soft/60 p-5">
          <p className="font-bold text-heading">Rekap ini makin tajam kalau isian berikut dilengkapi:</p>
          <ul className="mt-2 space-y-1.5">
            {missing.slice(0, 5).map((m) => (
              <li key={m.key}>
                <Link href={m.href} className="flex items-center gap-2 text-sm text-ink hover:text-brand">
                  <Circle className="h-4 w-4 shrink-0 text-gold" strokeWidth={2.4} /> Langkah {m.step}: {m.label}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <section className="card p-5">
          <p className="eyebrow flex items-center gap-1.5">
            <Gem className="h-3.5 w-3.5" /> 1 · Mimpi
          </p>
          {dreams.length ? (
            <ul className="mt-2 space-y-1.5">
              {dreams.slice(0, 4).map((d) => {
                const row = s?.dreamRows.find((r) => r.id === d.id);
                return (
                  <li key={d.id} className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate font-medium text-heading">{d.title}</span>
                    <span className="shrink-0 text-xs text-muted">{row?.perMonth ? `${rupiah(row.perMonth)}/bln` : d.target_amount ? rupiah(d.target_amount) : ""}</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted">Belum ada mimpi.</p>
          )}
          {profile.success_definition && <p className="mt-3 line-clamp-2 text-xs text-muted italic">“{profile.success_definition}”</p>}
        </section>

        <section className="card p-5">
          <p className="eyebrow flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" /> 2 · Kondisi saat ini
          </p>
          {placement && <p className="mt-2 text-sm font-semibold text-heading">{PLACEMENT_COPY[placement].title}</p>}
          {s ? (
            <>
              <p className="mt-1 text-sm text-ink">{s.stage.label}</p>
              <p className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                <span className="min-w-0 rounded-xl bg-paper p-2">
                  Masuk<b className="block text-sm text-heading">{compactRupiah(s.income)}</b>
                </span>
                <span className="min-w-0 rounded-xl bg-paper p-2">
                  Keluar<b className="block text-sm text-heading">{compactRupiah(s.expense)}</b>
                </span>
                <span className="min-w-0 rounded-xl bg-paper p-2">
                  Sisa<b className={`block text-sm ${s.surplus < 0 ? "text-danger" : "text-success"}`}>{compactRupiah(s.surplus)}</b>
                </span>
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-muted">Peta Income belum diisi.</p>
          )}
        </section>

        <section className="card p-5">
          <p className="eyebrow flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> 3 · Potensi diri
          </p>
          {nat?.primary && <p className="mt-2 text-sm font-semibold text-heading">Gaya Diri: {INSIGHTS[nat.primary].tagline}</p>}
          {chips.length > 0 && <p className="mt-1 text-sm text-ink">{chips.join(" · ")}</p>}
          {income && income.swot.s.length > 0 && <p className="mt-1 text-xs text-muted">Kekuatan utama: {income.swot.s.slice(0, 3).join(", ")}</p>}
          {assetsHave.length > 0 && <p className="mt-1 text-xs text-muted">Modal yang dimiliki: {assetsHave.map((k) => ASSETS[k].title.replace("Modal ", "")).join(", ")}</p>}
        </section>

        <section className="card p-5">
          <p className="eyebrow flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5" /> 4 · Action plan
          </p>
          {income?.plans.length ? (
            <ul className="mt-2 space-y-1 text-sm">
              {income.plans.map((p) => (
                <li key={p.name} className="flex justify-between gap-3">
                  <span className="text-heading">{p.name}</span>
                  <span className="text-xs text-muted">{p.target ? `${rupiah(p.target)}/bln` : ""}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted">Belum ada rencana income.</p>
          )}
          {s && s.gap > 0 && <p className="mt-2 text-xs text-danger">Kebutuhan mimpi masih kurang {rupiah(s.gap)}/bulan.</p>}
          {faster > 0 && <p className="mt-2 text-xs font-semibold text-success">Jika rencana berjalan, mimpi tercapai {faster} bulan lebih cepat 🚀</p>}
        </section>
      </div>

      <h2 className="mt-10 text-xl font-bold text-heading">Rekomendasi untuk Anda</h2>
      <p className="mt-1 text-sm text-muted">Disusun dari posisi SEF, Gaya Diri, minat-bakat, dan mimpi Anda.</p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <section className="card p-5">
          <p className="flex items-center gap-2 font-bold text-heading">
            <BookOpen className="h-4 w-4 text-brand" /> Kelas yang cocok sekarang
          </p>
          <ul className="mt-3 space-y-2">
            {(stepCourses.length ? stepCourses : courses.slice(0, 3)).map((c) => (
              <li key={c.id}>
                <Link href={`/learn/${c.slug}`} className="flex items-center justify-between gap-3 rounded-xl bg-paper p-3 text-sm font-medium text-heading hover:text-brand">
                  {c.title} <ArrowRight className="h-4 w-4 shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section className="card p-5">
          <p className="flex items-center gap-2 font-bold text-heading">
            <Newspaper className="h-4 w-4 text-brand" /> Bacaan singkat
          </p>
          <ul className="mt-3 space-y-2">
            {reads.map((a) => (
              <li key={a.id}>
                <Link href={`/artikel/${a.slug}`} className="flex items-center justify-between gap-3 rounded-xl bg-paper p-3 text-sm font-medium text-heading hover:text-brand">
                  {a.title} <ArrowRight className="h-4 w-4 shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-4">
        <div className="flex items-center gap-2">
          <p className="font-bold text-heading">Ide active, massive & passive income</p>
          <span className="inline-flex items-center gap-1 rounded-full bg-gold-soft px-2 py-0.5 text-[11px] font-semibold text-brand">
            <Crown className="h-3 w-3" /> Plus
          </span>
        </div>
        {reco ? (
          <div className="mt-3 grid gap-4 lg:grid-cols-3">
            {KINDS.map((k) => (
              <div key={k} className="card p-5">
                <p className="font-bold text-heading">{KIND_LABEL[k]}</p>
                <p className="text-[11px] text-muted">{KIND_SEF[k]}</p>
                <ul className="mt-3 space-y-3">
                  {reco[k].map((r) => (
                    <li key={r.id}>
                      <p className="text-sm font-semibold text-heading">{r.name}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted">{r.how}</p>
                      {r.reasons.length > 0 && <p className="mt-1 text-[11px] text-ink">✓ {r.reasons.join(" · ")}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 flex flex-col items-start gap-3 rounded-3xl bg-brand p-6 text-white shadow-lift sm:flex-row sm:items-center">
            <Lock className="h-7 w-7 shrink-0 text-gold" />
            <div className="flex-1">
              <p className="font-bold">9 ide income yang dicocokkan khusus untuk Anda</p>
              <p className="mt-1 text-sm text-white/75">Member Plus mendapat ide active, massive, dan passive income berdasarkan Gaya Diri, minat-bakat, dan mimpi, lengkap dengan alasannya.</p>
            </div>
            <Link href="/paket" className="btn-gold shrink-0">
              <Crown className="h-4 w-4" /> Buka dengan Plus
            </Link>
          </div>
        )}
        <p className="mt-2 text-xs text-muted">Ide disusun dari aturan EClub, bukan nasihat keuangan. Pelajari risiko sebelum berinvestasi.</p>
      </section>

      <div className="card mt-4 flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center">
        <Users className="h-8 w-8 shrink-0 text-brand" />
        <div className="flex-1">
          <p className="font-bold text-heading">Ingin dibantu menyusun langkah 90 hari?</p>
          <p className="mt-0.5 text-sm text-muted">Bawa rekap ini ke sesi mentoring 1-on-1. Mentor membantu memilih prioritas dan menyusun rencana yang realistis.</p>
        </div>
        <Link href="/mentoring" className="btn-primary shrink-0">
          Konsultasi <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {(() => {
        const acked = journey.steps[3].items.find((i) => i.key === "rekap")?.done;
        return (
          <section className="mt-6 rounded-3xl bg-brand p-6 text-center text-white shadow-lift">
            <p className="text-lg font-bold">{acked ? "✓ Langkah 4 selesai" : "Sudah membaca rekap Anda?"}</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-white/75">
              {acked ? "Lanjutkan ke langkah 5: kenali ritme evaluasi harian, mingguan, dan bulanan." : "Tandai langkah 4 selesai, lalu kenali ritme evaluasi yang akan menjaga Anda tetap di jalur."}
            </p>
            {acked ? (
              <Link href="/evaluasi" className="btn-gold mt-4 py-3">
                Langkah 5 · Ritme evaluasi <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <form action={ackStep} className="mt-4">
                <input type="hidden" name="step" value="rekap" />
                <input type="hidden" name="next" value="/evaluasi" />
                <PendingButton className="btn-gold w-full py-3 sm:w-auto">Saya paham & siap ke langkah berikutnya ✓</PendingButton>
              </form>
            )}
          </section>
        );
      })()}
    </>
  );
}
