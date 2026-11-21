import Link from "next/link";
import { ResetForm } from "./form";

export const metadata = { title: "Lupa kata sandi" };

export default function ForgotPage() {
  return (
    <div className="animate-rise">
      <h1 className="text-[28px] font-bold tracking-tight text-heading">Lupa kata sandi?</h1>
      <p className="mt-1.5 mb-8 text-muted">Masukkan email akun Anda. Kami kirim tautan untuk membuat kata sandi baru.</p>
      <ResetForm />
      <p className="mt-6 text-center text-sm text-muted">
        Sudah ingat?{" "}
        <Link href="/masuk" className="font-semibold text-heading hover:underline">
          Kembali masuk
        </Link>
      </p>
    </div>
  );
}
