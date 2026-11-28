import Link from "next/link";
import { ArrowRight, BookOpen, ChevronDown, Flame, MapPin, MessageCircle, RotateCcw } from "lucide-react";
import { StepNext } from "@/components/step-bar";
import { PageHeader } from "@/components/ui";
import { getAssessmentResults } from "@/lib/data";
import { listCourses } from "@/lib/lms";
import { PLACEMENT_COPY, PLACEMENT_KEY, type Placement } from "@/lib/placement";
import { SEF_PHASES, SEF_STEPS, SPARK } from "@/lib/sef";
import { PlacementWizard } from "./wizard";

export const metadata = { title: "Cek Posisi" };

export default async function PlacementPage({ searchParams }: { searchParams: Promise<{ ulang?: string }> }) {
  const { ulang } = await searchParams;
  const [results, courses] = await Promise.all([getAssessmentResults(PLACEMENT_KEY, 1), listCourses()]);
  const latest = results[0]?.scores as unknown as { placement: Placement; spark: number } | undefined;

  if (!latest || ulang) {
    return (
      <>
        <PageHeader eyebrow="Cek Posisi" title="Temukan titik awal Anda" desc="Agar Anda tidak bingung harus mulai dari mana." />
        <PlacementWizard />
      </>
    );
  }

  const p = latest.placement;
  const copy = PLACEMENT_COPY[p];
  const learnStep = p === "spark" ? "personal_mapping" : p;
  const stepCourses = courses.filter((c) => c.sef_step === learnStep).slice(0, 3);
  const activeIdx = p === "spark" ? -1 : SEF_STEPS.findIndex((s) => s.key === p);

  return (
    <>
      <PageHeader eyebrow="Hasil Cek Posisi" title="Inilah posisi Anda sekarang" desc="Setiap orang punya titik awal yang berbeda. Yang penting, Anda tahu langkah berikutnya." />
      <div className="mx-auto max-w-2xl space-y-5">
        <section className="relative overflow-hidden rounded-3xl bg-brand p-6 text-white shadow-lift lg:p-8">
          <div className="pointer-events-none absolute -top-20 -right-16 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
          <p className="eyebrow flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> Anda di sini
          </p>
          <h2 className="mt-2 text-2xl font-bold lg:text-3xl">{copy.title}</h2>
          <p className="mt-3 leading-relaxed text-white/80">{copy.why}</p>
          <p className="mt-3 text-sm text-white/65">Skor spark: {latest.spark} / 5</p>

          <div className="mt-7 space-y-2">
            <div className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${p === "spark" ? "bg-gold text-brand-deep" : "bg-white/10"}`}>
              <Flame className="h-4 w-4" />
              <span className="text-sm font-semibold">{SPARK.name}</span>
              {p === "spark" && <span className="ml-auto text-[11px] font-bold">ANDA DI SINI</span>}
            </div>
            {SEF_PHASES.map((ph) =>
              SEF_STEPS.filter((s) => s.phase === ph.key).map((s, k) => {
                const idx = SEF_STEPS.indexOf(s);
                const here = idx === activeIdx;
                return (
                  <div
                    key={s.key}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${here ? "bg-gold text-brand-deep" : idx < activeIdx ? "bg-white/15" : "bg-white/5 text-white/60"}`}
                  >
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-white/15 text-[11px] font-bold">{s.no}</span>
                    <span className="text-sm font-semibold">{s.name}</span>
                    {k === 0 && <span className="text-[11px] opacity-70">· {ph.name}</span>}
                    {here && <span className="ml-auto text-[11px] font-bold">ANDA DI SINI</span>}
                  </div>
                );
              }),
            )}
          </div>
        </section>

        {/* Fokus utama: selesaikan setup 5 langkah dulu. */}
        <StepNext inline />

        {/* Untuk yang penasaran: rekomendasi belajar, disembunyikan dalam lipatan. */}
        <details className="group card overflow-hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 [&::-webkit-details-marker]:hidden">
            <span>
              <span className="block font-bold text-heading">Mau langsung belajar?</span>
              <span className="mt-0.5 block text-sm text-muted">Lihat kelas & langkah yang cocok untuk posisi Anda. Setup bisa dilanjutkan kapan saja.</span>
            </span>
            <ChevronDown className="h-5 w-5 shrink-0 text-muted transition group-open:rotate-180" />
          </summary>
          <div className="space-y-5 border-t border-line p-5">
          <section>
            <p className="eyebrow">Langkah berikutnya</p>
            <p className="mt-2 leading-relaxed text-ink">{copy.next}</p>
            <div className="mt-5 space-y-2">
              {p === "spark" && (
                <>
                  <Link href="/my-life" className="btn-primary w-full justify-between">
                    Tulis definisi sukses <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/goals/baru" className="btn-ghost w-full justify-between">
                    Buat mimpi pertama <ArrowRight className="h-4 w-4" />
                  </Link>
                </>
              )}
              {p === "personal_mapping" && (
                <Link href="/assessment/8-wheel-entrepreneur" className="btn-primary w-full justify-between">
                  Ikuti tes 8 Wheel Entrepreneur <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              <Link href="/learn" className={`${p === "spark" || p === "personal_mapping" ? "btn-ghost" : "btn-primary"} w-full justify-between`}>
                <span className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> Kelas {SEF_STEPS.find((s) => s.key === learnStep)?.name}
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/target" className="btn w-full justify-between bg-heading text-white hover:brightness-110">
                <span className="flex items-center gap-2">🎯 Hitung target jualan harian</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/mentoring" className="btn-gold w-full justify-between">
                <span className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" /> Konsultasi dengan mentor
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
          {stepCourses.length > 0 && (
            <section>
              <p className="text-sm font-bold text-heading">Kelas yang cocok untuk Anda</p>
              <ul className="mt-3 divide-y divide-line">
                {stepCourses.map((c) => (
                  <li key={c.id}>
                    <Link href={`/learn/${c.slug}`} className="flex items-center justify-between gap-3 py-2.5 text-sm font-medium text-ink hover:text-brand">
                      {c.title} <ArrowRight className="h-4 w-4 shrink-0 text-muted" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          </div>
        </details>
          <Link href="/posisi?ulang=1" className="flex items-center justify-center gap-2 text-sm font-medium text-muted hover:text-brand">
            <RotateCcw className="h-4 w-4" /> Ulangi Cek Posisi
          </Link>
      </div>
    </>
  );
}
