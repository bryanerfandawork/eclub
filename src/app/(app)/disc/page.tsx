import Link from "next/link";
import { ArrowRight, Crown, Lock, RotateCcw, Sparkles } from "lucide-react";
import { DiscChart } from "@/components/disc-chart";
import { OrderButton } from "@/components/order-button";
import { PageHeader } from "@/components/ui";
import { rupiah } from "@/lib/format";
import { DISC_QUESTIONS, DISC_TYPES } from "@/lib/disc/data";
import { FACTOR_SHORT, INSIGHTS } from "@/lib/disc/insights";
import type { Factor } from "@/lib/disc/score";
import { discPrice, getDiscResult, hasDiscReport } from "@/lib/disc/server";
import { DiscQuiz } from "./quiz";

export const metadata = { title: "Tes DISC" };

function List({ items }: { items: string[] }) {
  return (
    <ul className="mt-2 space-y-1.5">
      {items.map((t) => (
        <li key={t} className="flex gap-2 text-sm leading-relaxed text-ink">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" /> {t}
        </li>
      ))}
    </ul>
  );
}

export default async function DiscPage({ searchParams }: { searchParams: Promise<{ ulang?: string }> }) {
  const { ulang } = await searchParams;
  const latest = await getDiscResult();

  if (!latest || ulang) {
    return (
      <>
        <PageHeader
          eyebrow="Spark · Kenali diri"
          title="Tes Kepribadian DISC"
          desc="Pahami gaya perilaku alami Anda: cara Anda mengambil keputusan, bergaul, bekerja, dan menghadapi tekanan. Tes dan hasil dasar gratis."
        />
        <DiscQuiz questions={DISC_QUESTIONS.map((q) => q.options)} />
      </>
    );
  }

  const [unlocked, price] = await Promise.all([hasDiscReport(), discPrice()]);
  const { natural, adapted } = latest.result;
  const p = natural.primary as Factor;
  const ins = INSIGHTS[p];
  const ranked = (["D", "I", "S", "C"] as Factor[]).sort((a, b) => natural.values[b] - natural.values[a]);
  const secondary = natural.values[ranked[1]] > 50 ? ranked[1] : null;
  const typeN = natural.type ? DISC_TYPES[natural.type] : null;
  const typeA = adapted.type ? DISC_TYPES[adapted.type] : null;

  return (
    <>
      <PageHeader eyebrow="Hasil Tes DISC" title="Profil kepribadian Anda" desc={`Diambil ${new Date(latest.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}.`} />

      <section className="relative overflow-hidden rounded-3xl p-6 text-white shadow-lift lg:p-8" style={{ background: `linear-gradient(135deg, #8b2220, ${ins.color})` }}>
        <p className="eyebrow">Gaya dominan Anda</p>
        <h2 className="mt-2 text-3xl font-bold lg:text-4xl">
          {p} · {ins.tagline}
        </h2>
        <p className="mt-1 text-sm font-semibold text-white/80">
          {ins.name}
          {secondary && ` dengan sisi ${INSIGHTS[secondary].name} (${secondary})`}
          {typeN && ` · Pola ${typeN.name}`}
        </p>
        <p className="mt-4 max-w-2xl leading-relaxed text-white/90">{ins.summary}</p>
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="card p-5">
          <DiscChart values={natural.values} title="Grafik II · Diri alami (Natural)" subtitle="Siapa Anda sebenarnya, saat tidak sedang menyesuaikan diri." />
        </section>
        <section className="card p-5">
          <DiscChart values={adapted.values} title="Grafik I · Diri di lingkungan (Adapted)" subtitle="Bagaimana Anda menyesuaikan diri dengan tuntutan sekitar." />
        </section>
      </div>

      <section className="card mt-5 p-5 lg:p-6">
        <h3 className="font-bold text-heading">Arti tiap huruf</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {(["D", "I", "S", "C"] as Factor[]).map((f) => (
            <div key={f} className="flex items-center gap-3 rounded-xl bg-paper p-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg font-bold text-white" style={{ background: INSIGHTS[f].color }}>
                {f}
              </span>
              <div className="flex-1">
                <p className="text-sm font-bold text-heading">
                  {INSIGHTS[f].name} <span className="font-normal text-muted">· {natural.values[f]}</span>
                </p>
                <p className="text-xs text-muted">{FACTOR_SHORT[f]}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">Nilai di atas 50 berarti faktor tersebut menonjol dalam diri Anda.</p>
      </section>

      {typeN && (
        <section className="card mt-5 p-5 lg:p-6">
          <p className="eyebrow">Pola Anda</p>
          <h3 className="mt-1 text-xl font-bold text-heading">{typeN.name}</h3>
          <p className="mt-1 text-sm italic text-muted">&ldquo;{typeN.tagline}&rdquo;</p>
          <h3 className="mt-5 font-bold text-heading">Kelebihan utama Anda</h3>
          <List items={typeN.strengths} />
        </section>
      )}

      {unlocked ? (
        <>
          {typeN && (
            <section className="card mt-5 p-5 lg:p-6">
              <h3 className="font-bold text-heading">Meningkatkan efektivitas dengan cara</h3>
              <List items={typeN.improve} />
              <h3 className="mt-5 font-bold text-heading">Kecenderungan Anda</h3>
              <dl className="mt-2 grid gap-3 sm:grid-cols-2">
                {[
                  ["Hal yang dikejar", typeN.pursues],
                  ["Cara menilai orang lain", typeN.judged],
                  ["Cara memengaruhi", typeN.influence],
                  ["Nilai bagi tim / perusahaan", typeN.value],
                  ["Berlebihan pada", typeN.overuse],
                  ["Saat sedang stres", typeN.stress],
                  ["Ketakutan", typeN.fear],
                ]
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <div key={k} className="rounded-xl bg-paper p-3">
                      <dt className="text-[11px] font-semibold tracking-wide text-muted uppercase">{k}</dt>
                      <dd className="mt-0.5 text-sm text-ink">{v}</dd>
                    </div>
                  ))}
              </dl>
            </section>
          )}
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <section className="card p-5 lg:p-6">
              <h3 className="font-bold text-heading">Rekomendasi karier</h3>
              <List items={ins.careers} />
              <h3 className="mt-5 font-bold text-heading">Ide bisnis yang cocok</h3>
              <List items={ins.business} />
              <p className="mt-4 rounded-xl bg-gold-soft p-3 text-sm leading-relaxed text-heading">{ins.entrepreneur}</p>
            </section>
            <section className="card p-5 lg:p-6">
              <h3 className="font-bold text-heading">Yang memotivasi Anda</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink">{ins.motivator}</p>
              <h3 className="mt-5 font-bold text-heading">Lingkungan kerja ideal</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink">{ins.environment}</p>
              <h3 className="mt-5 font-bold text-heading">Tips bagi orang lain saat berkomunikasi dengan Anda</h3>
              <List items={ins.communicate} />
            </section>
            <section className="card p-5 lg:p-6">
              <h3 className="font-bold text-heading">Titik buta yang perlu diwaspadai</h3>
              <List items={ins.blindspots} />
              <h3 className="mt-5 font-bold text-heading">Langkah bertumbuh</h3>
              <List items={ins.growth} />
            </section>
            <section className="card p-5 lg:p-6">
              <h3 className="font-bold text-heading">Anda dalam Sustainable Entrepreneur Framework</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink">{ins.sef}</p>
              {typeA && adapted.type !== natural.type && (
                <>
                  <h3 className="mt-5 font-bold text-heading">Saat menyesuaikan diri ({adapted.primary})</h3>
                  <p className="mt-1 text-sm text-muted">Di lingkungan kerja Anda cenderung tampil sebagai pola {typeA.name}, dengan kelebihan:</p>
                  <List items={typeA.strengths.slice(0, 2)} />
                  <p className="mt-3 text-xs text-muted">Jika diri alami dan diri di lingkungan sangat berbeda, Anda mungkin sedang banyak menyesuaikan diri. Ini bisa menguras energi bila berlangsung lama.</p>
                </>
              )}
              <p className="mt-5 flex items-center gap-2 text-sm text-muted">
                <Sparkles className="h-4 w-4 text-gold" /> Ingin membahas hasil ini? Buka AI Companion (tombol emas) dan tanyakan langsung.
              </p>
            </section>
          </div>
        </>
      ) : (
        <section className="relative mt-5 overflow-hidden rounded-3xl bg-heading p-6 text-white lg:p-8">
          <div className="pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full bg-brand/50 blur-3xl" />
          <p className="eyebrow flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" /> Laporan Lengkap DISC
          </p>
          <h3 className="mt-2 text-2xl font-bold">Pahami diri Anda lebih dalam</h3>
          <ul className="mt-4 grid gap-2 text-sm text-white/85 sm:grid-cols-2">
            {["Cara meningkatkan efektivitas", "Kecenderungan, pemicu stres & ketakutan", "Rekomendasi karier yang cocok", "Ide bisnis & peran sebagai entrepreneur", "Lingkungan kerja ideal & cara berkomunikasi", "Titik buta dan langkah bertumbuh", "Posisi Anda di Sustainable Entrepreneur Framework", "Analisis diri alami vs diri di lingkungan"].map((t) => (
              <li key={t} className="flex gap-2">
                <span className="text-gold">✓</span> {t}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="sm:w-64">
              <OrderButton product="disc_report" label={`Buka laporan · ${rupiah(price)}`} className="btn-gold w-full py-3" />
            </div>
            <Link href="/paket" className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/85 hover:text-white">
              <Crown className="h-4 w-4 text-gold" /> Atau gratis dengan EClub Plus <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-3 text-xs text-white/50">Sekali bayar, berlaku selamanya termasuk untuk tes ulang.</p>
        </section>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/disc?ulang=1" className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-brand">
          <RotateCcw className="h-4 w-4" /> Ulangi tes
        </Link>
        <p className="text-xs text-muted">DISC adalah alat refleksi perilaku, bukan diagnosis psikologis.</p>
      </div>
    </>
  );
}
