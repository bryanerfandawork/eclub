"use client";

import { useActionState } from "react";
import { uploadQris } from "@/app/actions/admin";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/ui";

export function QrisForm({ current }: { current: string }) {
  const [state, action] = useActionState(uploadQris, undefined);
  return (
    <form action={action} className="card mt-5 flex flex-wrap items-center gap-4 p-5 lg:p-6">
      {current ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={current} alt="QRIS" className="h-24 w-24 rounded-lg border border-line object-contain" />
      ) : (
        <div className="grid h-24 w-24 place-items-center rounded-lg border border-dashed border-line text-xs text-muted">Belum ada</div>
      )}
      <div className="min-w-0 flex-1">
        <p className="font-bold text-heading">Gambar QRIS</p>
        <p className="text-xs text-muted">Unggah gambar QRIS usaha Anda (PNG/JPG, maks 2 MB). Tampil di halaman pembayaran.</p>
        <input type="file" name="qris" accept="image/png,image/jpeg,image/webp" className="mt-2 block w-full text-sm" />
        <FormMessage state={state} />
      </div>
      <SubmitButton>Unggah QRIS</SubmitButton>
    </form>
  );
}
