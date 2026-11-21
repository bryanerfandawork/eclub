import Link from "next/link";
import { CheckCircle2, Pencil } from "lucide-react";
import { LogoMark } from "@/components/logo";
import { PrintButton } from "@/components/print-button";
import { PageHeader } from "@/components/ui";
import { DiscSummary } from "@/components/disc-summary";
import { getDiscResult } from "@/lib/disc/server";
import { getDreams, getLifePlan, getProfile } from "@/lib/data";
import { tanggal } from "@/lib/format";
import { WHEEL_AREAS } from "@/lib/types";
import { LifeForm } from "./life-form";

export const metadata = { title: "My Life" };

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="break-inside-avoid border-t border-line pt-6">
      <p className="eyebrow">{title}</p>
      <div className="mt-2">{children}</div>
    </section>
  );
}

export default async function MyLifePage({ searchParams }: { searchParams: Promise<{ ubah?: string; tersimpan?: string }> }) {
  const [{ ubah, tersimpan }, profile, plan, disc, dreams] = await Promise.all([
    searchParams,
    getProfile(),
    getLifePlan(),
    getDiscResult(),
    getDreams(),
  ]);
  const editing = !plan || ubah === "1";

  if (editing) {
    return (
      <>
        <PageHeader
          eyebrow="My Life · Define & Design"
          title="Rumuskan hidup yang Anda inginkan"
          desc="Empat langkah singkat. Hasilnya menjadi dokumen pribadi yang bisa Anda baca ulang dan cetak."
        />
        <div className="max-w-3xl">
          <LifeForm plan={plan} successDefinition={profile.success_definition} />
        </div>
      </>
    );
  }

  const label = (k: string) => WHEEL_AREAS.find((a) => a.key === k)?.label ?? k;
  const active = dreams.filter((d) => d.status === "active");

  return (
    <>
      <div className="print:hidden">
        <PageHeader
          eyebrow="My Life"
          title="Dokumen hidup saya"
          desc="Ringkasan definisi sukses, nilai, visi, dan prioritas Anda."
          action={
            <div className="flex gap-2 self-start">
              <PrintButton />
              <Link href="/my-life?ubah=1" className="btn-primary">
                <Pencil className="h-4 w-4" /> Ubah
              </Link>
            </div>
          }
        />
        {tersimpan && (
          <p className="mb-5 flex animate-rise items-center gap-2 rounded-xl bg-success/10 px-4 py-3 text-sm font-medium text-success">
            <CheckCircle2 className="h-4 w-4" /> Tersimpan. Inilah dokumen hidup Anda.
          </p>
        )}
      </div>

      <article className="card mx-auto max-w-3xl space-y-6 p-6 sm:p-10 print:border-0 print:shadow-none">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Personal Success Definition</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-heading sm:text-3xl">{profile.full_name || "Sahabat EClub"}</h1>
            {plan.updated_at && <p className="mt-1 text-xs text-muted">Diperbarui {tanggal(plan.updated_at.slice(0, 10))}</p>}
          </div>
          <LogoMark className="h-12 w-12 shrink-0" />
        </header>

        <Block title="Definisi sukses saya">
          <p className="text-[17px] leading-relaxed text-heading">
            {profile.success_definition ? `“${profile.success_definition}”` : <span className="text-muted">Belum diisi.</span>}
          </p>
        </Block>

        <Block title="Nilai yang saya pegang">
          {plan.core_values.length ? (
            <div className="flex flex-wrap gap-2">
              {plan.core_values.map((v) => (
                <span key={v} className="rounded-full bg-brand px-3.5 py-1.5 text-sm font-semibold text-white">
                  {v}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">Belum dipilih.</p>
          )}
        </Block>

        <Block title="Visi hidup 10 tahun">
          <p className="leading-relaxed whitespace-pre-line text-ink">{plan.vision || <span className="text-muted">Belum diisi.</span>}</p>
        </Block>

        <div className="grid gap-6 sm:grid-cols-2">
          <Block title="Prioritas saat ini">
            {plan.priorities.length ? (
              <ol className="space-y-2">
                {plan.priorities.map((k, i) => (
                  <li key={k} className="flex items-center gap-3">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-gold-soft text-sm font-bold text-brand">{i + 1}</span>
                    <span className="font-medium text-heading">{label(k)}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted">Belum dipilih.</p>
            )}
          </Block>
          <Block title="Gaya kepribadian (DISC)">
            <DiscSummary result={disc?.result ?? null} className="print:shadow-none" />
          </Block>
        </div>

        <Block title="Mimpi yang sedang saya wujudkan">
          {active.length ? (
            <ul className="space-y-1.5">
              {active.map((d) => (
                <li key={d.id} className="flex items-baseline gap-2 text-ink">
                  <span className="text-gold">◆</span>
                  <span>
                    {d.title}
                    {d.target_date && <span className="text-sm text-muted"> · {tanggal(d.target_date)}</span>}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Link href="/goals/baru" className="text-sm font-semibold text-brand hover:underline">
              Tulis mimpi pertama →
            </Link>
          )}
        </Block>

        <footer className="border-t border-line pt-5 text-center text-xs text-muted">EClub · Find Your Path. Build Your Success.</footer>
      </article>
    </>
  );
}
