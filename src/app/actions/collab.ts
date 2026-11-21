"use server";

import { revalidatePath } from "next/cache";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { notifyInquiry } from "@/lib/whatsapp";
import type { FormState } from "./auth";

const KIND_LABEL: Record<string, string> = { inhouse: "In-house training", workshop: "Workshop / seminar", speaker: "Undang pembicara", partner: "Kemitraan", lainnya: "Lainnya" };

export async function submitInquiry(_: FormState, formData: FormData): Promise<FormState> {
  if (isDemoMode) return { message: "Terima kasih! (mode demo, data tidak disimpan)" };
  const f = (k: string) => String(formData.get(k) ?? "").trim();
  if (f("website")) return { message: "Terima kasih!" }; // jebakan bot
  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_inquiry", {
    p_kind: f("kind"),
    p_name: f("name"),
    p_org: f("organization"),
    p_wa: f("whatsapp"),
    p_participants: Number(f("participants")) || null,
    p_city: f("city"),
    p_message: f("message"),
  });
  if (error) return { error: error.message.includes("function") ? "Form belum aktif. Hubungi kami lewat WhatsApp." : error.message };
  await notifyInquiry(`${KIND_LABEL[f("kind")] ?? "Kolaborasi"} · ${f("name")}${f("organization") ? ` (${f("organization")})` : ""} · WA ${f("whatsapp")}${f("participants") ? ` · ${f("participants")} peserta` : ""}${f("city") ? ` · ${f("city")}` : ""}${f("message") ? `\n"${f("message").slice(0, 300)}"` : ""}`);
  return { message: "Terima kasih! Tim EClub akan menghubungi Anda lewat WhatsApp dalam 1×24 jam kerja." };
}

export async function adminSetInquiry(formData: FormData) {
  if (isDemoMode) return;
  const supabase = await createClient();
  await supabase.from("collab_inquiries").update({ status: String(formData.get("status")) }).eq("id", String(formData.get("id")));
  revalidatePath("/admin/kolaborasi");
}
