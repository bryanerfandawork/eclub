import Link from "next/link";
import { SignInForm } from "./form";

export const metadata = { title: "Masuk" };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <div className="animate-rise">
      <h1 className="text-[28px] font-bold tracking-tight text-navy">Selamat datang kembali</h1>
      <p className="mt-1.5 mb-8 text-muted">Masuk untuk melanjutkan perjalanan Anda.</p>
      <SignInForm initialError={error ? "Tautan konfirmasi tidak valid atau sudah kedaluwarsa." : undefined} />
      <p className="mt-6 text-center text-sm text-muted">
        Belum punya akun?{" "}
        <Link href="/daftar" className="font-semibold text-navy hover:underline">
          Daftar gratis
        </Link>
      </p>
    </div>
  );
}
