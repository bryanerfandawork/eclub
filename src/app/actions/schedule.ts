"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { emailOrder } from "@/lib/email";
import { notifyEventCity, notifyOrderCreated, notifyScheduleConfirmed } from "@/lib/whatsapp";
import type { FormState } from "./auth";

const DEMO = { error: "Mode demo: pemesanan belum aktif." };

export async function bookMentoring(_: FormState, formData: FormData): Promise<FormState> {
  if (isDemoMode) return DEMO;
  const slot = String(formData.get("slot"));
  const goal = String(formData.get("goal") ?? "").trim();
  if (goal.length < 5) return { error: "Ceritakan singkat apa yang ingin dibahas, supaya mentor bisa bersiap." };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("book_mentoring", { p_slot: slot, p_goal: goal });
  if (error) return { error: error.message.includes("function") ? "Fitur mentoring belum aktif (SQL tahap 13)." : error.message };
  if (data) {
    await Promise.all([notifyOrderCreated(String(data)), emailOrder(String(data), "created")]);
    redirect(`/pesanan/${data}`);
  }
  await notifyScheduleConfirmed("mentoring", slot);
  revalidatePath("/mentoring");
  return { message: "Jadwal terkonfirmasi ✓" };
}

export async function registerEvent(_: FormState, formData: FormData): Promise<FormState> {
  if (isDemoMode) return DEMO;
  const id = String(formData.get("event"));
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("register_event", { p_event: id });
  if (error) return { error: error.message.includes("function") ? "Fitur event belum aktif (SQL tahap 13)." : error.message };
  if (data) {
    await Promise.all([notifyOrderCreated(String(data)), emailOrder(String(data), "created")]);
    redirect(`/pesanan/${data}`);
  }
  await notifyScheduleConfirmed("event", id);
  revalidatePath("/event");
  return { message: "Anda terdaftar ✓" };
}

// ---------- Admin ----------
function wibToIso(date: string, time: string) {
  return new Date(`${date}T${time}:00+07:00`).toISOString();
}
const money = (v: FormDataEntryValue | null) => Number(String(v ?? "").replace(/[^\d]/g, "")) || 0;
const link = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").trim();
  return /^https:\/\//.test(s) ? s.slice(0, 500) : null;
};

export async function adminAddSlots(_: FormState, formData: FormData): Promise<FormState> {
  if (isDemoMode) return DEMO;
  const date = String(formData.get("date"));
  const times = String(formData.get("times") ?? "").split(/[,\s]+/).filter((t) => /^\d{1,2}[:.]\d{2}$/.test(t));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || times.length === 0) return { error: "Isi tanggal dan minimal satu jam, misal: 10:00, 14:00" };
  const base = {
    mentor: String(formData.get("mentor") ?? "").trim() || "Mentor EClub",
    topic: String(formData.get("topic") ?? "").trim() || "Mentoring bisnis 1-on-1",
    duration_min: Number(formData.get("duration")) || 60,
    price: money(formData.get("price")),
    plus_price: money(formData.get("plus_price")),
    meet_link: link(formData.get("meet_link")),
  };
  const rows = times.map((t) => ({ ...base, starts_at: wibToIso(date, t.replace(".", ":").padStart(5, "0")) }));
  const supabase = await createClient();
  const { error } = await supabase.from("mentoring_slots").insert(rows);
  if (error) return { error: "Gagal menyimpan: " + error.message };
  revalidatePath("/admin/jadwal");
  return { message: `${rows.length} slot ditambahkan.` };
}

export async function adminDeleteSlot(formData: FormData) {
  if (isDemoMode) return;
  const supabase = await createClient();
  await supabase.from("mentoring_slots").delete().eq("id", String(formData.get("id")));
  revalidatePath("/admin/jadwal");
}

export async function adminSaveEvent(_: FormState, formData: FormData): Promise<FormState> {
  if (isDemoMode) return DEMO;
  const title = String(formData.get("title") ?? "").trim();
  const date = String(formData.get("date"));
  const time = String(formData.get("time") ?? "19:00");
  if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Isi judul dan tanggal." };
  const row = {
    title,
    description: String(formData.get("description") ?? "").trim() || null,
    speaker: String(formData.get("speaker") ?? "").trim() || null,
    starts_at: wibToIso(date, time.padStart(5, "0")),
    duration_min: Number(formData.get("duration")) || 90,
    price: money(formData.get("price")),
    plus_price: money(formData.get("plus_price")),
    capacity: Number(formData.get("capacity")) || null,
    meet_link: link(formData.get("meet_link")),
    recording_url: link(formData.get("recording_url")),
    regency: /^\d{2}\.\d{2}$/.test(String(formData.get("regency") ?? "")) ? String(formData.get("regency")) : null,
    location: String(formData.get("location") ?? "").trim().slice(0, 200) || null,
  };
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  const res = id ? await supabase.from("events").update(row).eq("id", id).select("id").single() : await supabase.from("events").insert(row).select("id").single();
  if (res.error) return { error: "Gagal menyimpan: " + res.error.message };
  revalidatePath("/admin/jadwal");
  revalidatePath("/event");
  revalidatePath("/");
  if (row.regency && formData.get("notify_city") === "on") {
    const r = await notifyEventCity(res.data.id);
    return { message: `Event tersimpan. WhatsApp terkirim ke ${r.sent} member di kota tersebut${r.total > r.sent ? ` (sisa ${r.total - r.sent}, klik "Kabari kota" lagi besok)` : ""}.` };
  }
  return { message: "Event tersimpan." };
}

export async function adminDeleteEvent(formData: FormData) {
  if (isDemoMode) return;
  const supabase = await createClient();
  await supabase.from("events").delete().eq("id", String(formData.get("id")));
  revalidatePath("/admin/jadwal");
}

export async function adminNotifyCity(formData: FormData) {
  if (isDemoMode) return;
  const supabase = await createClient();
  const { data: staff } = await supabase.rpc("is_staff");
  if (!staff) return;
  await notifyEventCity(String(formData.get("id")));
  revalidatePath("/admin/jadwal");
}
