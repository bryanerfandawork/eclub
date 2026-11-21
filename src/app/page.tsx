import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarCheck2,
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  Crown,
  Flame,
  Gem,
  Heart,
  MessageCircle,
  Quote,
  Users,
  Radar,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { SEF_PHASES, SEF_STEPS, SPARK } from "@/lib/sef";
import { getFeatures, getSettings } from "@/lib/plans";
import { listTestimonials } from "@/lib/testimonials";
import { contactHref } from "@/lib/contact";
import { rupiah } from "@/lib/format";
import { SEGMENTS } from "@/lib/types";

export const dynamic = "force-dynamic";

const FEATURES: { icon: typeof Heart; title: string; desc: string; soon?: boolean }[] = [
  { icon: Heart, title: "My Life", desc: "Rumuskan definisi sukses, nilai pribadi, visi 10 tahun, dan prioritas hidup dalam satu dokumen yang bisa dicetak." },
  { icon: Radar, title: "8 Wheel Entrepreneur", desc: "Tes 40 pernyataan yang memetakan 8 kompetensi entrepreneur Anda dalam diagram jaring laba-laba." },
  { icon: Gem, title: "Dream Planner", desc: "Ubah mimpi menjadi target dana dan tanggal. Sistem menghitung berapa yang perlu disisihkan setiap bulan." },
  { icon: CalendarCheck2, title: "Daily Action", desc: "Pecah tujuan besar menjadi aksi harian. Jaga rangkaian konsisten dan lihat grafik 7 hari terakhir." },
  { icon: BookOpen, title: "Learning Center", desc: "Kelas video berjenjang mengikuti Sustainable Entrepreneur Framework, dari Personal Mapping hingga Investation." },
  { icon: Sparkles, title: "AI Companion", desc: "Teman diskusi 24 jam yang memahami mimpi, posisi SEF, dan hasil tes Anda untuk menyusun rencana dan evaluasi." },
];

const PAINS = [
  { pain: "Sibuk setiap hari, tapi tidak yakin sedang menuju ke mana.", gain: "My Life membantu Anda merumuskan definisi sukses dan visi 10 tahun, jadi setiap langkah punya arah." },
  { pain: "Punya banyak mimpi, tapi selalu tertunda karena tidak tahu mulai dari mana.", gain: "Dream Planner mengubah mimpi menjadi angka, tanggal, dan tabungan bulanan yang jelas." },
  { pain: "Semangat di awal, lalu hilang setelah seminggu.", gain: "Daily Action dan rangkaian konsisten membuat kemajuan kecil terasa, setiap hari." },
  { pain: "Ingin berbisnis atau naik level, tapi tidak tahu kekuatan dan kelemahan sendiri.", gain: "Tes 8 Wheel Entrepreneur memetakan 8 kompetensi Anda dan menunjukkan area yang perlu dilatih." },
];


const FAQ = [
  { q: "Apakah EClub hanya untuk pengusaha?", a: "Tidak. EClub untuk siapa saja yang ingin bertumbuh: pelajar, karyawan, profesional, freelancer, maupun pemilik bisnis. Setiap orang punya definisi sukses dan kendaraan yang berbeda." },
  { q: "Apakah versi gratis benar-benar bisa dipakai?", a: "Ya. My Life, Tes Kepribadian DISC beserta hasil dasarnya, Daily Action, satu Dream Planner, dan tes 8 Wheel Entrepreneur bisa dipakai gratis selamanya. EClub Plus membuka laporan lengkap DISC, batas, dan fitur lanjutan." },
  { q: "Apakah data saya aman?", a: "Data tersimpan terenkripsi dan setiap akun hanya bisa mengakses datanya sendiri. Tim admin tidak bisa membaca isi mimpi, jawaban tes, atau catatan pribadi Anda." },
  { q: "Bisakah dipakai di HP?", a: "Bisa. EClub dirancang seperti aplikasi di HP dan bisa dipasang ke layar utama tanpa unduh dari Play Store atau App Store." },
  { q: "Apakah tes 8 Wheel Entrepreneur tes psikologi?", a: "Bukan. Ini instrumen refleksi diri yang disusun EClub dari riset kompetensi kewirausahaan. Hasilnya membantu Anda menentukan area yang perlu dikembangkan." },
];

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[280px] sm:w-[300px]">
      <div className="absolute -inset-10 -z-10 rounded-full bg-gold/20 blur-3xl" />
      <div className="rounded-[2.6rem] border-[10px] border-heading bg-paper shadow-lift">
        <div className="mx-auto mt-2 h-5 w-24 rounded-full bg-heading" />
        <div className="space-y-3 p-4 pt-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted">Selamat pagi,</p>
              <p className="text-base font-bold text-heading">Rina 👋</p>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-gold-soft px-2 py-0.5 text-[10px] font-bold text-brand">
              <Flame className="h-3 w-3" /> 12
            </span>
          </div>
          <div className="rounded-2xl bg-brand p-3.5 text-white">
            <p className="text-[9px] font-semibold tracking-widest text-gold uppercase">Perjalanan Anda</p>
            <p className="mt-1 text-sm font-bold">Survive · Acquisition</p>
            <div className="mt-2.5 flex gap-1">
              {[1, 1, 1, 0, 0, 0].map((on, i) => (
                <span key={i} className={`h-1 flex-1 rounded-full ${on ? "bg-gold" : "bg-white/20"}`} />
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-white p-3">
            <p className="text-[11px] font-bold text-heading">Aksi hari ini</p>
            {[
              ["Olahraga pagi 20 menit", true],
              ["Hubungi 3 calon pelanggan", false],
              ["Catat pengeluaran", false],
            ].map(([t, done]) => (
              <p key={String(t)} className="mt-2 flex items-center gap-2 text-[11px]">
                {done ? <CheckCircle2 className="h-3.5 w-3.5 text-success" /> : <Circle className="h-3.5 w-3.5 text-line" />}
                <span className={done ? "text-muted line-through" : "text-ink"}>{t}</span>
              </p>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-line bg-white p-2.5">
            <div className="flex h-12 w-16 shrink-0 items-end justify-center gap-1">
              {[["#b42318", 70], ["#c6a15b", 90], ["#2f7d5b", 40], ["#1f4f8b", 55]].map(([c, h]) => (
                <span key={c} className="w-2.5 rounded-t" style={{ background: c as string, height: `${h}%` }} />
              ))}
            </div>
            <div>
              <p className="text-[9px] font-semibold tracking-widest text-gold uppercase">Profil DISC</p>
              <p className="text-sm font-bold text-heading">I · Si Penyemangat</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function Home() {
  const [features, settings, testimonials] = await Promise.all([getFeatures(), getSettings(), listTestimonials()]);
  const monthly = Number(settings.plus_price_monthly) || 0;
  const yearly = Number(settings.plus_price_yearly) || 0;
  const save = monthly && yearly ? Math.round((1 - yearly / (monthly * 12)) * 100) : 0;
  const perMonth = yearly ? Math.round(yearly / 12 / 100) * 100 : 0;
  const mentoringHref = contactHref(String(settings.upgrade_contact ?? ""), "Halo EClub, saya tertarik dengan program mentoring.");
  const cell = (limit: number | null, unit: string | null) =>
    limit === 0 ? <span className="text-line">—</span> : limit == null ? (unit ? "Tanpa batas" : <Check className="mx-auto h-4 w-4 text-success" />) : `${limit} ${unit ?? ""}`;

  return (
    <div className="min-h-dvh overflow-x-hidden">
      <header className="sticky top-0 z-30 border-b border-line/60 bg-paper/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 lg:px-10">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm font-medium text-muted md:flex">
            <a href="#fitur" className="hover:text-brand">Fitur</a>
            <a href="#metode" className="hover:text-brand">Metode</a>
            <a href="#paket" className="hover:text-brand">Paket</a>
            <a href="#faq" className="hover:text-brand">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/masuk" className="btn hidden text-heading hover:bg-white sm:inline-flex">Masuk</Link>
            <Link href="/daftar" className="btn-primary">Daftar gratis</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-14 px-5 pt-12 pb-20 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:pt-20 lg:pb-28">
        <div className="text-center lg:text-left">
          <span className="inline-flex animate-rise items-center gap-2 rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-semibold text-heading shadow-soft">
            <Sparkles className="h-3.5 w-3.5 text-gold" /> Personal Growth Companion
          </span>
          <h1 className="mt-6 animate-rise text-[42px] leading-[1.05] font-bold tracking-tight text-heading sm:text-6xl">
            Find Your Path.
            <br />
            <span className="text-brand">Build Your Success.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl animate-rise text-[17px] leading-relaxed text-muted lg:mx-0">
            Banyak orang stuck bukan karena kurang modal atau susah pemasaran, tetapi karena kehilangan <b className="text-heading">spark</b>. EClub membantu Anda menyalakannya kembali lewat cita-cita, lalu menapaki jalan bertumbuh yang jelas dan berjenjang.
          </p>
          <div className="mt-8 flex animate-rise flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Link href="/daftar" className="btn-primary px-7 py-3.5 text-[15px]">
              Mulai gratis <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#fitur" className="btn-ghost px-7 py-3.5 text-[15px]">Lihat fitur</a>
          </div>
          <p className="mt-4 animate-rise text-xs text-muted">Gratis selamanya untuk fitur inti. Tanpa kartu kredit. Cukup 5 menit sehari.</p>
          <dl className="mx-auto mt-12 grid max-w-md grid-cols-3 gap-4 border-t border-line pt-6 lg:mx-0">
            {[
              ["4", "fase SEF"],
              ["8", "dimensi entrepreneur"],
              ["100%", "bisa dipakai di HP"],
            ].map(([n, l]) => (
              <div key={l}>
                <dt className="text-2xl font-bold text-heading">{n}</dt>
                <dd className="text-xs text-muted">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
        <PhoneMockup />
      </section>

      {/* Segmen */}
      <section className="border-y border-line bg-white py-10">
        <div className="mx-auto max-w-6xl px-5 text-center lg:px-10">
          <p className="text-sm font-medium text-muted">Dirancang untuk setiap tahap kehidupan dan karier</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {SEGMENTS.map((s) => (
              <span key={s} className="rounded-full border border-line bg-paper px-4 py-2 text-sm font-semibold text-heading">{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Masalah -> solusi */}
      <section className="mx-auto max-w-6xl px-5 pt-20 lg:px-10 lg:pt-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Apakah ini Anda?</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-heading sm:text-4xl">Yang hilang bukan modal. Yang hilang adalah spark.</h2>
          <p className="mt-4 text-[17px] leading-relaxed text-muted">
            Banyak pelaku usaha merasa jalan di tempat, bahkan menurun. Saat ditelusuri, akarnya sering bukan akses modal atau pemasaran, melainkan hilangnya gairah dan cita-cita. Karena itu EClub memulai dari Anda.
          </p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {PAINS.map(({ pain, gain }) => (
            <div key={pain} className="card p-6">
              <p className="text-[15px] font-semibold text-heading">“{pain}”</p>
              <p className="mt-3 flex gap-2 text-sm leading-relaxed text-muted">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {gain}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Filosofi */}
      <section className="mx-auto max-w-4xl px-5 py-20 text-center lg:py-28">
        <p className="eyebrow">Filosofi kami</p>
        <blockquote className="mt-5 text-3xl leading-tight font-bold tracking-tight text-heading sm:text-[40px]">
          “Entrepreneurnya dulu, <span className="text-brand">bisnis hanya kendaraan.</span>”
        </blockquote>
        <p className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-muted">
          Tidak semua orang harus menjadi pengusaha untuk sukses. EClub tidak memulai dari strategi bisnis, tetapi dari Anda: apa arti sukses bagi Anda, apa potensi Anda, lalu kendaraan apa yang paling tepat. Bisa karier, freelance, bisnis, investasi, atau gabungannya.
        </p>
      </section>

      {/* Fitur */}
      <section id="fitur" className="scroll-mt-20 bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-5 lg:px-10">
          <div className="max-w-2xl">
            <p className="eyebrow">Fitur</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-heading sm:text-4xl">Semua yang Anda butuhkan untuk bertumbuh, dalam satu aplikasi</h2>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc, soon }) => (
              <div key={title} className="group rounded-2xl border border-line bg-paper p-6 transition hover:-translate-y-1 hover:bg-white hover:shadow-lift">
                <div className="flex items-center justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand text-white transition group-hover:scale-105">
                    <Icon className="h-5 w-5" />
                  </div>
                  {soon && <span className="rounded-full bg-gold-soft px-2.5 py-1 text-[11px] font-semibold text-brand">Segera</span>}
                </div>
                <h3 className="mt-5 text-lg font-bold text-heading">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Metode: Sustainable Entrepreneur Framework */}
      <section id="metode" className="scroll-mt-20 bg-brand py-20 text-white lg:py-28">
        <div className="relative mx-auto max-w-6xl px-5 lg:px-10">
          <div className="pointer-events-none absolute -top-20 right-0 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
          <p className="eyebrow">Metode EClub</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">Sustainable Entrepreneur Framework</h2>
          <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-white/75">
            Satu jalan yang jelas, dari menyalakan spark hingga menebar dampak. Semua kelas dan alat di EClub mengikuti urutan ini, berjenjang, supaya Anda tahu persis langkah berikutnya.
          </p>

          <div className="mt-12 flex items-start gap-4 rounded-3xl bg-gold p-6 text-brand-deep sm:p-7">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand text-white">
              <Flame className="h-6 w-6 text-gold" />
            </span>
            <div>
              <p className="text-xs font-bold tracking-wide uppercase">Langkah awal</p>
              <p className="mt-1 text-xl font-bold">{SPARK.name}: {SPARK.sub}</p>
              <p className="mt-1 text-sm leading-relaxed text-brand-deep/80">Temukan kembali cita-cita, definisi sukses, dan alasan Anda bertumbuh. Inilah bahan bakar untuk seluruh perjalanan.</p>
            </div>
          </div>

          <ol className="relative mt-4 grid gap-4 lg:grid-cols-4">
            {SEF_PHASES.map((phase, i) => (
              <li key={phase.key} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <p className="text-xs font-semibold text-white/50">Fase {i + 1}</p>
                <p className="mt-1 text-2xl font-bold text-gold">{phase.name}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{phase.desc}</p>
                <ul className="mt-5 space-y-2">
                  {SEF_STEPS.filter((st) => st.phase === phase.key).map((st) => (
                    <li key={st.key} className="flex items-center gap-2.5 rounded-xl bg-white/10 px-3 py-2.5">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold text-[11px] font-bold text-brand-deep">{st.no}</span>
                      <span className="text-sm font-semibold">{st.name}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm text-white/60">Personal Mapping → Acquisition → Systemation → Transformation → Investation. Jenjang berikutnya terbuka setelah jenjang sebelumnya selesai.</p>
        </div>
      </section>

      {/* Cara kerja */}
      <section className="mx-auto max-w-6xl px-5 py-20 lg:px-10 lg:py-28">
        <div className="text-center">
          <p className="eyebrow">Cara kerja</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-heading sm:text-4xl">Mulai dalam 5 menit</h2>
        </div>
        <ol className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            ["Daftar gratis", "Cukup nama dan email. Tidak perlu kartu kredit."],
            ["Nyalakan spark", "Tulis cita-cita dan definisi sukses Anda, lalu ubah mimpi menjadi target yang nyata."],
            ["Tapaki jenjangnya", "Petakan diri lewat tes 8 Wheel, lalu belajar dan bertindak setahap demi setahap mengikuti SEF."],
          ].map(([t, d], i) => (
            <li key={t} className="card p-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold-soft text-sm font-bold text-brand">{i + 1}</span>
              <h3 className="mt-4 text-lg font-bold text-heading">{t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      {testimonials.length > 0 && (
        <section className="bg-paper py-20 lg:py-28">
          <div className="mx-auto max-w-6xl px-5 lg:px-10">
            <div className="text-center">
              <p className="eyebrow">Cerita member</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-heading sm:text-4xl">Mereka sudah memulai perjalanannya</h2>
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <figure key={t.id} className="card flex flex-col p-6">
                  <Quote className="h-6 w-6 text-gold" />
                  <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed text-ink">{t.quote}</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    {t.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.photo_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-brand text-sm font-bold text-white">{t.name.charAt(0)}</span>
                    )}
                    <span>
                      <span className="block text-sm font-bold text-heading">{t.name}</span>
                      {t.role && <span className="block text-xs text-muted">{t.role}</span>}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Paket */}
      <section id="paket" className="scroll-mt-20 bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-5xl px-5 lg:px-10">
          <div className="text-center">
            <p className="eyebrow">Paket</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-heading sm:text-4xl">Gratis untuk memulai. Plus untuk melaju.</h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <div className="rounded-3xl border border-line bg-paper p-7">
              <p className="text-sm font-bold text-heading">EClub Free</p>
              <p className="mt-3 text-4xl font-bold text-heading">Gratis</p>
              <p className="mt-1 text-sm text-muted">Selamanya</p>
              <ul className="mt-5 space-y-2 text-sm text-ink">
                {["My Life & Tes DISC (hasil dasar)", "Daily Action & rangkaian konsisten", "1 Dream Planner", "Tes 8 Wheel setiap 3 bulan"].map((p) => (
                  <li key={p} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success" /> {p}
                  </li>
                ))}
              </ul>
              <Link href="/daftar" className="btn-ghost mt-6 w-full py-3">Daftar gratis</Link>
            </div>
            <div className="relative overflow-hidden rounded-3xl bg-brand p-7 text-white shadow-lift">
              <div className="pointer-events-none absolute -top-16 -right-10 h-48 w-48 rounded-full bg-gold/25 blur-3xl" />
              <p className="flex items-center gap-1.5 text-sm font-bold text-gold">
                <Crown className="h-4 w-4" /> EClub Plus
              </p>
              {save > 0 && <span className="absolute top-6 right-6 rounded-full bg-gold px-2.5 py-1 text-[11px] font-bold text-brand-deep">Hemat {save}%</span>}
              <p className="mt-3 text-4xl font-bold">
                {rupiah(perMonth)}
                <span className="text-base font-medium text-white/60">/bulan</span>
              </p>
              <p className="mt-1 text-sm text-white/70">
                ditagih {rupiah(yearly)} per tahun · atau {rupiah(monthly)} bulanan
              </p>
              <ul className="mt-5 space-y-2 text-sm text-white/85">
                {["Laporan lengkap DISC + rekomendasi karier", "Dream Planner tanpa batas", "Tes 8 Wheel kapan saja", "Course khusus member Plus"].map((p) => (
                  <li key={p} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-gold" /> {p}
                  </li>
                ))}
              </ul>
              <Link href="/daftar" className="btn-gold mt-6 w-full py-3">Mulai sekarang</Link>
            </div>
          </div>
          <div className="mt-8 overflow-hidden rounded-2xl border border-line">
            <table className="w-full text-left text-sm">
              <thead className="bg-paper text-xs font-semibold tracking-wide text-muted uppercase">
                <tr>
                  <th className="px-5 py-3">Fitur</th>
                  <th className="w-28 px-3 py-3 text-center sm:w-36">Free</th>
                  <th className="w-28 px-3 py-3 text-center text-brand sm:w-36">Plus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {features.map((f) => (
                  <tr key={f.key}>
                    <td className="px-5 py-3 font-medium text-heading">
                      {f.label}
                      {!f.enforced && <span className="ml-2 text-[10px] font-semibold text-muted">(segera)</span>}
                    </td>
                    <td className="px-3 py-3 text-center text-ink">{cell(f.free_limit, f.unit)}</td>
                    <td className="px-3 py-3 text-center font-semibold text-heading">{cell(f.plus_limit, f.unit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Kelas & mentoring */}
      <section className="mx-auto max-w-6xl px-5 pt-20 lg:px-10 lg:pt-28">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="card p-7">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gold-soft text-brand">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-xl font-bold text-heading">Kelas terstruktur</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">Belajar bertahap mengikuti EClub Success Framework. Sebagian gratis, sebagian khusus Plus, dan kelas lanjutan bisa dibeli satuan.</p>
            <Link href="/daftar" className="btn-ghost mt-6">Lihat kelas <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="relative overflow-hidden rounded-2xl bg-heading p-7 text-white">
            <div className="pointer-events-none absolute -right-10 -bottom-16 h-56 w-56 rounded-full bg-brand/40 blur-3xl" />
            <div className="relative grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-gold">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="relative mt-5 text-xl font-bold">Mentoring langsung</h3>
            <p className="relative mt-2 text-sm leading-relaxed text-white/70">Ingin melaju lebih cepat? Diskusikan hasil tes 8 Wheel dan rencana Anda bersama mentor EClub, lalu susun langkah 90 hari ke depan.</p>
            {mentoringHref ? (
              <a href={mentoringHref} target="_blank" rel="noopener noreferrer" className="btn-gold relative mt-6">
                <MessageCircle className="h-4 w-4" /> Tanya jadwal mentoring
              </a>
            ) : (
              <Link href="/daftar" className="btn-gold relative mt-6">Daftar dulu <ArrowRight className="h-4 w-4" /></Link>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-5 py-20 lg:py-28">
        <div className="text-center">
          <p className="eyebrow">FAQ</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-heading sm:text-4xl">Pertanyaan yang sering diajukan</h2>
        </div>
        <div className="mt-10 space-y-3">
          {FAQ.map(({ q, a }) => (
            <details key={q} className="group card p-5 open:shadow-lift">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-heading">
                {q}
                <ChevronDown className="h-5 w-5 shrink-0 text-muted transition group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-20">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-brand px-6 py-14 text-center text-white shadow-lift sm:px-12">
          <div className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-gold/25 blur-3xl" />
          <h2 className="relative text-3xl font-bold tracking-tight sm:text-4xl">Perjalanan Anda dimulai hari ini.</h2>
          <p className="relative mx-auto mt-3 max-w-lg text-white/75">One day, or day one. Anda yang memilih.</p>
          <Link href="/daftar" className="btn-gold relative mt-8 px-8 py-3.5 text-[15px]">
            Daftar gratis <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-muted sm:flex-row lg:px-10">
          <Logo />
          <div className="flex gap-6">
            <a href="#fitur" className="hover:text-brand">Fitur</a>
            <a href="#paket" className="hover:text-brand">Paket</a>
            <Link href="/masuk" className="hover:text-brand">Masuk</Link>
          </div>
          <p>© {new Date().getFullYear()} EClub Indonesia</p>
        </div>
      </footer>
    </div>
  );
}
