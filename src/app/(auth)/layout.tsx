import Link from "next/link";
import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-brand p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -top-32 -right-24 h-96 w-96 rounded-full bg-gold/20 blur-3xl" />
        <Link href="/">
          <Logo light />
        </Link>
        <div className="relative">
          <p className="eyebrow">Personal Growth Companion</p>
          <h2 className="mt-4 max-w-md text-4xl leading-tight font-bold tracking-tight">
            Find Your Path.
            <br />
            <span className="text-gold">Build Your Success.</span>
          </h2>
          <p className="mt-4 max-w-md leading-relaxed text-white/70">
            Setiap orang punya definisi sukses masing-masing. EClub membantu Anda menemukannya, merencanakannya, dan mewujudkannya.
          </p>
        </div>
        <p className="text-sm text-white/50">© {new Date().getFullYear()} EClub Indonesia</p>
      </aside>
      <main className="flex flex-col px-6 py-8 sm:px-10">
        <Link href="/" className="lg:hidden">
          <Logo />
        </Link>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">{children}</div>
      </main>
    </div>
  );
}
