import Link from "next/link";
import { ArrowUpRight, Lock } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { STAGES } from "@/lib/journey";

export const metadata = { title: "My Journey" };

export default function JourneyPage() {
  return (
    <>
      <PageHeader
        eyebrow="EClub Success Framework"
        title="Perjalanan sukses Anda"
        desc="Enam tahap untuk menemukan arah dan mewujudkan tujuan. Kerjakan berurutan, atau mulai dari yang paling Anda butuhkan."
      />
      <ol className="relative space-y-4">
        <span className="absolute top-6 bottom-6 left-[27px] w-px bg-line lg:left-[31px]" aria-hidden />
        {STAGES.map((s, i) => (
          <li key={s.id} id={s.id} className="relative flex animate-rise gap-4 lg:gap-6" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="z-10 grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-line bg-white text-sm font-bold text-navy shadow-soft lg:h-16 lg:w-16">
              {s.no}
            </div>
            <div className="card flex-1 p-5 lg:p-6">
              <h2 className="text-lg font-bold text-navy">{s.name}</h2>
              <p className="mt-1 text-sm text-muted">{s.desc}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {s.tools.map((t) =>
                  t.href ? (
                    <Link
                      key={t.label}
                      href={t.href}
                      className="inline-flex items-center gap-1.5 rounded-full bg-navy px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-navy-soft"
                    >
                      {t.label} <ArrowUpRight className="h-3.5 w-3.5 text-gold" />
                    </Link>
                  ) : (
                    <span
                      key={t.label}
                      className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-xs font-medium text-muted"
                    >
                      <Lock className="h-3 w-3" /> {t.label}
                    </span>
                  ),
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}
