"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Crown,
  LayoutGrid,
  LogOut,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { PlanBadge } from "./plan-badge";
import { InstallPrompt } from "./install-prompt";
import { NavProgress } from "./nav-progress";
import { Suspense } from "react";
import { AiChat } from "./ai-chat";
import { Logo } from "./logo";
import { StepBar } from "./step-bar";
import { mobileNav, sidebarNav } from "./nav-config";
import { signOut } from "@/app/actions/auth";

function isActive(pathname: string, href: string) {
  const base = href.split("#")[0];
  if (href.includes("#")) return false;
  return pathname === base || pathname.startsWith(base + "/");
}

export function AppShell({
  children,
  name,
  email,
  demo,
  plan,
  admin,
  ai = true,
}: {
  children: React.ReactNode;
  name: string;
  email: string;
  demo: boolean;
  plan: "free" | "plus";
  admin: boolean;
  ai?: boolean;
}) {
  const pathname = usePathname();
  const [aiOpen, setAiOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-dvh lg:pl-[264px] print:pl-0">
      <Suspense fallback={null}>
        <NavProgress />
      </Suspense>
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden print:!hidden w-[264px] flex-col border-r border-line bg-white lg:flex">
        <div className="px-6 pt-6 pb-4">
          <Link href="/dashboard">
            <Logo />
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          {sidebarNav.map((group) => (
            <div key={group.section} className="mt-4">
              <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted/80">
                {group.section}
              </p>
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                const Icon = item.icon;
                const cls = `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition ${
                  active
                    ? "bg-brand text-white shadow-soft"
                    : "text-ink/80 hover:bg-paper hover:text-heading"
                }`;
                const inner = (
                  <>
                    <Icon
                      className={`h-[18px] w-[18px] ${active ? "text-gold" : "text-muted group-hover:text-heading"}`}
                      strokeWidth={1.8}
                    />
                    <span className="flex-1">{item.label}</span>
                    {item.soon && (
                      <span className="rounded-full bg-paper px-2 py-0.5 text-[10px] font-semibold text-muted">
                        Segera
                      </span>
                    )}
                  </>
                );
                return item.soon ? (
                  <span
                    key={item.label}
                    className={`${cls} cursor-default opacity-70 hover:bg-transparent`}
                  >
                    {inner}
                  </span>
                ) : (
                  <Link key={item.label} href={item.href} className={cls}>
                    {inner}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="space-y-1 px-3 pb-3">
          {plan === "free" && !admin && (
            <Link
              href="/paket"
              className="flex items-center gap-3 rounded-xl bg-gold-soft px-3 py-2.5 text-[14px] font-semibold text-brand hover:brightness-95"
            >
              <Crown className="h-[18px] w-[18px] text-gold" /> Upgrade ke Plus
            </Link>
          )}
          {admin && (
            <Link
              href="/admin"
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition ${
                pathname.startsWith("/admin")
                  ? "bg-brand text-white"
                  : "text-ink/80 hover:bg-paper hover:text-brand"
              }`}
            >
              <ShieldCheck
                className={`h-[18px] w-[18px] ${pathname.startsWith("/admin") ? "text-gold" : "text-muted"}`}
                strokeWidth={1.8}
              />{" "}
              Panel Admin
            </Link>
          )}
        </div>
        <div className="border-t border-line p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-gold-soft text-sm font-bold text-heading">
              {initials || "E"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-heading">
                <span className="truncate">{name}</span>{" "}
                {admin ? (
                  <span className="rounded-full bg-brand px-2.5 py-0.5 text-[11px] font-bold text-gold">
                    Admin
                  </span>
                ) : (
                  <PlanBadge plan={plan} />
                )}
              </p>
              <p className="truncate text-xs text-muted">{email}</p>
            </div>
            <form action={signOut}>
              <button
                className="rounded-lg p-2 text-muted hover:bg-paper hover:text-heading"
                title="Keluar"
                aria-label="Keluar"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Header mobile */}
      <header className="print:hidden sticky top-0 z-20 flex items-center justify-between border-b border-line/70 bg-paper/85 px-5 py-3 backdrop-blur-xl lg:hidden">
        <Link href="/dashboard">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex h-9 items-center gap-1.5 rounded-full border border-line bg-white px-3 text-xs font-semibold text-heading"
            aria-label="Semua menu"
          >
            <LayoutGrid className="h-4 w-4 text-brand" /> Menu
          </button>
          <Link
            href="/profile"
            className="grid h-9 w-9 place-items-center rounded-full bg-gold-soft text-xs font-bold text-heading"
            aria-label="Profil"
          >
            {initials || "E"}
          </Link>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-paper px-5 pt-4 pb-28 lg:hidden">
          <div className="flex items-center justify-between">
            <Logo />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="grid h-10 w-10 place-items-center rounded-full bg-white text-heading shadow-soft"
              aria-label="Tutup menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {sidebarNav.map((group) => (
            <div key={group.section} className="mt-6">
              <p className="eyebrow mb-2">{group.section}</p>
              <div className="grid grid-cols-3 gap-2.5">
                {group.items
                  .filter((i) => !i.soon)
                  .map((item) => {
                    const Icon = item.icon;
                    const active = isActive(pathname, item.href);
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className={`flex flex-col items-center gap-2 rounded-2xl border p-3 text-center transition active:scale-95 ${active ? "border-brand bg-brand text-white" : "border-line bg-white"}`}
                      >
                        <Icon
                          className={`h-6 w-6 ${active ? "text-gold" : "text-brand"}`}
                          strokeWidth={1.8}
                        />
                        <span
                          className={`text-[11px] leading-tight font-semibold ${active ? "text-white" : "text-heading"}`}
                        >
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
              </div>
            </div>
          ))}
          <div className="mt-6 grid grid-cols-2 gap-2.5">
            {plan === "free" && !admin && (
              <Link
                href="/paket"
                onClick={() => setMenuOpen(false)}
                className="btn-gold"
              >
                <Crown className="h-4 w-4" /> Upgrade ke Plus
              </Link>
            )}
            {admin && (
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="btn-ghost"
              >
                <ShieldCheck className="h-4 w-4" /> Panel Admin
              </Link>
            )}
          </div>
        </div>
      )}

      {demo && (
        <div className="print:hidden border-b border-gold/30 bg-gold-soft px-5 py-2 text-center text-xs font-medium text-heading">
          Mode demo · Anda melihat data contoh. Data asli aktif setelah database
          disambungkan.
        </div>
      )}

      <main className="mx-auto w-full max-w-6xl px-5 pt-6 pb-32 lg:px-10 lg:pt-10 lg:pb-16 print:p-0">
        <StepBar />
        {children}
      </main>

      {/* AI Companion (disembunyikan dari member bila kunci AI belum dipasang; admin tetap melihat) */}
      {(ai || admin) && (
        <button
          onClick={() => setAiOpen(true)}
          className="print:hidden fixed right-5 bottom-[92px] z-30 grid h-14 w-14 place-items-center rounded-full bg-gold text-heading shadow-lift transition hover:scale-105 active:scale-95 lg:right-8 lg:bottom-8"
          aria-label="AI Companion"
        >
          <Sparkles className="h-6 w-6" strokeWidth={2} />
        </button>
      )}
      {aiOpen && <AiChat onClose={() => setAiOpen(false)} />}

      <InstallPrompt />

      {/* Bottom nav mobile */}
      <nav className="print:hidden pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur-xl lg:hidden">
        <ul className="mx-auto grid max-w-md grid-cols-5 px-2 pt-1.5">
          {mobileNav.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex flex-col items-center gap-1 py-1.5"
                >
                  <span
                    className={`grid h-8 w-14 place-items-center rounded-full transition ${active ? "bg-brand text-gold" : "text-muted"}`}
                  >
                    <Icon
                      className="h-[20px] w-[20px]"
                      strokeWidth={active ? 2.2 : 1.8}
                    />
                  </span>
                  <span
                    className={`text-[11px] font-semibold ${active ? "text-heading" : "text-muted"}`}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
