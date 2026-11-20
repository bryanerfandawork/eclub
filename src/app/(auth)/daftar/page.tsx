import Link from "next/link";
import { SignUpForm } from "./form";

export const metadata = { title: "Daftar" };

export default function SignUpPage() {
  return (
    <div className="animate-rise">
      <h1 className="text-[28px] font-bold tracking-tight text-heading">Mulai perjalanan Anda</h1>
      <p className="mt-1.5 mb-8 text-muted">Gratis. Hanya butuh satu menit.</p>
      <SignUpForm />
      <p className="mt-6 text-center text-sm text-muted">
        Sudah punya akun?{" "}
        <Link href="/masuk" className="font-semibold text-heading hover:underline">
          Masuk
        </Link>
      </p>
    </div>
  );
}
