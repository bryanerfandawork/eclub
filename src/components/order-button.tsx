"use client";

import { useActionState } from "react";
import { startOrder } from "@/app/actions/orders";
import { SubmitButton } from "./submit-button";
import { FormMessage } from "./ui";

export function OrderButton({ product, slug, label, className = "btn-primary w-full py-3" }: { product: string; slug?: string; label: string; className?: string }) {
  const [state, action] = useActionState(startOrder, undefined);
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="product" value={product} />
      {slug && <input type="hidden" name="slug" value={slug} />}
      <SubmitButton className={className} pendingText="Membuat pesanan…">{label}</SubmitButton>
      <FormMessage state={state} />
    </form>
  );
}
