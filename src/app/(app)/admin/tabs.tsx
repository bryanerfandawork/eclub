"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", label: "Ringkasan" },
  { href: "/admin/pengguna", label: "Pengguna" },
  { href: "/admin/kursus", label: "Course" },
  { href: "/admin/artikel", label: "Artikel" },
  { href: "/admin/pesanan", label: "Pesanan" },
  { href: "/admin/jadwal", label: "Mentoring & Event" },
  { href: "/admin/affiliate", label: "Affiliate" },
  { href: "/admin/kolaborasi", label: "Kolaborasi" },
  { href: "/admin/notifikasi", label: "Notifikasi" },
  { href: "/admin/blasting", label: "Blasting" },
  { href: "/admin/paket", label: "Pengaturan" },
  { href: "/admin/testimoni", label: "Testimoni" },
];

export function AdminTabs() {
  const path = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto rounded-xl border border-line bg-white p-1">
      {TABS.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={`rounded-lg px-4 py-2 text-sm font-semibold whitespace-nowrap transition ${
            (t.href === "/admin" ? path === t.href : path.startsWith(t.href)) ? "bg-brand text-white" : "text-muted hover:bg-paper hover:text-heading"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
