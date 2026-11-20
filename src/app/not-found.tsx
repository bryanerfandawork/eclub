import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center p-6 text-center">
      <div>
        <p className="eyebrow">404</p>
        <h1 className="mt-2 text-2xl font-bold text-navy">Halaman tidak ditemukan</h1>
        <Link href="/" className="btn-primary mt-6">Kembali ke beranda</Link>
      </div>
    </div>
  );
}
