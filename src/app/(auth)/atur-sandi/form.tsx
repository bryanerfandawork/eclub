"use client";

import { useActionState } from "react";
import { setNewPassword } from "@/app/actions/auth";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/ui";

export function NewPasswordForm() {
  const [state, action] = useActionState(setNewPassword, undefined);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="label" htmlFor="password">Kata sandi baru</label>
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} className="input" required />
      </div>
      <div>
        <label className="label" htmlFor="confirm">Ulangi kata sandi</label>
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={8} className="input" required />
      </div>
      <FormMessage state={state} />
      <SubmitButton className="btn-primary w-full py-3">Simpan kata sandi</SubmitButton>
    </form>
  );
}
