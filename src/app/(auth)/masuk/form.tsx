"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn } from "@/app/actions/auth";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/ui";
import { PasswordInput } from "@/components/password-input";

export function SignInForm({ initialError }: { initialError?: string }) {
  const [state, action] = useActionState(signIn, initialError ? { error: initialError } : undefined);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" className="input" placeholder="nama@email.com" required />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label className="label" htmlFor="password">Kata sandi</label>
          <Link href="/lupa-sandi" className="mb-1.5 text-xs font-medium text-muted hover:text-brand">Lupa kata sandi?</Link>
        </div>
        <PasswordInput id="password" name="password" autoComplete="current-password" className="input" required />
      </div>
      <FormMessage state={state} />
      <SubmitButton className="btn-primary w-full py-3" pendingText="Masuk…">Masuk</SubmitButton>
    </form>
  );
}
