"use server";

import { revalidatePath } from "next/cache";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAccount, isAdmin } from "@/lib/plans";
import { describeFilters, resolveAudience, unsubToken, type BlastFilters, type Channel, type Recipient } from "@/lib/blast";
import { emailConfigured, layout, sendEmail, sendEmailBatch, textToHtml } from "@/lib/email";
import { normalizeWa, sendWa, sendWaBlast, waConfigured } from "@/lib/whatsapp";
import { provinceName, regencyName } from "@/lib/regions";

export type BlastState = { error?: string; message?: string; count?: number; sample?: string[] } | undefined;

/** Batas penerima per blasting WhatsApp, demi keamanan nomor dari blokir. */
const WA_MAX = 300;
const SITE = () => process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.eclub.co.id";

async function staff() {
  if (isDemoMode) return null;
  const account = await getAccount();
  if (!isAdmin(account.role)) return null;
  const supabase = await createClient();
  const admin = createAdminClient();
  if (!admin) return null;
  return { supabase, admin };
}

function readForm(fd: FormData) {
  const channel: Channel = fd.get("channel") === "whatsapp" ? "whatsapp" : "email";
  let filters: BlastFilters = {};
  try {
    filters = JSON.parse(String(fd.get("filters") ?? "{}")) as BlastFilters;
  } catch {}
  const subject = String(fd.get("subject") ?? "").trim().slice(0, 120);
  const message = String(fd.get("message") ?? "").trim().slice(0, 4000);
  return { channel, filters, subject, message };
}

const personalize = (text: string, name: string) => text.replace(/\{nama\}/gi, name);

function emailFor(r: Recipient, subject: string, message: string) {
  const unsub = `${SITE()}/berhenti-email?u=${r.id}&t=${unsubToken(r.id)}`;
  const body = personalize(message, r.name);
  return {
    to: r.email!,
    subject: personalize(subject, r.name),
    html: layout(personalize(subject, r.name), body.slice(0, 90), textToHtml(body), undefined, `Anda menerima email ini sebagai member EClub. <a href="${unsub}" style="color:#9a8b85;">Berhenti menerima email seperti ini</a>.`),
  };
}

const WA_FOOTER = "\n\n_Tidak ingin menerima kabar seperti ini? Matikan di menu Profil EClub._";

export async function previewBlast(_: BlastState, fd: FormData): Promise<BlastState> {
  if (isDemoMode) return { count: 12, sample: ["Budi", "Sari", "Andi"], message: "Mode demo: angka contoh." };
  const s = await staff();
  if (!s) return { error: "Hanya admin. Pastikan SQL 018 sudah dijalankan." };
  const { channel, filters } = readForm(fd);
  try {
    const list = await resolveAudience(s.supabase, s.admin, filters, channel);
    const capped = channel === "whatsapp" && list.length > WA_MAX;
    return {
      count: list.length,
      sample: list.slice(0, 8).map((r) => r.name),
      message: capped ? `Untuk keamanan nomor, satu kali blasting WA dikirim ke ${WA_MAX} orang pertama. Sisanya bisa dikirim besok.` : undefined,
    };
  } catch (e) {
    console.error("previewBlast", e);
    return { error: "Gagal menghitung penerima. Pastikan SQL 018 sudah dijalankan." };
  }
}

export async function testBlast(_: BlastState, fd: FormData): Promise<BlastState> {
  if (isDemoMode) return { error: "Mode demo: tidak bisa mengirim." };
  const s = await staff();
  if (!s) return { error: "Hanya admin." };
  const { channel, subject, message } = readForm(fd);
  if (message.length < 5) return { error: "Tulis isi pesan dulu." };
  const {
    data: { user },
  } = await s.supabase.auth.getUser();
  if (!user) return { error: "Sesi berakhir." };
  const { data: prof } = await s.admin.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
  const name = ((prof?.full_name as string) || "Admin").split(" ")[0];
  if (channel === "email") {
    if (!emailConfigured()) return { error: "RESEND_API_KEY belum diisi di Vercel (lalu Redeploy)." };
    if (!subject) return { error: "Isi judul email dulu." };
    const m = emailFor({ id: user.id, name, email: user.email ?? null, wa: null }, subject, message);
    return (await sendEmail(m.to, "[UJI] " + m.subject, m.html)) ? { message: `Email uji terkirim ke ${user.email}.` } : { error: "Gagal mengirim email uji. Periksa RESEND_API_KEY." };
  }
  if (!waConfigured()) return { error: "FONNTE_TOKEN belum diisi di Vercel." };
  const { data: st } = await s.admin.from("app_settings").select("value").eq("key", "admin_whatsapp").maybeSingle();
  const wa = normalizeWa(String((st?.value as string) ?? ""));
  if (!wa) return { error: "Isi No. WhatsApp admin di Admin > Pengaturan dulu." };
  return (await sendWa(wa, "[UJI]\n" + personalize(message, name) + WA_FOOTER)) ? { message: "Pesan uji terkirim ke WhatsApp admin." } : { error: "Gagal mengirim. Pastikan perangkat Fonnte berstatus Connected." };
}

export async function sendBlast(_: BlastState, fd: FormData): Promise<BlastState> {
  if (isDemoMode) return { error: "Mode demo: tidak bisa mengirim." };
  const s = await staff();
  if (!s) return { error: "Hanya admin." };
  const { channel, filters, subject, message } = readForm(fd);
  if (message.length < 5) return { error: "Tulis isi pesan dulu." };
  if (channel === "email" && !subject) return { error: "Isi judul email dulu." };
  if (fd.get("confirm") !== "on") return { error: "Centang kotak konfirmasi dulu." };
  if (channel === "email" && !emailConfigured()) return { error: "RESEND_API_KEY belum diisi di Vercel (lalu Redeploy)." };
  if (channel === "whatsapp" && !waConfigured()) return { error: "FONNTE_TOKEN belum diisi di Vercel." };

  let list: Recipient[];
  try {
    list = await resolveAudience(s.supabase, s.admin, filters, channel);
  } catch (e) {
    console.error("sendBlast", e);
    return { error: "Gagal menghitung penerima. Pastikan SQL 018 sudah dijalankan." };
  }
  if (!list.length) return { error: "Tidak ada penerima yang cocok dengan filter ini." };
  if (channel === "whatsapp") list = list.slice(0, WA_MAX);

  let courseTitle: string | undefined;
  if (filters.courseId) {
    const { data } = await s.admin.from("courses").select("title").eq("id", filters.courseId).maybeSingle();
    courseTitle = (data?.title as string) ?? undefined;
  }
  const summary = describeFilters(filters, { courseTitle, provinceName: provinceName(filters.province), regencyName: regencyName(filters.regency) });
  const {
    data: { user },
  } = await s.supabase.auth.getUser();
  const { data: row } = await s.admin
    .from("blasts")
    .insert({ channel, subject: channel === "email" ? subject : null, message, filters, summary, recipients: list.length, created_by: user?.id ?? null })
    .select("id")
    .single();

  let sent = 0;
  let failed = 0;
  let reason: string | undefined;
  if (channel === "email") {
    sent = await sendEmailBatch(list.map((r) => emailFor(r, subject, message)));
    failed = list.length - sent;
  } else {
    const msg = message.replace(/\{nama\}/gi, "{name}") + WA_FOOTER;
    ({ sent, failed, reason } = await sendWaBlast(list.map((r) => ({ wa: r.wa!, name: r.name })), msg));
  }
  if (row) await s.admin.from("blasts").update({ sent, failed, status: failed && !sent ? "failed" : "sent" }).eq("id", row.id);
  revalidatePath("/admin/blasting");
  if (!sent) return { error: `Gagal mengirim${reason ? ": " + reason : ""}.` };
  return {
    message:
      channel === "email"
        ? `Terkirim ke ${sent} email${failed ? `, ${failed} gagal` : ""}.`
        : `${sent} pesan masuk antrean Fonnte dan dikirim bertahap dengan jeda acak (bisa makan waktu beberapa jam).${failed ? ` ${failed} gagal${reason ? ": " + reason : ""}.` : ""}`,
  };
}

/** Berhenti / kembali menerima email blasting (dari tautan di email, tanpa login). */
export async function setEmailOptOut(fd: FormData) {
  const { checkUnsubToken } = await import("@/lib/blast");
  const id = String(fd.get("u") ?? "");
  const t = String(fd.get("t") ?? "");
  const out = fd.get("out") === "1";
  const admin = createAdminClient();
  if (!admin || !/^[0-9a-f-]{36}$/.test(id) || !checkUnsubToken(id, t)) return;
  await admin.from("profiles").update({ email_opt_out: out }).eq("id", id);
  revalidatePath("/berhenti-email");
}
