"use client";

import { useActionState } from "react";
import { setNewPassword } from "@/app/actions/auth";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/ui";
import { PasswordInput } from "@/components/password-input";

export function NewPasswordForm() {
  const [state, action] = useActionState(setNewPassword, undefined);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="label" htmlFor="password">Kata sandi baru</label>
        <PasswordInput id="password" name="password" autoComplete="new-password" minLength={8} className="input" required />
      </div>
      <div>
        <label className="label" htmlFor="confirm">Ulangi kata sandi</label>
        <PasswordInput id="confirm" name="confirm" autoComplete="new-password" minLength={8} className="input" required />
      </div>
      <FormMessage state={state} />
      <SubmitButton className="btn-primary w-full py-3">Simpan kata sandi</SubmitButton>
    </form>
  );
}
