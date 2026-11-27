import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Circle, Gem, Plus, Quote } from "lucide-react";
import { getAssessmentResults, getDreams, getOpenActions, getProfile, getProgressStats } from "@/lib/data";
import { compactRupiah, dreamProgress, greeting, rupiah, todayJakarta } from "@/lib/format";
import { AssistantHome } from "@/components/assistant-home";
import { getJourney } from "@/lib/steps-server";
import { getMe } from "@/lib/me";
import { JourneyCard, JourneyMini } from "@/components/journey-card";
import { PLACEMENT_KEY } from "@/lib/placement";
import { getDiscResult } from "@/lib/disc/server";
import { DiscSummary } from "@/components/disc-summary";
import { ProgressBar } from "@/components/ui";
import { getFinance, monthSummary } from "@/lib/finance-server";
import { isDemoMode } from "@/lib/supabase/config";
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
import { getTeamState } from "@/lib/team";
import { TeamCard } from "@/components/team/team-card";
import { WorkHome } from "@/components/team/work-home";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ selesai?: string }> }) {
  const justDone = (await searchParams).selesai === "1";
  const today = todayJakarta();
  // Member dari undangan tim yang belum menulis mimpi: Home sederhana (target harian & pekerjaan saja).
  const team = await getTeamState();
  if (team.simple) return <WorkHome />;
  // Semua data diambil bersamaan (bukan satu per satu) supaya Home cepat terbuka.
  const [profile, dreams, actions, stats, ew, , disc, fin, vapid, events, account, share, income, journey, me] = await Promise.all([
    getProfile(),
    getDreams(),
    getOpenActions(4),
    getProgressStats(),
    getAssessmentResults("8-wheel-entrepreneur", 1),
    getAssessmentResults(PLACEMENT_KEY, 1),
    getDiscResult(),
    getFinance(today.slice(0, 7)),
    isDemoMode ? null : getVapidPublicKey(),
    getEvents(),
    getAccount(),
    myShare(),
    getIncomeProfile().catch(() => null),
    getJourney(),
    isDemoMode ? null : getMe(),
  ]);
  const incomeSum = income ? summarize(income, dreams) : null;
  const nowMs = Date.now();
  const nextEvent = (events ?? []).filter((e) => new Date(e.starts_at).getTime() + e.duration_min * 60_000 > nowMs).sort((a, b) => a.starts_at.localeCompare(b.starts_at))[0];
  const eventDays = nextEvent ? Math.round((new Date(new Date(nextEvent.starts_at).toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" })).getTime() - new Date(today).getTime()) / 86_400_000) : 0;
  const eventPrice = nextEvent ? (account.plan === "plus" ? nextEvent.plus_price : nextEvent.price) : 0;
  const b = me?.row;
  const bioMissing = !!b && (!b.whatsapp || !b.birth_date || !b.regency);
  const finBiz = monthSummary(fin.txs, "business");
  const ewDue = ew[0] ? Date.now() - new Date(ew[0].created_at).getTime() > 90 * 86_400_000 : false;
  const firstName = (profile.full_name || "Sahabat").split(" ")[0];
  const active = dreams.filter((d) => d.status === "active");


  return (
    <div className="space-y-6 lg:space-y-8">
      <section className="animate-rise">
        <p className="text-sm font-medium text-muted">{greeting()},</p>
        <h1 className="text-[28px] font-bold tracking-tight text-heading lg:text-[34px]">{firstName} 👋</h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted italic">✨ {motivationOfDay(today)}</p>
      </section>

      {justDone && journey.setupDone && (
        <section className="animate-rise rounded-2xl border border-gold/50 bg-gold-soft p-4 text-sm text-heading">
          <b>🎉 Selamat, perjalanan 5 langkah Anda selesai!</b> Mulai sekarang Home fokus pada ritual harian Anda: lapor keuangan, checklist rencana aksi, dan syukur. Cukup 3 menit sehari.
        </section>
      )}

      {!journey.setupDone && <JourneyCard j={journey} />}

      <AssistantHome streak={stats.streak} hero={journey.setupDone} />

      {/* Mimpi tampil di Home (menu Goals di HP digabung ke sini & ke Hari ini). */}
      <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
        {/* Mimpi */}
        <section className="lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-heading">Mimpi saya</h3>
            <span className="flex items-center gap-3">
              <Link href="/goals/baru" className="hidden items-center gap-1 text-sm font-semibold text-brand sm:inline-flex">
                <Plus className="h-4 w-4" /> Mimpi baru
              </Link>
              <Link href="/goals" className="text-sm font-semibold text-heading/70 hover:text-heading">
                Lihat semua ›
              </Link>
            </span>
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
            <div className="-mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4 sm:px-0">
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

      <TeamCard />

      <PushToggle publicKey={vapid} variant="card" />

      {ewDue && (
        <Link href="/assessment/8-wheel-entrepreneur?ulang=1" className="flex items-center justify-between gap-3 rounded-2xl border border-gold/40 bg-gold-soft px-5 py-4 text-sm font-medium text-heading hover:brightness-95">
          <span>Sudah 3 bulan sejak tes 8 Wheel Entrepreneur terakhir. Yuk ukur perkembangan Anda.</span>
          <ArrowRight className="h-4 w-4 shrink-0 text-brand" />
        </Link>
      )}

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

      {bioMissing && (
        <Link href="/profile#data-diri" className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-white px-5 py-4 text-sm font-medium text-heading hover:border-gold">
          <span>🎁 Lengkapi nomor WhatsApp, tanggal lahir & kota Anda: dapatkan hadiah ulang tahun dan kabar event EClub di kota Anda.</span>
          <ArrowRight className="h-4 w-4 shrink-0 text-brand" />
        </Link>
      )}

      <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
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

      <section>
        <div className="mb-3 flex items-end justify-between gap-2">
          <div>
            <h2 className="font-bold text-heading">Uang & rencana</h2>
            <p className="text-xs text-muted">Kondisi sekarang → rencana income → target harian. Ketiganya saling terhubung.</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <Link href="/income" className="card group flex flex-col p-5 transition hover:border-gold">
            <span className="flex items-center gap-2 text-[11px] font-semibold tracking-wide text-gold uppercase">
              <TrendingUp className="h-3.5 w-3.5" /> Langkah 2 · Peta Income
            </span>
            {incomeSum ? (
              <>
                <b className="mt-1.5 block leading-snug text-heading">{incomeSum.stage.label}</b>
                <span className="mt-1 block text-sm text-muted">
                  Sisa {rupiah(incomeSum.surplus)}/bulan{incomeSum.gap > 0 ? ` · kurang ${rupiah(incomeSum.gap)} untuk mimpi` : incomeSum.need > 0 ? " · cukup untuk mimpi ✓" : ""}
                </span>
              </>
            ) : (
              <>
                <b className="mt-1.5 block leading-snug text-heading">Active, massive, atau passive income?</b>
                <span className="mt-1 block text-sm text-muted">Isi 5 menit: sisa uang, posisi SEF, dan kapan mimpi tercapai.</span>
              </>
            )}
            <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-semibold text-brand">
              {incomeSum ? "Perbarui" : "Isi sekarang"} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
          <Link href="/keuangan" className="card group flex flex-col p-5 transition hover:border-gold">
            <span className="text-[11px] font-semibold tracking-wide text-gold uppercase">💰 Langkah 2 · Uang pribadi & usaha</span>
            {fin.hasAny ? (
              <>
                <span className="mt-1.5 grid grid-cols-2 gap-2">
                  <span>
                    <span className="block text-xs text-muted">Pribadi</span>
                    <b className="block text-heading">{compactRupiah(Math.max(0, fin.balances.personal))}</b>
                  </span>
                  <span>
                    <span className="block text-xs text-muted">Usaha</span>
                    <b className="block text-heading">{compactRupiah(Math.max(0, fin.balances.business))}</b>
                  </span>
                </span>
                <span className="mt-1.5 block text-xs text-muted">
                  Usaha bulan ini: <b className="text-success">+{compactRupiah(finBiz.income)}</b> / <b className="text-brand">−{compactRupiah(finBiz.expense)}</b>
                </span>
              </>
            ) : (
              <>
                <b className="mt-1.5 block leading-snug text-heading">Rapikan uang pribadi & usaha</b>
                <span className="mt-1 block text-sm text-muted">Catat masuk-keluar 5 detik. Angkanya otomatis membantu Peta Income.</span>
              </>
            )}
            <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-semibold text-brand">
              Catat <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
          <Link href="/target" className="group flex flex-col rounded-2xl border border-gold/40 bg-gold-soft p-5 transition hover:brightness-95">
            <span className="text-[11px] font-semibold tracking-wide text-brand uppercase">🎯 Langkah 4 · Target harian</span>
            <b className="mt-1.5 block leading-snug text-heading">Mimpi Anda butuh berapa per hari?</b>
            <span className="mt-1 block text-sm text-muted">Pecah mimpi jadi tabungan dan jualan harian, dalam 1 menit.</span>
            <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-semibold text-brand">
              Hitung <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>
      </section>

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

      {journey.setupDone && <JourneyMini />}
    </div>
  );
}
