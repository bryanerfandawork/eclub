import { PromoBadge } from "@/components/promo-badge";
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
  Crosshair,
  Wallet,
  MessagesSquare,
  CalendarDays,
  MapPin,
  Repeat,
  HandCoins,
  Building2,
  Gift,
} from "lucide-react";
import { DreamCalc } from "@/components/landing/dream-calc";
import { InquiryForm } from "@/components/landing/inquiry-form";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { regencyName } from "@/lib/regions";
import { Logo } from "@/components/logo";
import { SEF_PHASES, SEF_STEPS, SPARK } from "@/lib/sef";
import { getFeatures, getSettings } from "@/lib/plans";
import { listTestimonials } from "@/lib/testimonials";
import { rupiah } from "@/lib/format";
import { SEGMENTS } from "@/lib/types";
import { assistantConfig } from "@/lib/assistant-config";
import { PROVIDERS } from "@/lib/pockets";
import { PocketBadge } from "@/components/finance/pocket-badge";

export const dynamic = "force-dynamic";

const FEATURES: { icon: typeof Heart; title: string; desc: string; tag?: string }[] = [
  { icon: Radar, title: "Cek Posisi SEF", desc: "Jawab beberapa pertanyaan singkat, lalu lihat Anda sedang di tahap mana dan apa langkah paling tepat berikutnya.", tag: "Mulai di sini" },
  { icon: Repeat, title: "Peta Income", desc: "Petakan penghasilan aktif, masif, dan pasif Anda, lalu hitung jarak ke mimpi. Cocok untuk karyawan, pelajar, freelancer, maupun pemilik usaha." },
  { icon: Crosshair, title: "Target Jualan Harian", desc: "Mimpi Rp60 juta dalam 5 tahun? Sistem menghitung tabungan per hari dan berapa produk yang harus terjual setiap hari." },
  { icon: Wallet, title: "Kantong & Tabungan Mimpi", desc: "Uang pribadi dan usaha terpisah per kantong (tunai, bank, e-wallet). Sisihkan uang untuk mimpi, lengkap dengan HPP dan laba rugi bulanan.", tag: "Baru" },
  { icon: Gem, title: "Dream Planner", desc: "Ubah mimpi menjadi angka, tanggal, dan tabungan yang jelas. Lihat progresnya bergerak setiap kali Anda menabung." },
  { icon: CalendarCheck2, title: "Asisten Harian", desc: "Pekerjaan rutin dan kebiasaan Anda terhubung ke mimpi. Setiap hari laporkan rencana aksi: selesai, lanjut besok, atau tutup. Malam hari diingatkan, Minggu dapat Rapor Mingguan.", tag: "Baru" },
  { icon: Heart, title: "Potensi Diri & Tes Gaya Diri", desc: "Kenali bekal Anda: minat, bakat, passion, Personal SWOT, Peta Aset, Tes Gaya Diri, dan 8 Wheel Entrepreneur." },
  { icon: BookOpen, title: "Kelas Berjenjang", desc: "Kelas video mengikuti tahapan SEF, dari Personal Mapping hingga Investation. Lulus satu tahap, dapat sertifikat." },
  { icon: Users, title: "Mentoring & Event", desc: "Pesan sesi 1-on-1 dengan mentor dan ikuti workshop atau webinar. Event di kota Anda akan dikabarkan lewat WhatsApp." },
  { icon: MessagesSquare, title: "Komunitas", desc: "Berbagi progres, bertanya, dan saling menyemangati dengan sesama member yang sedang bertumbuh." },
  { icon: Sparkles, title: "AI Companion", desc: "Teman diskusi 24 jam yang memahami mimpi, posisi SEF, dan hasil tes Anda untuk menyusun rencana dan evaluasi." },
  { icon: HandCoins, title: "Affiliate & Kupon", desc: "Member Plus punya link dan kode kupon sendiri. Teman dapat potongan, Anda dapat bagi hasil dari setiap transaksi." },
];

const PAINS = [
  { pain: "Sibuk setiap hari, tapi tidak yakin sedang menuju ke mana.", gain: "My Life membantu Anda merumuskan definisi sukses dan visi 10 tahun, jadi setiap langkah punya arah." },
  { pain: "Punya banyak mimpi, tapi selalu tertunda karena tidak tahu mulai dari mana.", gain: "Dream Planner mengubah mimpi menjadi angka, tanggal, dan tabungan bulanan yang jelas." },
  { pain: "Semangat di awal, lalu hilang setelah seminggu.", gain: "Asisten Harian mengingatkan pekerjaan dan kebiasaan Anda, lalu merangkum kemajuan setiap hari dan setiap minggu." },
  { pain: "Sudah jualan, tapi tidak tahu sebenarnya untung berapa per produk.", gain: "Kalkulator HPP dan Target Harian menunjukkan untung per produk dan berapa yang harus terjual setiap hari." },
];


const FAQ = [
  { q: "Apakah EClub hanya untuk pengusaha?", a: "Tidak. EClub untuk siapa saja yang ingin bertumbuh: pelajar, karyawan, profesional, freelancer, maupun pemilik bisnis. Setiap orang punya definisi sukses dan kendaraan yang berbeda." },
  { q: "Apakah versi gratis benar-benar bisa dipakai?", a: "Ya, gratis selamanya: seluruh Perjalanan 5 Langkah, Cek Posisi, Peta Income, Target Jualan Harian, kalkulator HPP untuk 3 produk, catatan keuangan, Dream Planner, Asisten Harian (3 rencana aksi baru per hari, kebiasaan tidak dihitung), jurnal syukur, komunitas, dan Tes Gaya Diri (hasil dasar). Plus membuka rencana aksi tanpa batas, laporan lengkap, ide income personal, kelas Plus, dan harga mentoring khusus." },
  { q: "Apakah uang saya disimpan di EClub?", a: "Tidak. EClub hanya mencatat: uang Anda tetap di dompet, rekening, atau e-wallet Anda sendiri. Kantong dan tabungan mimpi membantu Anda tahu persis berapa uang di setiap tempat dan untuk apa." },
  { q: "Bagaimana cara kerja affiliate?", a: "Setiap member Plus otomatis punya link dan kode kupon pribadi. Teman yang memakai kupon mendapat potongan, dan Anda mendapat bagi hasil dari setiap transaksinya. Saldo bisa dicairkan setiap kelipatan Rp100.000." },
  { q: "Apakah EClub bisa mengisi pelatihan di kantor atau komunitas kami?", a: "Bisa. Kami menerima in-house training, workshop, undangan pembicara, dan kemitraan. Isi formulir di bagian Kolaborasi, tim kami akan menghubungi lewat WhatsApp." },
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
            <p className="text-[9px] font-semibold tracking-widest text-gold uppercase">Perjalanan 5 Langkah</p>
            <p className="mt-1 text-sm font-bold">Langkah 4 · Action Plan</p>
            <div className="mt-2.5 flex gap-1">
              {[1, 1, 1, 0, 0].map((on, i) => (
                <span key={i} className={`h-1 flex-1 rounded-full ${on ? "bg-gold" : "bg-white/20"}`} />
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-white p-3">
            <p className="text-[11px] font-bold text-heading">Ritual harian · 1/3</p>
            {[
              ["Lapor keuangan", true],
              ["Rencana & kebiasaan", false],
              ["Syukur harian", false],
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
              <p className="text-[9px] font-semibold tracking-widest text-gold uppercase">Gaya Diri</p>
              <p className="text-sm font-bold text-heading">Si Penyemangat</p>
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
  const rate = Number(settings.affiliate_rate) || 20;
  const highlights = assistantConfig(settings).highlights;
  const couponOff = Number(settings.coupon_discount) || 10;
  type PubEvent = { id: string; title: string; speaker: string | null; starts_at: string; price: number; plus_price: number; regency: string | null; location: string | null };
  let events: PubEvent[] = [];
  if (!isDemoMode) {
    const supabase = await createClient();
    const { data } = await supabase.rpc("public_events");
    events = (data as PubEvent[] | null) ?? [];
  }
  const tgl = (iso: string) =>
    new Date(iso).toLocaleString("id-ID", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
  const cell = (limit: number | null, unit: string | null) =>
    limit === 0 ? <span className="text-line">—</span> : limit == null ? (unit ? "Tanpa batas" : <Check className="mx-auto h-4 w-4 text-success" />) : `${limit} ${unit ?? ""}`;

  return (
    <div className="min-h-dvh overflow-x-hidden">
      <header className="sticky top-0 z-30 border-b border-line/60 bg-paper/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 lg:px-10">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted lg:flex">
            <a href="#fitur" className="hover:text-brand">Fitur</a>
            <a href="#hitung" className="hover:text-brand">Hitung target</a>
            <a href="#paket" className="hover:text-brand">Paket</a>
            <a href="#event" className="hover:text-brand">Event</a>
            <Link href="/artikel" className="hover:text-brand">Artikel</Link>
            <a href="#kolaborasi" className="hover:text-brand">Kolaborasi</a>
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
            Banyak orang stuck bukan karena kurang modal atau susah pemasaran, tetapi karena kehilangan <b className="text-heading">spark</b>. EClub membantu Anda menyalakannya kembali lewat cita-cita, lalu menapaki jalan yang jelas: active income, massive income, sampai passive income. Untuk pelajar, karyawan, freelancer, maupun pemilik usaha.
          </p>
          <div className="mt-8 flex animate-rise flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Link href="/daftar" className="btn-primary px-7 py-3.5 text-[15px]">
              Mulai perjalanan saya, gratis <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#hitung" className="btn-ghost px-7 py-3.5 text-[15px]">Hitung target harian</a>
          </div>
          <p className="mt-4 animate-rise text-xs text-muted">Gratis selamanya untuk fitur inti. Tanpa kartu kredit. Cukup 5 menit sehari.</p>
          <dl className="mx-auto mt-12 grid max-w-md grid-cols-3 gap-4 border-t border-line pt-6 lg:mx-0">
            {[
              ["5", "langkah perjalanan"],
              ["4", "fase SEF"],
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

      {/* Asisten harian (bisa diubah di Admin > Pengaturan) */}
      <section id="asisten" className="mx-auto max-w-6xl scroll-mt-20 px-5 pt-20 lg:px-10 lg:pt-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Setelah peta tersusun</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-heading sm:text-4xl">EClub jadi asisten pribadi Anda, setiap hari</h2>
          <p className="mt-4 text-[17px] leading-relaxed text-muted">Mimpi tidak tercapai dalam sehari, tapi dibangun dari kebiasaan kecil setiap hari. Cukup 3 menit: keuangan, rencana aksi, dan syukur.</p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((h) => (
            <div key={h.title} className="card flex flex-col p-6">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gold-soft text-2xl">{h.emoji}</span>
              <h3 className="mt-4 text-lg font-bold text-heading">{h.title}</h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">{h.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-muted">
          <span>Kantong yang bisa Anda pisahkan:</span>
          {["cash", ...PROVIDERS.filter((p) => ["bca", "bri", "mandiri", "bni", "bsi", "gopay", "ovo", "dana", "shopeepay"].includes(p.key)).map((p) => p.key)].map((k) => (
            <PocketBadge key={k} type="cash" provider={k === "cash" ? null : k} size={28} />
          ))}
          <span>dan lainnya</span>
        </div>
      </section>

      {/* Lead magnet: kalkulator mimpi */}
      <section id="hitung" className="mx-auto max-w-6xl scroll-mt-20 px-5 pt-20 lg:px-10 lg:pt-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Coba sekarang, tanpa daftar</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-heading sm:text-4xl">Mimpi Anda, berapa yang harus terjual hari ini?</h2>
          <p className="mt-4 text-[17px] leading-relaxed text-muted">
            Mimpi terasa jauh karena belum jadi angka. Masukkan mimpi dan produk Anda, lihat target harian yang bisa langsung Anda kejar mulai besok.
          </p>
        </div>
        <div className="mt-10">
          <DreamCalc />
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
            {FEATURES.map(({ icon: Icon, title, desc, tag }) => (
              <div key={title} className="group rounded-2xl border border-line bg-paper p-6 transition hover:-translate-y-1 hover:bg-white hover:shadow-lift">
                <div className="flex items-center justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand text-white transition group-hover:scale-105">
                    <Icon className="h-5 w-5" />
                  </div>
                  {tag && <span className="rounded-full bg-gold-soft px-2.5 py-1 text-[11px] font-semibold text-brand">{tag}</span>}
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
                <p className="mt-1 inline-block rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-white/80">{phase.income}</p>
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
          <p className="mt-6 text-sm text-white/60">Untuk siapa saja: pelajar, karyawan, freelancer, maupun pemilik usaha. Bangun active income dulu, tambah massive income, lalu biarkan passive income bekerja untuk mimpi Anda. Jenjang berikutnya terbuka setelah jenjang sebelumnya selesai.</p>
        </div>
      </section>

      {/* Cara kerja */}
      <section className="mx-auto max-w-6xl px-5 py-20 lg:px-10 lg:py-28">
        <div className="text-center">
          <p className="eyebrow">Cara kerja</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-heading sm:text-4xl">Perjalanan 5 Langkah</h2>
          <p className="mx-auto mt-3 max-w-2xl text-[15px] text-muted">Seperti didampingi konsultan rencana hidup: satu tombol Lanjut memandu Anda dari mimpi sampai kebiasaan harian. Setelah itu, EClub menjadi asisten harian Anda.</p>
        </div>
        <ol className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[
            ["Mimpi", "Tulis mimpi-mimpi Anda, beri angka dan tanggal, lalu rumuskan arti sukses versi Anda."],
            ["Kondisi Saat Ini", "Cek Posisi di peta SEF dan Peta Income: kesibukan, penghasilan, dan pengeluaran Anda hari ini."],
            ["Potensi Diri", "Tes Gaya Diri, minat dan bakat, Personal SWOT, serta Peta Aset. Kenali bekal Anda."],
            ["Action Plan", "Rencana income, target harian, pekerjaan rutin, dan kebiasaan yang terhubung ke mimpi."],
            ["Evaluasi Berkala", "Laporan harian, Rapor Mingguan setiap Minggu, dan tinjauan bulanan. Arah selalu terjaga."],
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
                {[
                  "Cek Posisi SEF + rekomendasi langkah",
                  "Peta Income: posisi active, massive, passive",
                  "Target Jualan Harian dari mimpi Anda",
                  "Kalkulator HPP (3 produk) & catatan keuangan",
                  "Dream Planner & Asisten Harian (3 rencana/hari)",
                  "Kantong tunai pribadi & usaha + tabung untuk mimpi",
                  "Tes Gaya Diri (hasil dasar) & 8 Wheel",
                  "Komunitas member & kelas gratis",
                ].map((p) => (
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
              <PromoBadge tone="dark" className="mt-4" />
              <ul className="mt-5 space-y-2 text-sm text-white/85">
                {[
                  "Semua fitur Free, dengan batas lebih besar",
                  "Rencana aksi harian tanpa batas",
                  "Kantong bank & e-wallet tanpa batas, grafik & ekspor Excel",
                  "Produk HPP tanpa batas & laporan laba rugi",
                  "Laporan lengkap Gaya Diri + rekomendasi karier",
                  "Rekomendasi ide income personal",
                  "Kelas khusus Plus & sertifikat tahap SEF",
                  "Harga khusus mentoring & event",
                  `Link affiliate & kupon pribadi: bagi hasil ${rate}%`,
                ].map((p) => (
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
            <h3 className="mt-5 text-xl font-bold text-heading">Kelas sesuai tahap Anda</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">Setelah Cek Posisi, EClub merekomendasikan kelas yang paling Anda butuhkan sekarang. Sebagian gratis, sebagian khusus Plus, dan kelas lanjutan bisa dibeli satuan.</p>
            <Link href="/daftar" className="btn-ghost mt-6">Lihat kelas <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="relative overflow-hidden rounded-2xl bg-heading p-7 text-white">
            <div className="pointer-events-none absolute -right-10 -bottom-16 h-56 w-56 rounded-full bg-brand/40 blur-3xl" />
            <div className="relative grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-gold">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="relative mt-5 text-xl font-bold">Mentoring 1-on-1</h3>
            <p className="relative mt-2 text-sm leading-relaxed text-white/70">Bawa hasil Cek Posisi dan target harian Anda ke mentor EClub, lalu susun langkah 90 hari ke depan. Pilih jadwal sendiri langsung di aplikasi.</p>
            <Link href="/daftar" className="btn-gold relative mt-6">
              <MessageCircle className="h-4 w-4" /> Pilih jadwal mentoring
            </Link>
          </div>
        </div>
      </section>

      {/* Event terdekat */}
      <section id="event" className="mx-auto max-w-6xl scroll-mt-20 px-5 pt-20 lg:px-10 lg:pt-28">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="eyebrow">Event terdekat</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-heading sm:text-4xl">Belajar langsung, bertemu sesama pejuang</h2>
          </div>
          <Link href="/daftar" className="btn-ghost">Daftar untuk ikut <ArrowRight className="h-4 w-4" /></Link>
        </div>
        {events.length > 0 ? (
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {events.map((e) => (
              <div key={e.id} className="card flex flex-col p-6">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-brand">
                  <CalendarDays className="h-3.5 w-3.5" /> {tgl(e.starts_at)} WIB
                </p>
                <h3 className="mt-3 text-lg font-bold text-heading">{e.title}</h3>
                {e.speaker && <p className="mt-1 text-sm text-muted">bersama {e.speaker}</p>}
                <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
                  <MapPin className="h-3.5 w-3.5" /> {e.location || (e.regency ? regencyName(e.regency) : "Online")}
                </p>
                <p className="mt-auto pt-5 text-sm font-semibold text-heading">
                  {e.price ? rupiah(e.price) : "Gratis"}
                  {e.price > 0 && e.plus_price < e.price && <span className="ml-2 text-xs font-medium text-brand">Plus {e.plus_price ? rupiah(e.plus_price) : "gratis"}</span>}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="card mt-10 flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gold-soft text-brand">
              <CalendarDays className="h-5 w-5" />
            </span>
            <p className="text-sm leading-relaxed text-muted">
              Jadwal workshop dan webinar berikutnya segera diumumkan. Daftar dan isi kota domisili Anda, kami kabari lewat WhatsApp saat ada event di kota Anda.
            </p>
          </div>
        )}
      </section>

      {/* Affiliate */}
      <section className="mx-auto max-w-6xl px-5 pt-20 lg:px-10 lg:pt-28">
        <div className="relative overflow-hidden rounded-3xl bg-gold-soft p-7 sm:p-10">
          <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="eyebrow">Affiliate EClub</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-heading sm:text-4xl">Puas? Ajak teman, dapat bagi hasil {rate}%.</h2>
              <p className="mt-4 text-[17px] leading-relaxed text-muted">
                Setiap member Plus otomatis punya link dan kode kupon pribadi. Teman Anda hemat {couponOff}%, Anda mendapat {rate}% dari setiap paket, kelas, atau mentoring yang mereka beli. Saldo bisa dicairkan setiap kelipatan Rp100.000.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Link href="/daftar" className="btn-primary">Daftar & mulai</Link>
                <Link href="/syarat-affiliate" className="text-sm font-semibold text-brand hover:underline">Baca syarat program affiliate ›</Link>
              </div>
            </div>
            <ul className="space-y-3">
              {[
                [Gift, `Teman dapat potongan ${couponOff}% dengan kupon Anda`],
                [Repeat, "Komisi juga dari pembelian berikutnya"],
                [HandCoins, "Cairkan ke rekening setiap kelipatan Rp100.000"],
              ].map(([I, t]) => {
                const Icon = I as typeof Gift;
                return (
                  <li key={t as string} className="flex items-center gap-3 rounded-2xl bg-white p-4 text-sm font-semibold text-heading shadow-soft">
                    <Icon className="h-5 w-5 shrink-0 text-brand" /> {t as string}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* Kolaborasi */}
      <section id="kolaborasi" className="mx-auto max-w-6xl scroll-mt-20 px-5 pt-20 lg:px-10 lg:pt-28">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="eyebrow">Kolaborasi</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-heading sm:text-4xl">Bawa EClub ke kantor, komunitas, atau acara Anda</h2>
            <p className="mt-4 text-[17px] leading-relaxed text-muted">
              Kami menerima in-house training untuk tim dan UMKM binaan, workshop, undangan pembicara, dan kemitraan. Materi mengikuti Sustainable Entrepreneur Framework dan disesuaikan dengan kebutuhan peserta.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-ink">
              {["In-house training perusahaan & instansi", "Workshop komunitas & UMKM binaan", "Pembicara seminar & webinar", "Kemitraan program"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-brand" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-6 sm:p-7">
            <InquiryForm />
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
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <a href="#fitur" className="hover:text-brand">Fitur</a>
            <a href="#paket" className="hover:text-brand">Paket</a>
            <a href="#kolaborasi" className="hover:text-brand">Kolaborasi</a>
            <Link href="/artikel" className="hover:text-brand">Artikel</Link>
            <Link href="/kelas" className="hover:text-brand">Kelas</Link>
            <Link href="/acara" className="hover:text-brand">Event</Link>
            <Link href="/syarat-affiliate" className="hover:text-brand">Program Affiliate</Link>
            <Link href="/cek-sertifikat" className="hover:text-brand">Cek sertifikat</Link>
            <Link href="/kebijakan-privasi" className="hover:text-brand">Privasi</Link>
            <Link href="/syarat-ketentuan" className="hover:text-brand">Syarat & Ketentuan</Link>
            <Link href="/masuk" className="hover:text-brand">Masuk</Link>
          </div>
          <p>© {new Date().getFullYear()} EClub Indonesia</p>
        </div>
      </footer>
    </div>
  );
}
