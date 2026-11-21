"use server";

import { cookies, headers } from "next/headers";
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
  const ref = (await cookies()).get("eclub_ref")?.value;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, ...(ref ? { ref } : {}) }, emailRedirectTo: `${origin}/auth/callback` },
  });
  if (error) {
    if (error.message.toLowerCase().includes("registered")) return { error: "Email ini sudah terdaftar. Silakan masuk." };
    return { error: "Pendaftaran gagal. Coba lagi sebentar lagi." };
  }
  if (data.session) redirect("/lengkapi");
  return { message: "Hampir selesai! Kami mengirim tautan konfirmasi ke email Anda. Klik tautan itu untuk mengaktifkan akun." };
}

export async function signOut() {
  if (!isDemoMode) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}

export async function requestPasswordReset(_: FormState, formData: FormData): Promise<FormState> {
  if (isDemoMode) return { error: DEMO_MSG };
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Isi email Anda." };
  const origin = (await headers()).get("origin") ?? "";
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/auth/callback?next=/atur-sandi` });
  // Pesan sama untuk email terdaftar maupun tidak, supaya daftar member tidak bisa ditebak.
  return { message: "Jika email ini terdaftar, kami sudah mengirim tautan untuk membuat kata sandi baru. Cek kotak masuk atau folder spam." };
}

export async function setNewPassword(_: FormState, formData: FormData): Promise<FormState> {
  if (isDemoMode) return { error: DEMO_MSG };
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) return { error: "Kata sandi minimal 8 karakter." };
  if (password !== String(formData.get("confirm") ?? "")) return { error: "Kedua kata sandi belum sama." };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message.toLowerCase().includes("different") ? "Gunakan kata sandi yang berbeda dari sebelumnya." : "Tautan sudah kedaluwarsa. Minta tautan baru dari halaman Lupa kata sandi." };
  redirect("/dashboard");
}
