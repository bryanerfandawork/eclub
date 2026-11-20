"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string; message?: string } | undefined;

const DEMO_MSG = "Mode demo: login belum aktif karena database belum disambungkan.";

export async function signIn(_: FormState, formData: FormData): Promise<FormState> {
  if (isDemoMode) redirect("/dashboard");
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Email dan kata sandi wajib diisi." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.message.toLowerCase().includes("email not confirmed"))
      return { error: "Email belum dikonfirmasi. Cek kotak masuk email Anda." };
    return { error: "Email atau kata sandi salah." };
  }
  redirect("/dashboard");
}

export async function signUp(_: FormState, formData: FormData): Promise<FormState> {
  if (isDemoMode) return { error: DEMO_MSG };
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!fullName || !email) return { error: "Nama dan email wajib diisi." };
  if (password.length < 8) return { error: "Kata sandi minimal 8 karakter." };

  const origin = (await headers()).get("origin") ?? "";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName }, emailRedirectTo: `${origin}/auth/callback` },
  });
  if (error) {
    if (error.message.toLowerCase().includes("registered")) return { error: "Email ini sudah terdaftar. Silakan masuk." };
    return { error: "Pendaftaran gagal. Coba lagi sebentar lagi." };
  }
  if (data.session) redirect("/dashboard");
  return { message: "Hampir selesai! Kami mengirim tautan konfirmasi ke email Anda. Klik tautan itu untuk mengaktifkan akun." };
}

export async function signOut() {
  if (!isDemoMode) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}
