import Link from "next/link";
import { Award, Lock } from "lucide-react";
import { PageHeader, ProgressBar } from "@/components/ui";
import { getSefProgress, listCourses } from "@/lib/lms";
import { phaseName, SEF_STEPS } from "@/lib/sef";

export const metadata = { title: "Sertifikat" };

export default async function SertifikatPage() {
  const courses = await listCourses();
  const prog = await getSefProgress(courses);
  return (
    <>
      <PageHeader eyebrow="Sertifikat SEF" title="Bukti perjalanan Anda" desc="Selesaikan semua materi di satu langkah SEF untuk mendapatkan sertifikat resmi EClub yang bisa dicetak dan dicek keasliannya." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SEF_STEPS.map((s) => {
          const pct = prog.stepPct[s.key];
          const earned = pct === 100;
          return (
            <section key={s.key} className={`card flex flex-col p-5 ${earned ? "border-gold" : ""}`}>
              <div className="flex items-center gap-3">
                <span className={`grid h-11 w-11 place-items-center rounded-2xl ${earned ? "bg-gold text-brand-deep" : "bg-paper text-muted"}`}>{earned ? <Award className="h-6 w-6" /> : <Lock className="h-5 w-5" />}</span>
                <div>
                  <p className="text-xs font-semibold text-gold">
                    {phaseName(s.phase)} · Langkah {s.no}
                  </p>
                  <p className="font-bold text-heading">{s.name}</p>
                </div>
              </div>
              <div className="mt-4 flex-1">
                {pct === null ? (
                  <p className="text-sm text-muted">Kelas untuk langkah ini segera hadir.</p>
                ) : (
                  <>
                    <div className="mb-1.5 flex justify-between text-xs">
                      <span className="text-muted">Progres materi</span>
                      <b className="text-heading">{pct}%</b>
                    </div>
                    <ProgressBar value={pct} tone={earned ? "gold" : "brand"} />
                  </>
                )}
              </div>
              {earned ? (
                <Link href={`/sertifikat/${s.key}`} className="btn-gold mt-4">
                  Lihat & cetak sertifikat
                </Link>
              ) : pct !== null ? (
                <Link href={`/learn#${s.key}`} className="btn-ghost mt-4">
                  Lanjutkan belajar
                </Link>
              ) : null}
            </section>
          );
        })}
      </div>
    </>
  );
}
