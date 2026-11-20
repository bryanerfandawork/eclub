import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { isDemoMode } from "./supabase/config";
import { createClient } from "./supabase/server";
import { demoActions, demoDreams, demoProfile } from "./demo";
import type { Dream, DreamAction, Profile } from "./types";

export const getProfile = cache(async (): Promise<Profile & { email: string }> => {
  if (isDemoMode) return { ...demoProfile, email: "demo@eclub.id" };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/masuk");
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, segment, success_definition")
    .eq("id", user.id)
    .maybeSingle();
  return {
    id: user.id,
    full_name: data?.full_name ?? (user.user_metadata?.full_name as string | undefined) ?? null,
    segment: data?.segment ?? null,
    success_definition: data?.success_definition ?? null,
    email: user.email ?? "",
  };
});

export async function getDreams(): Promise<Dream[]> {
  if (isDemoMode) return demoDreams;
  const supabase = await createClient();
  const { data } = await supabase.from("dreams").select("*").order("created_at", { ascending: false });
  return (data ?? []).map(normalizeDream);
}

export async function getDream(id: string): Promise<{ dream: Dream; actions: DreamAction[] } | null> {
  if (isDemoMode) {
    const dream = demoDreams.find((d) => d.id === id);
    return dream ? { dream, actions: demoActions.filter((a) => a.dream_id === id) } : null;
  }
  const supabase = await createClient();
  const { data: dream } = await supabase.from("dreams").select("*").eq("id", id).maybeSingle();
  if (!dream) return null;
  const { data: actions } = await supabase
    .from("dream_actions")
    .select("*")
    .eq("dream_id", id)
    .order("created_at", { ascending: true });
  return { dream: normalizeDream(dream), actions: (actions ?? []) as DreamAction[] };
}

export async function getOpenActions(limit = 5): Promise<(DreamAction & { dream_title: string })[]> {
  if (isDemoMode) {
    return demoActions
      .filter((a) => !a.done)
      .slice(0, limit)
      .map((a) => ({ ...a, dream_title: demoDreams.find((d) => d.id === a.dream_id)?.title ?? "" }));
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("dream_actions")
    .select("*, dreams(title)")
    .eq("done", false)
    .order("created_at", { ascending: true })
    .limit(limit);
  return (data ?? []).map((a) => ({
    ...(a as DreamAction),
    dream_title: (a as { dreams?: { title?: string } }).dreams?.title ?? "",
  }));
}

// Supabase mengembalikan kolom numeric sebagai string.
function normalizeDream(d: Record<string, unknown>): Dream {
  return {
    ...(d as Dream),
    target_amount: d.target_amount == null ? null : Number(d.target_amount),
    saved_amount: Number(d.saved_amount ?? 0),
  };
}
