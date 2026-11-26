import Link from "next/link";
import { ArrowRight, CalendarCheck2, FolderKanban, Sprout } from "lucide-react";
import { TaskRow } from "./task-row";
import { ProgressBar } from "@/components/ui";
import { PushToggle } from "@/components/push-toggle";
import { getMyTeamTasks, getMyWorkspaces, getMyInvites, ROLE_LABEL } from "@/lib/team";
import { getDailyRange, getProfile } from "@/lib/data";
import { getVapidPublicKey } from "@/lib/push";
import { statusOf } from "@/lib/assistant";
import { greeting, todayJakarta } from "@/lib/format";

/**
 * Home sederhana untuk member yang masuk lewat undangan tim: hanya target harian & pekerjaan,
 * plus ajakan lembut mengenal 5 langkah EClub. Berganti ke Home lengkap setelah ia menulis mimpi pertama.
 */
export async function WorkHome() {
  const today = todayJakarta();
  const [profile, tasks, list, invites, plans, vapid] = await Promise.all([getProfile(), getMyTeamTasks(today, todayJakarta(1)), getMyWorkspaces(), getMyInvites(), getDailyRange(today, today), getVapidPublicKey()]);
  const now = tasks.filter((t) => t.plan_date <= today);
  const done = now.filter((t) => t.status === "done").length;
  const mine = plans.filter((a) => statusOf(a) !== "closed");
  const mineDone = mine.filter((a) => statusOf(a) === "done").length;
  const firstName = (profile.full_name || "Sahabat").split(" ")[0];
  return (
    <div className="space-y-6 lg:space-y-8">
      <section className="animate-rise">
        <p className="text-sm font-medium text-muted">{greeting()},</p>
        <h1 className="text-[28px] font-bold tracking-tight text-heading lg:text-[34px]">{firstName} 👋</h1>
        <p className="mt-2 text-[15px] text-muted">Ini target kerja Anda hari ini.</p>
      </section>

      {invites.length > 0 && (
        <Link href="/tim" className="flex items-center justify-between gap-3 rounded-2xl border border-gold/50 bg-gold-soft px-5 py-4 text-sm font-semibold text-heading">
          <span>📩 Ada {invites.length} undangan tim menunggu jawaban Anda.</span>
          <ArrowRight className="h-4 w-4 shrink-0 text-brand" />
        </Link>
      )}

      <div className="grid gap-5 lg:grid-cols-5 lg:gap-6">
        <section className="card p-5 lg:col-span-3 lg:p-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-bold text-heading">
              <FolderKanban className="h-5 w-5 text-brand" /> Target harian
            </h2>
            <span className="text-xs font-medium text-muted">
              {done}/{now.length} tugas tim selesai
            </span>
          </div>
          {now.length > 0 && (
            <div className="mt-3">
              <ProgressBar value={Math.round((done / now.length) * 100)} tone="brand" />
            </div>
          )}
          {now.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Belum ada tugas tim untuk hari ini. Tugas baru akan muncul di sini, dan Anda mendapat notifikasi di HP.</p>
          ) : (
            <ul className="mt-1 divide-y divide-line">
              {now.map((t) => (
                <TaskRow key={t.id} t={t} today={today} canAct label={t.ws_name} comments={t.comments} />
              ))}
            </ul>
          )}
          <Link href="/today" className="mt-4 flex items-center gap-3 rounded-xl bg-paper p-3 text-sm hover:bg-gold-soft/50">
            <CalendarCheck2 className="h-5 w-5 text-brand" />
            <span className="flex-1">
              <b className="block text-heading">Rencana pribadi hari ini</b>
              <span className="text-muted">{mine.length ? `${mineDone}/${mine.length} selesai` : "Tambahkan hal penting lain yang mau Anda kerjakan"}</span>
            </span>
            <ArrowRight className="h-4 w-4 text-muted" />
          </Link>
        </section>

        <aside className="space-y-5 lg:col-span-2">
          <section className="card p-5">
            <h2 className="font-bold text-heading">Ruang kerja saya</h2>
            <ul className="mt-2 space-y-2">
              {list
                .filter((w) => !w.archived)
                .map((w) => (
                  <li key={w.id}>
                    <Link href={`/tim/${w.id}`} className="flex items-center gap-3 rounded-xl border border-line p-3 text-sm hover:border-gold">
                      <span className="text-lg">{w.kind === "project" ? "🎯" : "🏢"}</span>
                      <span className="min-w-0 flex-1">
                        <b className="block truncate text-heading">{w.name}</b>
                        <span className="text-xs text-muted">
                          {ROLE_LABEL[w.role]} · {w.mine} tugas untuk saya
                        </span>
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted" />
                    </Link>
                  </li>
                ))}
              {list.length === 0 && <li className="text-sm text-muted">Belum tergabung di ruang kerja mana pun.</li>}
            </ul>
          </section>

          <Link href="/journey" className="block rounded-2xl border border-gold/50 bg-gold-soft p-5 transition hover:brightness-95">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-brand">
              <Sprout className="h-5 w-5" />
            </span>
            <b className="mt-3 block text-heading">Di sini juga bisa bantu Anda menyusun masa depan lho 🌱</b>
            <span className="mt-1 block text-sm text-muted">
              EClub bukan cuma untuk tugas kerja. Tulis mimpi Anda, rapikan uang pribadi, lalu ubah jadi rencana harian. Ada 5 langkah sederhana, bisa dicoba pelan-pelan kapan saja.
            </span>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand">
              Lihat 5 langkahnya <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </aside>
      </div>

      <PushToggle publicKey={vapid} variant="card" />
    </div>
  );
}
