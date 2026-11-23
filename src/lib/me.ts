import "server-only";
import { cache } from "react";
import { createClient } from "./supabase/server";

export type Me = {
  user: { id: string; email: string; full_name: string | null } | null;
  row: {
    full_name: string | null;
    segment: string | null;
    success_definition: string | null;
    role: string | null;
    plan: string | null;
    plan_expires_at: string | null;
    whatsapp: string | null;
    birth_date: string | null;
    regency: string | null;
  } | null;
};

/** Satu kali cek login + satu kali baca profil per permintaan (dipakai layout, getProfile, getAccount). */
export const getMe = cache(async (): Promise<Me> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, row: null };
  const { data } = await supabase
    .from("profiles")
    .select("full_name, segment, success_definition, role, plan, plan_expires_at, whatsapp, birth_date, regency")
    .eq("id", user.id)
    .maybeSingle();
  return { user: { id: user.id, email: user.email ?? "", full_name: (user.user_metadata?.full_name as string | undefined) ?? null }, row: (data as Me["row"]) ?? null };
});
