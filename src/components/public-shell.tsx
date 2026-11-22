import Link from "next/link";
import { Logo } from "@/components/logo";

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-paper">
      <header className="sticky top-0 z-30 border-b border-line/60 bg-paper/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5">
          <Link href="/">
            <Logo />
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/kelas" className="btn hidden text-heading hover:bg-white md:inline-flex">Kelas</Link>
            <Link href="/artikel" className="btn hidden text-heading hover:bg-white sm:inline-flex">Artikel</Link>
            <Link href="/masuk" className="btn text-heading hover:bg-white">Masuk</Link>
            <Link href="/daftar" className="btn-primary">Daftar gratis</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-10 lg:py-14">{children}</main>
      <footer className="border-t border-line bg-white py-8 text-center text-sm text-muted">
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
          <Link href="/artikel" className="hover:text-brand">Artikel</Link>
          <Link href="/kelas" className="hover:text-brand">Kelas</Link>
          <Link href="/acara" className="hover:text-brand">Event</Link>
          <Link href="/syarat-affiliate" className="hover:text-brand">Program Affiliate</Link>
          <Link href="/kebijakan-privasi" className="hover:text-brand">Kebijakan Privasi</Link>
          <Link href="/syarat-ketentuan" className="hover:text-brand">Syarat & Ketentuan</Link>
        </div>
        <p className="mt-3">© {new Date().getFullYear()} EClub Indonesia</p>
      </footer>
    </div>
  );
}
