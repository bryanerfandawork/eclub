import Link from "next/link";
import { ArrowRight, CalendarCheck2, CalendarDays, MapPin, CheckCircle2, Circle, Compass, Flame, Gem, Plus, Quote } from "lucide-react";
import { getAssessmentResults, getDailyRange, getDreams, getOpenActions, getProfile, getProgressStats } from "@/lib/data";
import { compactRupiah, dreamProgress, greeting, rupiah, todayJakarta } from "@/lib/format";
import { DailyList } from "@/components/daily-list";
import { STAGES } from "@/lib/journey";
import { PLACEMENT_KEY } from "@/lib/placement";
import { getDiscResult } from "@/lib/disc/server";
import { DiscSummary } from "@/components/disc-summary";
import { ProgressBar, Ring } from "@/components/ui";
import { getFinance, monthSummary } from "@/lib/finance-server";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { motivationOfDay } from "@/lib/motivation";
import { getVapidPublicKey } from "@/lib/push";
import { PushToggle } from "@/components/push-toggle";
import { getEvents } from "@/lib/schedule";
import { myShare, refUrl } from "@/lib/share";
import { ShareRef } from "@/components/share-ref";
import { Gift } from "lucide-react";
import { getAccount } from "@/lib/plans";
import { regencyName } from "@/lib/regions";
import { getIncomeProfile } from "@/lib/income-server";
import { summarize } from "@/lib/income";
import { TrendingUp } from "lucide-react";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const today = todayJakarta();
  const [profile, dreams, actions, todayItems, stats] = await Promise.all([
    getProfile(),
    getDreams(),
    getOpenActions(4),
    getDailyRange(today, today),
    getProgressStats(),
  ]);
  const [ew, placed, disc] = await Promise.all([getAssessmentResults("8-wheel-entrepreneur", 1), getAssessmentResults(PLACEMENT_KEY, 1), getDiscResult()]);
  const [fin, vapid, events, account, share, income] = await Promise.all([getFinance(today.slice(0, 7)), isDemoMode ? null : getVapidPublicKey(), getEvents(), getAccount(), myShare(), getIncomeProfile().catch(() => null)]);
  const incomeSum = income ? summarize(income, dreams) : null;
  const nowMs = Date.now();
  const nextEvent = (events ?? []).filter((e) => new Date(e.starts_at).getTime() + e.duration_min * 60_000 > nowMs).sort((a, b) => a.starts_at.localeCompare(b.starts_at))[0];
  const eventDays = nextEvent ? Math.round((new Date(new Date(nextEvent.starts_at).toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" })).getTime() - new Date(today).getTime()) / 86_400_000) : 0;
  const eventPrice = nextEvent ? (account.plan === "plus" ? nextEvent.plus_price : nextEvent.price) : 0;
  let bioMissing = false;
  if (!isDemoMode) {
    const supabase = await createClient();
    const { data: b } = await supabase.from("profiles").select("whatsapp, birth_date, regency").eq("id", profile.id).maybeSingle();
    bioMissing = !!b && (!b.whatsapp || !b.birth_date || !b.regency);
  }
  const finBiz = monthSummary(fin.txs, "business");
  const placement = (placed[0]?.scores as unknown as { placement?: string } | undefined)?.placement;
  const ewDue = ew[0] ? Date.now() - new Date(ew[0].created_at).getTime() > 90 * 86_400_000 : false;
  const firstName = (profile.full_name || "Sahabat").split(" ")[0];
  const active = dreams.filter((d) => d.status === "active");
  const totalTarget = active.reduce((s, d) => s + (d.target_amount ?? 0), 0);
  const totalSaved = active.reduce((s, d) => s + d.saved_amount, 0);
  const overall = totalTarget ? Math.round((totalSaved / totalTarget) * 100) : 0;

  // Perkiraan posisi di Success Framework berdasarkan data yang sudah diisi.
  const steps = [
    { done: !!placement, label: "Cek posisi Anda di peta SEF (3 menit)", href: "/posisi" },
    { done: !!profile.success_definition, label: "Tuliskan definisi sukses Anda", href: "/my-life" },
    { done: !!disc, label: "Kenali kepribadian Anda (Tes DISC)", href: "/disc" },
    { done: ew.length > 0, label: "Ikuti tes 8 Wheel Entrepreneur", href: "/assessment/8-wheel-entrepreneur" },
    { done: dreams.length > 0, label: "Buat mimpi pertama Anda", href: "/goals/baru" },
    { done: !!income, label: "Isi Peta Income: lihat posisi uang Anda", href: "/income" },
    { done: stats.dailyTotal30 > 0, label: "Rencanakan aksi harian pertama", href: "/today" },
  ];
  const onboarding = steps.some((s) => !s.done);
  // 0 = Spark (definisi sukses + mimpi), 1 = Personal Mapping (tes 8 Wheel), 2 = Acquisition, dst.
  const placedIdx = STAGES.findIndex((st) => st.id === placement);
  const stageIndex = placedIdx >= 0 ? placedIdx : !profile.success_definition || dreams.length === 0 ? 0 : ew.length === 0 ? 1 : 2;

  return (
    <div className="space-y-6 lg:space-y-8">
      <section className="animate-rise">
        <p className="text-sm font-medium text-muted">{greeting()},</p>
        <h1 className="text-[28px] font-bold tracking-tight text-heading lg:text-[34px]">{firstName} 👋</h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted italic">✨ {motivationOfDay(today)}</p>
      </section>

      {nextEvent && (
        <Link href="/event" className="flex animate-rise items-center gap-4 overflow-hidden rounded-2xl border border-gold/40 bg-card p-4 shadow-soft transition hover:shadow-lift lg:p-5">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand text-center leading-none text-white">
            <span>
              <span className="block text-xl font-bold">{new Date(nextEvent.starts_at).toLocaleDateString("id-ID", { day: "numeric", timeZone: "Asia/Jakarta" })}</span>
              <span className="block text-[10px] font-semibold uppercase text-gold">{new Date(nextEvent.starts_at).toLocaleDateString("id-ID", { month: "short", timeZone: "Asia/Jakarta" })}</span>
            </span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-gold uppercase">
              <CalendarDays className="h-3.5 w-3.5" /> {eventDays <= 0 ? "Hari ini" : eventDays === 1 ? "Besok" : `${eventDays} hari lagi`} · Event terdekat
            </span>
            <span className="mt-0.5 line-clamp-2 font-bold text-heading">{nextEvent.title}</span>
            <span className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted">
              <MapPin className="h-3 w-3 shrink-0" />
              {new Date(nextEvent.starts_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" })} WIB · {nextEvent.location || regencyName(nextEvent.regency) || "Online"} · {nextEvent.registered ? "Anda terdaftar ✓" : eventPrice ? rupiah(eventPrice) : "Gratis"}
            </span>
          </span>
          <ArrowRight className="h-5 w-5 shrink-0 text-brand" />
        </Link>
      )}

      <PushToggle publicKey={vapid} variant="card" />

      {!placement && (
        <Link href="/posisi" className="flex animate-rise items-center gap-4 rounded-2xl bg-heading p-5 text-white shadow-lift hover:brightness-110">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gold text-brand-deep">
            <Compass className="h-6 w-6" />
          </span>
          <span className="flex-1">
            <span className="block font-bold">Mulai dari sini: Cek Posisi Anda</span>
            <span className="block text-sm text-white/70">10 pertanyaan singkat untuk mengetahui titik awal dan langkah yang paling tepat.</span>
          </span>
          <ArrowRight className="h-5 w-5 shrink-0 text-gold" />
        </Link>
      )}

      {ewDue && (
        <Link href="/assessment/8-wheel-entrepreneur?ulang=1" className="flex items-center justify-between gap-3 rounded-2xl border border-gold/40 bg-gold-soft px-5 py-4 text-sm font-medium text-heading hover:brightness-95">
          <span>Sudah 3 bulan sejak tes 8 Wheel Entrepreneur terakhir. Yuk ukur perkembangan Anda.</span>
          <ArrowRight className="h-4 w-4 shrink-0 text-brand" />
        </Link>
      )}

      <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
        {/* Kartu utama */}
        <section className="relative overflow-hidden rounded-3xl bg-brand p-6 text-white shadow-lift lg:col-span-2 lg:p-8">
          <div className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
          <p className="eyebrow">Perjalanan Anda</p>
          <div className="mt-3 flex items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold">
                {STAGES[stageIndex].phase} · {STAGES[stageIndex].name}
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
            <Link href={placement ? "/posisi" : "/journey"} className="btn-gold">
              {placement ? "Lihat langkah berikutnya" : "Lanjutkan perjalanan"} <ArrowRight className="h-4 w-4" />
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

      {bioMissing && (
        <Link href="/profile#data-diri" className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-white px-5 py-4 text-sm font-medium text-heading hover:border-gold">
          <span>🎁 Lengkapi nomor WhatsApp, tanggal lahir & kota Anda: dapatkan hadiah ulang tahun dan kabar event EClub di kota Anda.</span>
          <ArrowRight className="h-4 w-4 shrink-0 text-brand" />
        </Link>
      )}

      <Link href="/target" className="flex items-center gap-4 rounded-2xl border border-gold/40 bg-gold-soft p-5 transition hover:brightness-95">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-2xl">🎯</span>
        <span className="flex-1">
          <span className="block font-bold text-heading">Peta Target Harian</span>
          <span className="block text-sm text-muted">Mimpi Anda butuh berapa per hari, dan berapa produk yang harus terjual? Hitung dalam 1 menit.</span>
        </span>
        <ArrowRight className="h-5 w-5 shrink-0 text-brand" />
      </Link>

      <Link href="/keuangan" className="card flex flex-wrap items-center gap-4 p-5 transition hover:border-gold lg:flex-nowrap">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gold-soft text-2xl">💰</span>
        {fin.hasAny ? (
          <>
            <span className="min-w-[40%] flex-1">
              <span className="block text-xs text-muted">Dompet Pribadi</span>
              <span className="block font-bold text-heading">{compactRupiah(Math.max(0, fin.balances.personal))}</span>
            </span>
            <span className="min-w-[40%] flex-1">
              <span className="block text-xs text-muted">Dompet Usaha</span>
              <span className="block font-bold text-heading">{compactRupiah(Math.max(0, fin.balances.business))}</span>
            </span>
            <span className="flex-1 text-xs text-muted">
              Usaha bulan ini: <b className="text-success">+{compactRupiah(finBiz.income)}</b> / <b className="text-brand">−{compactRupiah(finBiz.expense)}</b>
            </span>
          </>
        ) : (
          <span className="flex-1">
            <span className="block font-bold text-heading">Rapikan uang pribadi & usaha</span>
            <span className="block text-sm text-muted">Catat masuk-keluar dalam 5 detik, tidak tercampur lagi.</span>
          </span>
        )}
        <ArrowRight className="h-5 w-5 shrink-0 text-brand" />
      </Link>

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

        <DiscSummary result={disc?.result ?? null} />

        {profile.success_definition ? (
          <section className="card flex gap-4 p-6">
            <Quote className="h-6 w-6 shrink-0 text-gold" />
            <div>
              <p className="eyebrow">Definisi sukses saya</p>
              <p className="mt-1.5 line-clamp-4 text-[15px] leading-relaxed text-ink">{profile.success_definition}</p>
            </div>
          </section>
        ) : (
          <Link href="/my-life" className="card flex gap-4 p-6 hover:shadow-lift">
            <Quote className="h-6 w-6 shrink-0 text-gold" />
            <div>
              <p className="eyebrow">Definisi sukses saya</p>
              <p className="mt-1.5 text-sm text-muted">Apa arti sukses bagi Anda? Tuliskan di sini.</p>
            </div>
          </Link>
        )}
      </div>

      <Link href="/income" className="group flex items-center gap-4 rounded-2xl border border-line bg-white p-5 shadow-soft transition hover:border-gold lg:p-6">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand text-white">
          <TrendingUp className="h-6 w-6" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="eyebrow block">Peta Income</span>
          {incomeSum ? (
            <>
              <b className="mt-0.5 block text-heading">{incomeSum.stage.label}</b>
              <span className="block text-sm text-muted">
                Sisa uang {rupiah(incomeSum.surplus)}/bulan
                {incomeSum.gap > 0 ? ` · kurang ${rupiah(incomeSum.gap)}/bulan untuk mimpi` : incomeSum.need > 0 ? " · cukup untuk mimpi ✓" : ""}
              </span>
            </>
          ) : (
            <>
              <b className="mt-0.5 block text-heading">Active, massive, atau passive income: Anda di mana?</b>
              <span className="block text-sm text-muted">Isi 5 menit, langsung tahu sisa uang, posisi SEF, dan kapan mimpi tercapai.</span>
            </>
          )}
        </span>
        <ArrowRight className="h-5 w-5 shrink-0 text-brand transition group-hover:translate-x-0.5" />
      </Link>

      {share.eligible && share.code ? (
        <section className="relative overflow-hidden rounded-2xl border border-gold/50 bg-gold-soft/50 p-5 lg:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="flex-1">
              <p className="flex items-center gap-2 font-bold text-heading">
                <Gift className="h-5 w-5 text-brand" /> Ajak teman, dapat komisi {share.rate}%
              </p>
              <p className="mt-1 text-sm text-ink">
                Kode Anda <b className="tracking-wider">{share.code}</b>. Teman hemat {share.discount}%, Anda dapat {share.rate}% dari setiap pembelian mereka.{" "}
                <Link href="/affiliate" className="font-semibold text-brand">Link kelas & event ›</Link>
              </p>
            </div>
            <ShareRef url={refUrl("/", share.code)} text={`Aku pakai EClub buat menata mimpi, keuangan, dan belajar bisnis step by step. Coba gratis ya. Pakai kode *${share.code}* biar hemat ${share.discount}% kalau upgrade:`} compact />
          </div>
        </section>
      ) : (
        <Link href="/affiliate" className="flex items-center gap-4 rounded-2xl border border-dashed border-gold/60 p-5 transition hover:bg-gold-soft/40">
          <Gift className="h-6 w-6 shrink-0 text-brand" />
          <span className="flex-1 text-sm">
            <b className="block text-heading">Dapat penghasilan dari EClub</b>
            <span className="text-muted">Member Plus mendapat komisi {share.rate}% setiap teman yang bergabung lewat link mereka.</span>
          </span>
          <ArrowRight className="h-5 w-5 shrink-0 text-brand" />
        </Link>
      )}
    </div>
  );
}
