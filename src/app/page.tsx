import Link from "next/link";
import { ArrowRight, Compass, Gem, Route, Sparkles } from "lucide-react";
import { Logo } from "@/components/logo";
import { STAGES } from "@/lib/journey";

const features = [
  { icon: Compass, title: "Kenali diri", desc: "Temukan definisi sukses, nilai, dan potensi Anda sendiri." },
  { icon: Gem, title: "Rancang mimpi", desc: "Ubah mimpi menjadi target dana, tanggal, dan langkah nyata." },
  { icon: Route, title: "Jalani prosesnya", desc: "Ikuti enam tahap Success Framework dengan pendampingan." },
];

export default function Home() {
  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 lg:px-10">
        <Logo />
        <nav className="flex items-center gap-2">
          <Link href="/masuk" className="btn text-heading hover:bg-white">Masuk</Link>
          <Link href="/daftar" className="btn-primary">Daftar</Link>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-5 pt-10 pb-16 text-center lg:px-10 lg:pt-20 lg:pb-24">
        <span className="inline-flex animate-rise items-center gap-2 rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-semibold text-heading shadow-soft">
          <Sparkles className="h-3.5 w-3.5 text-gold" /> Personal Growth Companion
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl animate-rise text-[40px] leading-[1.08] font-bold tracking-tight text-heading sm:text-6xl">
          Find Your Path.
          <br />
          <span className="text-gold">Build Your Success.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl animate-rise text-[17px] leading-relaxed text-muted">
          Tidak semua orang harus menjadi entrepreneur untuk sukses. EClub membantu Anda menemukan jalan sendiri, lalu
          mewujudkannya langkah demi langkah.
        </p>
        <div className="mt-8 flex animate-rise flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/daftar" className="btn-primary px-6 py-3.5 text-[15px]">
            Mulai gratis <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/masuk" className="btn-ghost px-6 py-3.5 text-[15px]">
            Saya sudah punya akun
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-5 pb-16 sm:grid-cols-3 lg:px-10">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card p-6">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gold-soft text-gold">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-bold text-heading">{title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">{desc}</p>
          </div>
        ))}
      </section>

      <section className="bg-brand py-16 text-white lg:py-20">
        <div className="mx-auto max-w-6xl px-5 lg:px-10">
          <p className="eyebrow">EClub Success Framework</p>
          <h2 className="mt-3 max-w-lg text-3xl font-bold tracking-tight">Enam tahap dari mengenal diri hingga bertindak</h2>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {STAGES.map((s) => (
              <div key={s.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-bold text-gold">{s.no}</p>
                <p className="mt-2 text-lg font-bold">{s.name}</p>
                <p className="mt-1 text-sm text-white/65">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-5 py-8 text-sm text-muted lg:px-10">© {new Date().getFullYear()} EClub Indonesia</footer>
    </div>
  );
}
