import "server-only";
import { cache } from "react";
import { isDemoMode } from "./supabase/config";
import { createClient } from "./supabase/server";
import { getMe } from "./me";

export type WsRole = "owner" | "admin" | "member";
export type Workspace = {
  id: string;
  owner_id: string;
  name: string;
  kind: "company" | "project";
  description: string | null;
  end_date: string | null;
  invite_code: string;
  archived: boolean;
  created_at: string;
};
export type MyWorkspace = Workspace & { role: WsRole; open: number; mine: number };
export type Person = { user_id: string; full_name: string | null; username: string | null; role: WsRole; status: "invited" | "active"; joined_at: string | null };
export type TeamTask = {
  id: string;
  workspace_id: string;
  title: string;
  description: string | null;
  assignee_id: string | null;
  created_by: string | null;
  plan_date: string;
  due_date: string | null;
  status: "open" | "done" | "closed";
  followups: number;
  done_at: string | null;
  created_at: string;
  updated_at: string;
};
export type TaskComment = { id: string; task_id: string; user_id: string; body: string; created_at: string };
export type Invite = { workspace_id: string; name: string; kind: string; inviter: string; created_at: string };
export type Notice = { id: string; title: string; body: string | null; url: string | null; read_at: string | null; created_at: string };

export const ROLE_LABEL: Record<WsRole, string> = { owner: "Pemilik", admin: "Admin", member: "Anggota" };
export const KIND_LABEL = { company: "Perusahaan", project: "Project" } as const;
export const canManage = (r?: WsRole | null) => r === "owner" || r === "admin";

export type TeamState = {
  ready: boolean;
  username: string | null;
  simple: boolean;
  workspaces: number;
  invites: number;
  unread: number;
};

const EMPTY: TeamState = { ready: false, username: null, simple: false, workspaces: 0, invites: 0, unread: 0 };

/**
 * Status tim untuk menu & dashboard. Dibuat tahan banting: kalau SQL 024 belum dijalankan, semua kosong
 * dan aplikasi tetap berjalan seperti biasa.
 */
export const getTeamState = cache(async (): Promise<TeamState> => {
  if (isDemoMode) return EMPTY;
  const { user } = await getMe();
  if (!user) return EMPTY;
  const supabase = await createClient();
  const [prof, mem, unread, dreams] = await Promise.all([
    supabase.from("profiles").select("username, signup_source").eq("id", user.id).maybeSingle(),
    supabase.from("workspace_members").select("status").eq("user_id", user.id),
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).is("read_at", null),
    supabase.from("dreams").select("id", { count: "exact", head: true }),
  ]);
  if (prof.error || mem.error) return EMPTY;
  const rows = (mem.data ?? []) as { status: string }[];
  const active = rows.filter((r) => r.status === "active").length;
  const source = (prof.data as { signup_source?: string | null } | null)?.signup_source ?? null;
  return {
    ready: true,
    username: (prof.data as { username?: string | null } | null)?.username ?? null,
    // Member yang masuk karena undangan tim dan belum menyusun mimpi: tampilan sederhana dulu.
    simple: source === "invite" && (dreams.count ?? 0) === 0,
    workspaces: active,
    invites: rows.length - active,
    unread: unread.error ? 0 : (unread.count ?? 0),
  };
});

export const getMyWorkspaces = cache(async (): Promise<MyWorkspace[]> => {
  if (isDemoMode) return [];
  const { user } = await getMe();
  if (!user) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workspace_members")
    .select("role, workspaces(*)")
    .eq("user_id", user.id)
    .eq("status", "active");
  if (error || !data) return [];
  const list = (data as unknown as { role: WsRole; workspaces: Workspace | null }[]).filter((r) => r.workspaces).map((r) => ({ ...(r.workspaces as Workspace), role: r.role, open: 0, mine: 0 }));
  if (!list.length) return [];
  const { data: tasks } = await supabase.from("ws_tasks").select("workspace_id, assignee_id").eq("status", "open").in("workspace_id", list.map((w) => w.id));
  for (const t of (tasks ?? []) as { workspace_id: string; assignee_id: string | null }[]) {
    const w = list.find((x) => x.id === t.workspace_id);
    if (!w) continue;
    w.open++;
    if (t.assignee_id === user.id) w.mine++;
  }
  return list.sort((a, b) => Number(a.archived) - Number(b.archived) || a.name.localeCompare(b.name));
});

export async function getMyInvites(): Promise<Invite[]> {
  if (isDemoMode) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("my_ws_invites");
  return error ? [] : ((data ?? []) as Invite[]);
}

export async function getWorkspace(id: string) {
  if (isDemoMode || !/^[0-9a-f-]{36}$/.test(id)) return null;
  const { user } = await getMe();
  if (!user) return null;
  const supabase = await createClient();
  const [{ data: ws }, { data: people }, { data: tasks }] = await Promise.all([
    supabase.from("workspaces").select("*").eq("id", id).maybeSingle(),
    supabase.rpc("ws_people", { p_ws: id }),
    supabase.from("ws_tasks").select("*").eq("workspace_id", id).order("plan_date").order("created_at").limit(500),
  ]);
  if (!ws) return null;
  const ppl = (people ?? []) as Person[];
  const me = ppl.find((p) => p.user_id === user.id && p.status === "active");
  if (!me) return null;
  const { data: cc } = await supabase.from("ws_comments").select("task_id").eq("workspace_id", id).limit(2000);
  const comments: Record<string, number> = {};
  for (const c of (cc ?? []) as { task_id: string }[]) comments[c.task_id] = (comments[c.task_id] ?? 0) + 1;
  return { ws: ws as Workspace, people: ppl, role: me.role, me: user.id, tasks: (tasks ?? []) as TeamTask[], comments };
}

export async function getTask(wsId: string, taskId: string) {
  const base = await getWorkspace(wsId);
  if (!base) return null;
  const task = base.tasks.find((t) => t.id === taskId);
  if (!task) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("ws_comments").select("*").eq("task_id", taskId).order("created_at").limit(300);
  return { ...base, task, list: (data ?? []) as TaskComment[] };
}

export type MyTeamTask = TeamTask & { ws_name: string; comments: number };

/** Tugas tim untuk Laporan Harian & Home: yang terbuka sampai besok, plus yang selesai hari ini. */
export const getMyTeamTasks = cache(async (today: string, tomorrow: string): Promise<MyTeamTask[]> => {
  if (isDemoMode) return [];
  const { user } = await getMe();
  if (!user) return [];
  const supabase = await createClient();
  const startJkt = new Date(`${today}T00:00:00+07:00`).toISOString();
  const { data, error } = await supabase
    .from("ws_tasks")
    .select("*, workspaces(name, archived)")
    .eq("assignee_id", user.id)
    .or(`and(status.eq.open,plan_date.lte.${tomorrow}),and(status.eq.done,done_at.gte."${startJkt}")`)
    .order("plan_date")
    .limit(100);
  if (error || !data) return [];
  const rows = (data as unknown as (TeamTask & { workspaces: { name: string; archived: boolean } | null })[]).filter((t) => t.workspaces && !t.workspaces.archived);
  const ids = rows.map((r) => r.id);
  const counts: Record<string, number> = {};
  if (ids.length) {
    const { data: cc } = await supabase.from("ws_comments").select("task_id").in("task_id", ids);
    for (const c of (cc ?? []) as { task_id: string }[]) counts[c.task_id] = (counts[c.task_id] ?? 0) + 1;
  }
  return rows.map(({ workspaces, ...t }) => ({ ...t, ws_name: workspaces?.name ?? "Tim", comments: counts[t.id] ?? 0 }));
});

export async function getNotices(limit = 20): Promise<Notice[]> {
  if (isDemoMode) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(limit);
  return error ? [] : ((data ?? []) as Notice[]);
}

export const personName = (p?: Pick<Person, "full_name" | "username"> | null) => p?.full_name || (p?.username ? `@${p.username}` : "Anggota");
