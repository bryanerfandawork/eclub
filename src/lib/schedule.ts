import "server-only";
import { isDemoMode } from "./supabase/config";
import { createClient } from "./supabase/server";

export type Slot = { id: string; mentor: string; topic: string; starts_at: string; duration_min: number; price: number; plus_price: number };
export type MyBooking = Slot & { status: string; goal: string | null; order_id: string | null; order_status: string | null; meet_link: string | null };
export type EventItem = {
  id: string; title: string; description: string | null; speaker: string | null; starts_at: string; duration_min: number;
  price: number; plus_price: number; capacity: number | null; seats: number; registered: boolean; meet_link: string | null; recording_url: string | null;
};

const at = (days: number, hour: number) => {
  const d = new Date(Date.now() + days * 86_400_000);
  d.setUTCHours(hour - 7, 0, 0, 0);
  return d.toISOString();
};

export async function getMentoring(): Promise<{ slots: Slot[]; mine: MyBooking[] } | null> {
  if (isDemoMode)
    return {
      slots: [
        { id: "s1", mentor: "Bryan", topic: "Mentoring bisnis 1-on-1", starts_at: at(2, 10), duration_min: 60, price: 299000, plus_price: 199000 },
        { id: "s2", mentor: "Bryan", topic: "Mentoring bisnis 1-on-1", starts_at: at(2, 14), duration_min: 60, price: 299000, plus_price: 199000 },
        { id: "s3", mentor: "Bryan", topic: "Review keuangan usaha", starts_at: at(4, 19), duration_min: 45, price: 249000, plus_price: 149000 },
      ],
      mine: [],
    };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("mentoring_overview");
  return error ? null : (data as { slots: Slot[]; mine: MyBooking[] });
}

export async function getEvents(): Promise<EventItem[] | null> {
  if (isDemoMode)
    return [
      { id: "e1", title: "Menemukan Spark: kenapa usaha terasa jalan di tempat", description: "Webinar 90 menit tentang menemukan kembali cita-cita sebagai bahan bakar usaha, plus sesi tanya jawab.", speaker: "Bryan", starts_at: at(6, 19), duration_min: 90, price: 49000, plus_price: 0, capacity: 100, seats: 37, registered: false, meet_link: null, recording_url: null },
    ];
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("events_overview");
  return error ? null : (data as EventItem[]);
}

export function jam(iso: string) {
  return new Date(iso).toLocaleString("id-ID", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }) + " WIB";
}
export function hari(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
}
