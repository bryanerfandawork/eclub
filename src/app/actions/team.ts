"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { notifyTeam } from "@/lib/team-notify";
import { todayJakarta } from "@/lib/format";
import type { FormState } from "./auth";

const DEMO = "Mode demo: data belum bisa disimpan.";
const NO_SQL = "Fitur tim belum aktif. Jalankan SQL 024 dulu.";
const str = (f: FormData, k: string, max = 200) => String(f.get(k) ?? "").trim().slice(0, max);
const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);
const isId = (v: string) => /^[0-9a-f-]{36}$/.test(v);

/** Pesan error dari database (sudah dalam bahasa Indonesia) atau pesan umum. */
function dbError(e: { message?: string; code?: string } | null, fallback: string) {
  if (!e) return fallback;
  if (e.code === "42883" || e.code === "42P01" || /does not exist|schema cache/i.test(e.message ?? "")) return NO_SQL;
  if (e.code === "P0001" && e.message) return e.message;
  return fallback;
}

async function me() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, uid: user?.id ?? "" };
}

function refresh(ws?: string) {
  revalidatePath("/tim");
  if (ws) revalidatePath(`/tim/${ws}`, "layout");
  revalidatePath("/today");
  revalidatePath("/dashboard");
}

/* ---------------- Ruang kerja ---------------- */

export async function createWorkspace(_: FormState, f: FormData): Promise<FormState> {
  if (isDemoMode) return { error: DEMO };
  const name = str(f, "name", 60);
  const kind = str(f, "kind") === "project" ? "project" : "company";
  const end = str(f, "end_date");
  if (!name) return { error: "Tulis nama perusahaan atau project-nya." };
  if (kind === "project" && end && !isDate(end)) return { error: "Tanggal selesai tidak valid." };
  const { supabase } = await me();
  const { data, error } = await supabase.rpc("ws_create", { p_name: name, p_kind: kind, p_end: end || null, p_desc: str(f, "description", 300) || null, p_dream: isId(str(f, "dream_id")) ? str(f, "dream_id") : null });
  if (error || !data) return { error: dbError(error, "Gagal membuat ruang kerja. Coba lagi.") };
  refresh();
  redirect(`/tim/${data}?tab=anggota&baru=1`);
}

export async function updateWorkspace(_: FormState, f: FormData): Promise<FormState> {
  if (isDemoMode) return { error: DEMO };
  const id = str(f, "id");
  const name = str(f, "name", 60);
  const end = str(f, "end_date");
  if (!isId(id) || !name) return { error: "Nama wajib diisi." };
  const { supabase } = await me();
  const kind = str(f, "kind") === "project" ? "project" : "company";
  const { error } = await supabase
    .from("workspaces")
    .update({ name, kind, description: str(f, "description", 300) || null, end_date: kind === "project" && isDate(end) ? end : null, dream_id: isId(str(f, "dream_id")) ? str(f, "dream_id") : null })
    .eq("id", id);
  if (error) return { error: dbError(error, "Gagal menyimpan.") };
  refresh(id);
  return { message: "Tersimpan ✓" };
}

export async function archiveWorkspace(f: FormData) {
  if (isDemoMode) return;
  const id = str(f, "id");
  const { supabase } = await me();
  await supabase.from("workspaces").update({ archived: f.get("restore") !== "1" }).eq("id", id);
  refresh(id);
}

export async function resetInviteLink(f: FormData) {
  if (isDemoMode) return;
  const id = str(f, "id");
  const code = crypto.randomUUID().replace(/-/g, "").slice(0, 10);
  const { supabase } = await me();
  await supabase.from("workspaces").update({ invite_code: code }).eq("id", id);
  refresh(id);
}

/* ---------------- Anggota ---------------- */

export async function inviteByUsername(_: FormState, f: FormData): Promise<FormState> {
  if (isDemoMode) return { error: DEMO };
  const ws = str(f, "ws");
  const username = str(f, "username", 30).replace(/^@/, "");
  if (!username) return { error: "Tulis username EClub orang yang mau diundang." };
  const { supabase, uid } = await me();
  const { data: target, error } = await supabase.rpc("ws_invite", { p_ws: ws, p_username: username });
  if (error || !target) return { error: dbError(error, "Gagal mengundang. Coba lagi.") };
  const { data: w } = await supabase.from("workspaces").select("name").eq("id", ws).maybeSingle();
  await notifyTeam(ws, [target as string], uid, "Undangan bergabung ke tim", `Anda diundang bergabung ke ${w?.name ?? "ruang kerja"} di EClub. Buka untuk menerima.`, "/tim");
  refresh(ws);
  return { message: `Undangan terkirim ke @${username}. Tunggu sampai diterima ya.` };
}

export async function respondInvite(f: FormData) {
  if (isDemoMode) return;
  const ws = str(f, "ws");
  const accept = f.get("accept") === "1";
  const { supabase, uid } = await me();
  const { error } = await supabase.rpc("ws_respond", { p_ws: ws, p_accept: accept });
  if (!error && accept) {
    const { data: w } = await supabase.from("workspaces").select("name, owner_id").eq("id", ws).maybeSingle();
    const { data: p } = await supabase.from("profiles").select("full_name").eq("id", uid).maybeSingle();
    if (w) await notifyTeam(ws, [w.owner_id], uid, "Undangan diterima", `${p?.full_name ?? "Anggota baru"} sudah bergabung ke ${w.name}.`, `/tim/${ws}?tab=anggota`);
  }
  refresh(ws);
  if (!error && accept) redirect(`/tim/${ws}`);
}

export async function joinByCode(_: FormState, f: FormData): Promise<FormState> {
  if (isDemoMode) return { error: DEMO };
  const code = str(f, "code", 20);
  const { supabase, uid } = await me();
  if (!uid) redirect(`/masuk?next=/gabung/${code}`);
  const { data: ws, error } = await supabase.rpc("ws_join", { p_code: code });
  if (error || !ws) return { error: dbError(error, "Gagal bergabung. Coba lagi.") };
  const { data: w } = await supabase.from("workspaces").select("name, owner_id").eq("id", ws).maybeSingle();
  const { data: p } = await supabase.from("profiles").select("full_name").eq("id", uid).maybeSingle();
  if (w) await notifyTeam(ws as string, [w.owner_id], uid, "Anggota baru bergabung", `${p?.full_name ?? "Seseorang"} bergabung ke ${w.name} lewat link undangan.`, `/tim/${ws}?tab=anggota`);
  refresh(ws as string);
  const jar = await cookies();
  if (jar.get("eclub_next")?.value?.startsWith("/gabung/")) jar.delete("eclub_next");
  redirect(`/tim/${ws}?gabung=1`);
}

export async function setMemberRole(f: FormData) {
  if (isDemoMode) return;
  const ws = str(f, "ws");
  const { supabase } = await me();
  await supabase.rpc("ws_set_role", { p_ws: ws, p_user: str(f, "user"), p_role: str(f, "role") });
  refresh(ws);
}

export async function removeMember(f: FormData) {
  if (isDemoMode) return;
  const ws = str(f, "ws");
  const user = str(f, "user");
  const { supabase, uid } = await me();
  await supabase.rpc("ws_remove", { p_ws: ws, p_user: user });
  refresh(ws);
  if (user === uid) redirect("/tim");
}

/* ---------------- Tugas ---------------- */

/** Pekerjaan wajib punya poin (bila fitur poin aktif), penanggung jawab, dan deadline. */
function needed(f: FormData, assignee: string, due: string) {
  if (f.has("section_id") && !isId(str(f, "section_id"))) return "Pilih tahapan untuk tugas ini.";
  if (!isId(assignee)) return "Pilih siapa yang mengerjakan.";
  if (!due) return "Isi deadline tugas ini.";
  return null;
}

/** Kolom tugas dari SQL 025 (poin, penting, target). Hanya dikirim bila ada di form. */
function extra(f: FormData) {
  const o: Record<string, unknown> = {};
  if (f.has("section_id")) o.section_id = isId(str(f, "section_id")) ? str(f, "section_id") : null;
  if (f.has("goal_id")) o.goal_id = isId(str(f, "goal_id")) ? str(f, "goal_id") : null;
  if (f.has("important_field")) o.important = f.get("important") === "on";
  if (f.has("repeat")) o.repeat = ["daily", "weekly", "monthly"].includes(str(f, "repeat")) ? str(f, "repeat") : null;
  return o;
}

export async function addTask(_: FormState, f: FormData): Promise<FormState> {
  if (isDemoMode) return { error: DEMO };
  const ws = str(f, "ws");
  const title = str(f, "title", 160);
  const assignee = str(f, "assignee");
  const plan = str(f, "plan_date") || todayJakarta();
  const due = str(f, "due_date");
  if (!title) return { error: "Tulis nama tugasnya." };
  if (!isDate(plan) || (due && !isDate(due))) return { error: "Tanggal tidak valid." };
  const need = needed(f, assignee, due);
  if (need) return { error: need };
  const { supabase, uid } = await me();
  const { data, error } = await supabase
    .from("ws_tasks")
    .insert({ workspace_id: ws, title, description: str(f, "description", 2000) || null, assignee_id: isId(assignee) ? assignee : null, created_by: uid, plan_date: plan, due_date: due || null, ...extra(f) })
    .select("id")
    .single();
  if (error || !data) {
    if (error?.code === "42501") return { error: "Tidak bisa menambah tugas. Hanya pemilik/editor tim, dan paket Plus pemilik harus aktif." };
    return { error: dbError(error, "Gagal menyimpan tugas.") };
  }
  if (isId(assignee) && assignee !== uid) {
    const { data: w } = await supabase.from("workspaces").select("name").eq("id", ws).maybeSingle();
    await notifyTeam(ws, [assignee], uid, `Tugas baru · ${w?.name ?? "Tim"}`, title, `/tim/${ws}/tugas/${data.id}`);
  }
  refresh(ws);
  return { message: "Tugas ditambahkan ✓" };
}

export async function updateTask(_: FormState, f: FormData): Promise<FormState> {
  if (isDemoMode) return { error: DEMO };
  const ws = str(f, "ws");
  const id = str(f, "id");
  const title = str(f, "title", 160);
  const assignee = str(f, "assignee");
  const plan = str(f, "plan_date");
  const due = str(f, "due_date");
  if (!title) return { error: "Judul wajib diisi." };
  if (!isDate(plan) || (due && !isDate(due))) return { error: "Tanggal tidak valid." };
  const need = needed(f, assignee, due);
  if (need) return { error: need };
  const { supabase, uid } = await me();
  const { data: before } = await supabase.from("ws_tasks").select("assignee_id").eq("id", id).maybeSingle();
  const { error } = await supabase
    .from("ws_tasks")
    .update({ title, description: str(f, "description", 2000) || null, assignee_id: isId(assignee) ? assignee : null, plan_date: plan, due_date: due || null, ...extra(f) })
    .eq("id", id);
  if (error) return { error: dbError(error, "Gagal menyimpan.") };
  if (isId(assignee) && before?.assignee_id !== assignee) {
    const { data: w } = await supabase.from("workspaces").select("name").eq("id", ws).maybeSingle();
    await notifyTeam(ws, [assignee], uid, `Tugas untuk Anda · ${w?.name ?? "Tim"}`, title, `/tim/${ws}/tugas/${id}`);
  }
  refresh(ws);
  return { message: "Tersimpan ✓" };
}

/** Selesai / buka lagi / lanjut besok / tutup. Pemberi tugas diberi tahu. */
export async function setTaskStatus(f: FormData) {
  if (isDemoMode) return;
  const id = str(f, "id");
  const to = str(f, "to");
  const { supabase, uid } = await me();
  const { data: t } = await supabase.from("ws_tasks").select("workspace_id, title, followups, created_by, assignee_id, workspaces(name, owner_id)").eq("id", id).maybeSingle();
  if (!t) return;
  const patch =
    to === "done"
      ? { status: "done" }
      : to === "start"
        ? { status: "open", started_at: new Date().toISOString() }
        : to === "open"
        ? { status: "open" }
        : to === "closed"
          ? { status: "closed" }
          : to === "tomorrow"
            ? { status: "open", plan_date: todayJakarta(1), followups: (t.followups ?? 0) + 1 }
            : to === "today"
              ? { status: "open", plan_date: todayJakarta() }
              : null;
  if (!patch) return;
  const { error } = await supabase.from("ws_tasks").update(patch).eq("id", id);
  if (!error && (to === "done" || to === "tomorrow")) {
    const w = t.workspaces as unknown as { name: string; owner_id: string } | null;
    const { data: p } = await supabase.from("profiles").select("full_name").eq("id", uid).maybeSingle();
    const who = p?.full_name ?? "Anggota";
    await notifyTeam(
      t.workspace_id,
      [t.created_by, w?.owner_id],
      uid,
      to === "done" ? `✅ Tugas selesai · ${w?.name ?? "Tim"}` : `⏭️ Dilanjut besok · ${w?.name ?? "Tim"}`,
      `${who}: ${t.title}`,
      `/tim/${t.workspace_id}/tugas/${id}`,
    );
  }
  refresh(t.workspace_id);
  revalidatePath(`/tim/${t.workspace_id}/tugas/${id}`);
}

export async function deleteTask(f: FormData) {
  if (isDemoMode) return;
  const ws = str(f, "ws");
  const { supabase } = await me();
  await supabase.from("ws_tasks").delete().eq("id", str(f, "id"));
  refresh(ws);
  redirect(`/tim/${ws}`);
}

/* ---------------- Komentar ---------------- */

export async function addComment(_: FormState, f: FormData): Promise<FormState> {
  if (isDemoMode) return { error: DEMO };
  const ws = str(f, "ws");
  const task = str(f, "task");
  const body = str(f, "body", 1000);
  if (!body) return { error: "Tulis komentarnya dulu." };
  const { supabase, uid } = await me();
  const { error } = await supabase.from("ws_comments").insert({ workspace_id: ws, task_id: task, user_id: uid, body });
  if (error) return { error: dbError(error, "Gagal mengirim komentar.") };
  const [{ data: t }, { data: others }, { data: p }] = await Promise.all([
    supabase.from("ws_tasks").select("title, assignee_id, created_by").eq("id", task).maybeSingle(),
    supabase.from("ws_comments").select("user_id").eq("task_id", task).limit(50),
    supabase.from("profiles").select("full_name").eq("id", uid).maybeSingle(),
  ]);
  if (t) {
    const to = [t.assignee_id, t.created_by, ...((others ?? []) as { user_id: string }[]).map((o) => o.user_id)];
    await notifyTeam(ws, to, uid, `💬 ${p?.full_name ?? "Anggota"} berkomentar`, `${t.title}: ${body.slice(0, 120)}`, `/tim/${ws}/tugas/${task}`);
  }
  revalidatePath(`/tim/${ws}/tugas/${task}`);
  revalidatePath(`/tim/${ws}`);
  return { message: "ok" };
}

export async function deleteComment(f: FormData) {
  if (isDemoMode) return;
  const { supabase } = await me();
  await supabase.from("ws_comments").delete().eq("id", str(f, "id"));
  revalidatePath(`/tim/${str(f, "ws")}/tugas/${str(f, "task")}`);
}

/* ---------------- Pemberitahuan & username ---------------- */

export async function readAllNotices() {
  if (isDemoMode) return;
  const { supabase, uid } = await me();
  await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", uid).is("read_at", null);
  revalidatePath("/", "layout");
}

export async function setUsername(_: FormState, f: FormData): Promise<FormState> {
  if (isDemoMode) return { error: DEMO };
  const { supabase } = await me();
  const { data, error } = await supabase.rpc("set_my_username", { p_username: str(f, "username", 30).replace(/^@/, "") });
  if (error) return { error: dbError(error, "Gagal menyimpan username.") };
  revalidatePath("/profile");
  revalidatePath("/tim");
  return { message: `Username Anda sekarang @${data}` };
}

/* ---------------- Putaran 2: poin, jadwal ulang, arsip, hasil, target ---------------- */

export async function addSection(_: FormState, f: FormData): Promise<FormState> {
  if (isDemoMode) return { error: DEMO };
  const ws = str(f, "ws");
  const names = String(f.get("name") ?? "")
    .split(",")
    .map((n) => n.trim().slice(0, 40))
    .filter(Boolean)
    .slice(0, 10);
  if (!names.length) return { error: "Tulis nama tahapannya, mis. Melengkapi dokumen." };
  const { supabase } = await me();
  const { count } = await supabase.from("ws_sections").select("id", { count: "exact", head: true }).eq("workspace_id", ws).eq("archived", false);
  if ((count ?? 0) + names.length > 30) return { error: "Maksimal 30 tahapan per ruang kerja. Hapus tahapan yang sudah selesai." };
  const { error } = await supabase.from("ws_sections").insert(names.map((name, i) => ({ workspace_id: ws, name, sort: (count ?? 0) + i })));
  if (error) return { error: error.code === "42P01" ? "Fitur tahapan aktif setelah SQL 025 dijalankan." : dbError(error, "Gagal menyimpan tahapan.") };
  refresh(ws);
  return { message: "Tahapan ditambahkan ✓" };
}

export async function renameSection(f: FormData) {
  if (isDemoMode) return;
  const ws = str(f, "ws");
  const name = str(f, "name", 40);
  if (!name) return;
  const { supabase } = await me();
  await supabase.from("ws_sections").update({ name }).eq("id", str(f, "id"));
  refresh(ws);
}

/** Hapus poin: pekerjaannya tetap ada, pindah ke "Tanpa tahapan". */
export async function deleteSection(f: FormData) {
  if (isDemoMode) return;
  const ws = str(f, "ws");
  const { supabase } = await me();
  await supabase.from("ws_sections").delete().eq("id", str(f, "id"));
  refresh(ws);
}

/** Jadwal ulang (pemilik/admin): tugas pindah ke tanggal baru, penanggung jawab diberi tahu. */
export async function rescheduleTask(f: FormData) {
  if (isDemoMode) return;
  const id = str(f, "id");
  const date = str(f, "date");
  if (!isDate(date)) return;
  const { supabase, uid } = await me();
  const { data: t } = await supabase.from("ws_tasks").select("workspace_id, title, due_date, assignee_id, followups").eq("id", id).maybeSingle();
  if (!t) return;
  const patch: Record<string, unknown> = { status: "open", plan_date: date, followups: (t.followups ?? 0) + 1 };
  if (t.due_date && t.due_date < date) patch.due_date = date;
  const { error } = await supabase.from("ws_tasks").update(patch).eq("id", id);
  if (!error) await notifyTeam(t.workspace_id, [t.assignee_id], uid, "📅 Tugas dijadwal ulang", `${t.title} → ${date.split("-").reverse().join("/")}`, `/tim/${t.workspace_id}/tugas/${id}`);
  refresh(t.workspace_id);
  revalidatePath(`/tim/${t.workspace_id}/tugas/${id}`);
}

/** Arsipkan / kembalikan satu tugas. Statusnya tetap tersimpan dan tetap dihitung di progres. */
export async function archiveTask(f: FormData) {
  if (isDemoMode) return;
  const ws = str(f, "ws");
  const { supabase } = await me();
  await supabase.from("ws_tasks").update({ archived: f.get("restore") !== "1" }).eq("id", str(f, "id"));
  refresh(ws);
}

/** Arsipkan semua tugas yang sudah selesai / ditutup supaya daftar tetap rapi. */
export async function archiveFinished(f: FormData) {
  if (isDemoMode) return;
  const ws = str(f, "ws");
  const { supabase } = await me();
  await supabase.from("ws_tasks").update({ archived: true }).eq("workspace_id", ws).in("status", ["done", "closed"]).eq("archived", false);
  refresh(ws);
}

/**
 * Pemilik: hasil tugas ini menambah tabungan mimpi? Uang dicatat masuk ke kantong pilihan (opsional sebagai pemasukan)
 * lalu ditandai untuk mimpi, sehingga tabungan mimpi bertambah. Atau "tidak".
 */
export async function saveTaskResult(_: FormState, f: FormData): Promise<FormState> {
  if (isDemoMode) return { error: DEMO };
  const id = str(f, "id");
  const ws = str(f, "ws");
  const { supabase } = await me();
  if (f.get("skip") === "1") {
    const { error } = await supabase.from("ws_tasks").update({ result_state: "skipped" }).eq("id", id);
    if (error) return { error: dbError(error, "Gagal menyimpan.") };
    refresh(ws);
    revalidatePath(`/tim/${ws}/tugas/${id}`);
    return { message: "Oke, dicatat tanpa tabungan." };
  }
  const amount = Number(String(f.get("amount") ?? "").replace(/[^\d]/g, ""));
  const pocketId = str(f, "pocket_id");
  const dreamId = str(f, "dream_id");
  if (!amount || amount <= 0) return { error: "Isi nominal yang ditabung." };
  const [{ data: pocket }, { data: dream }, { data: task }] = await Promise.all([
    supabase.from("fin_pockets").select("id, wallet").eq("id", pocketId).eq("archived", false).maybeSingle(),
    supabase.from("dreams").select("id, saved_amount").eq("id", dreamId).maybeSingle(),
    supabase.from("ws_tasks").select("title").eq("id", id).maybeSingle(),
  ]);
  if (!pocket) return { error: "Pilih kantong / rekening tempat uangnya disimpan." };
  if (!dream) return { error: "Pilih mimpi yang ingin ditabung." };
  let txId: string | null = null;
  if (f.get("as_income") === "on") {
    const { data: tx, error } = await supabase
      .from("fin_transactions")
      .insert({ kind: "in", wallet: pocket.wallet, pocket_id: pocket.id, category: pocket.wallet === "business" ? "penjualan" : "sampingan", amount, note: `Hasil tugas: ${task?.title ?? ""}`.slice(0, 200) })
      .select("id")
      .single();
    if (error) return { error: "Gagal mencatat pemasukan. Pastikan SQL keuangan sudah dijalankan." };
    txId = tx?.id ?? null;
  }
  const { error: fe } = await supabase.from("fin_dream_funds").insert({ dream_id: dream.id, pocket_id: pocket.id, amount, kind: "save", tx_id: txId });
  if (fe) return { error: "Gagal menyimpan tabungan. Pastikan SQL 023 sudah dijalankan." };
  await supabase.from("dreams").update({ saved_amount: Number(dream.saved_amount) + amount }).eq("id", dream.id);
  await supabase.from("ws_tasks").update({ result_state: "saved", result_amount: amount }).eq("id", id);
  for (const p of ["/keuangan", "/keuangan/kantong", "/goals", `/goals/${dream.id}`, `/tim/${ws}/tugas/${id}`]) revalidatePath(p);
  refresh(ws);
  return { message: "Tersimpan ✓ Tabungan mimpi Anda bertambah." };
}

export async function addGoal(_: FormState, f: FormData): Promise<FormState> {
  if (isDemoMode) return { error: DEMO };
  const ws = str(f, "ws");
  const title = str(f, "title", 120);
  const target = Number(String(f.get("target") ?? "").replace(/[^\d.]/g, "")) || null;
  const due = str(f, "due_date");
  if (!title) return { error: "Tulis targetnya, mis. Omzet bulan Maret." };
  const { supabase } = await me();
  const { error } = await supabase.from("ws_goals").insert({ workspace_id: ws, title, target_value: target, unit: str(f, "unit", 20) || null, due_date: isDate(due) ? due : null });
  if (error) return { error: error.code === "42501" ? "Hanya pemilik/editor tim yang bisa menambah target." : dbError(error, "Gagal menyimpan target.") };
  refresh(ws);
  return { message: "Target ditambahkan ✓" };
}

export async function updateGoal(f: FormData) {
  if (isDemoMode) return;
  const ws = str(f, "ws");
  const { supabase } = await me();
  const patch: Record<string, unknown> = {};
  if (f.has("current")) patch.current_value = Number(String(f.get("current") ?? "").replace(/[^\d.]/g, "")) || 0;
  if (f.has("status")) patch.status = ["active", "achieved", "dropped"].includes(str(f, "status")) ? str(f, "status") : "active";
  await supabase.from("ws_goals").update(patch).eq("id", str(f, "id"));
  refresh(ws);
}

/* ---------------- Putaran 3: checklist & diskusi ---------------- */

export async function addItem(_: FormState, f: FormData): Promise<FormState> {
  if (isDemoMode) return { error: DEMO };
  const ws = str(f, "ws");
  const task = str(f, "task");
  const titles = String(f.get("title") ?? "")
    .split("\n")
    .map((t) => t.trim().slice(0, 160))
    .filter(Boolean)
    .slice(0, 20);
  if (!titles.length) return { error: "Tulis langkahnya dulu." };
  const { supabase } = await me();
  const { count } = await supabase.from("ws_task_items").select("id", { count: "exact", head: true }).eq("task_id", task);
  const { error } = await supabase.from("ws_task_items").insert(titles.map((title, i) => ({ task_id: task, workspace_id: ws, title, sort: (count ?? 0) + i })));
  if (error) return { error: error.code === "42P01" ? "Checklist aktif setelah SQL 026 dijalankan." : error.code === "42501" ? "Hanya penanggung jawab atau pemilik/editor yang bisa menambah checklist." : dbError(error, "Gagal menyimpan.") };
  revalidatePath(`/tim/${ws}/tugas/${task}`);
  revalidatePath(`/tim/${ws}`);
  return { message: "ok" };
}

export async function toggleItem(f: FormData) {
  if (isDemoMode) return;
  const ws = str(f, "ws");
  const task = str(f, "task");
  const { supabase } = await me();
  await supabase.from("ws_task_items").update({ done: f.get("done") !== "1" }).eq("id", str(f, "id"));
  revalidatePath(`/tim/${ws}/tugas/${task}`);
  revalidatePath(`/tim/${ws}`);
}

export async function deleteItem(f: FormData) {
  if (isDemoMode) return;
  const ws = str(f, "ws");
  const task = str(f, "task");
  const { supabase } = await me();
  await supabase.from("ws_task_items").delete().eq("id", str(f, "id"));
  revalidatePath(`/tim/${ws}/tugas/${task}`);
}

export async function postMessage(_: FormState, f: FormData): Promise<FormState> {
  if (isDemoMode) return { error: DEMO };
  const ws = str(f, "ws");
  const body = str(f, "body", 2000);
  if (!body) return { error: "Tulis pesannya dulu." };
  const { supabase, uid } = await me();
  const { error } = await supabase.from("ws_messages").insert({ workspace_id: ws, user_id: uid, body });
  if (error) return { error: error.code === "42P01" ? "Diskusi aktif setelah SQL 026 dijalankan." : dbError(error, "Gagal mengirim.") };
  const [{ data: w }, { data: p }, { data: m }] = await Promise.all([
    supabase.from("workspaces").select("name").eq("id", ws).maybeSingle(),
    supabase.from("profiles").select("full_name").eq("id", uid).maybeSingle(),
    supabase.from("workspace_members").select("user_id").eq("workspace_id", ws).eq("status", "active"),
  ]);
  await notifyTeam(ws, ((m ?? []) as { user_id: string }[]).map((x) => x.user_id), uid, `💬 ${w?.name ?? "Tim"}`, `${p?.full_name ?? "Anggota"}: ${body.slice(0, 140)}`, `/tim/${ws}?tab=diskusi`);
  revalidatePath(`/tim/${ws}`);
  return { message: "ok" };
}

export async function deleteMessage(f: FormData) {
  if (isDemoMode) return;
  const ws = str(f, "ws");
  const { supabase } = await me();
  await supabase.from("ws_messages").delete().eq("id", str(f, "id"));
  revalidatePath(`/tim/${ws}`);
}
