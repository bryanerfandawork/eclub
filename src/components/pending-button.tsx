"use client";

import { useFormStatus } from "react-dom";

/** Tombol di dalam form yang langsung berubah saat ditekan (tanpa menunggu server). */
export function PendingButton({ className, pendingClassName = "opacity-60 animate-pulse", children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { pendingClassName?: string }) {
  const { pending } = useFormStatus();
  return (
    <button {...rest} disabled={pending || rest.disabled} className={`${className ?? ""} ${pending ? pendingClassName : ""}`}>
      {children}
    </button>
  );
}
