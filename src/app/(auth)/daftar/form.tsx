"use client";

import { useActionState } from "react";
import { MailCheck } from "lucide-react";
import { signUp } from "@/app/actions/auth";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/ui";
import { PasswordInput } from "@/components/password-input";

export function SignUpForm() {
  const [state, action] = useActionState(signUp, undefined);
  if (state?.message) {
    return (
      <div className="card p-6 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gold-soft text-gold">
          <MailCheck className="h-6 w-6" />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-ink">{state.message}</p>
      </div>
    );
  }
  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="label" htmlFor="full_name">Nama lengkap</label>
        <input id="full_name" name="full_name" autoComplete="name" className="input" placeholder="Nama Anda" required />
      </div>
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" className="input" placeholder="nama@email.com" required />
      </div>
      <div>
        <label className="label" htmlFor="password">Kata sandi</label>
        <PasswordInput id="password" name="password" autoComplete="new-password" minLength={8} className="input" placeholder="Minimal 8 karakter" required />
      </div>
      <FormMessage state={state} />
      <SubmitButton className="btn-primary w-full py-3" pendingText="Mendaftar…">Buat akun</SubmitButton>
      <p className="text-center text-xs leading-relaxed text-muted">
        Dengan mendaftar, Anda menyetujui{" "}
        <a href="/syarat-ketentuan" target="_blank" className="font-semibold text-heading hover:underline">Syarat & Ketentuan</a> dan{" "}
        <a href="/kebijakan-privasi" target="_blank" className="font-semibold text-heading hover:underline">Kebijakan Privasi</a> EClub.
      </p>
    </form>
  );
}
