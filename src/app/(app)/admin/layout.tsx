import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getAccount, isAdmin } from "@/lib/plans";
import { AdminTabs } from "./tabs";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const account = await getAccount();
  if (!isAdmin(account.role)) notFound();
  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" /> {account.role === "super_admin" ? "Super Admin" : "Admin"}
          </p>
          <h1 className="mt-1 text-[26px] font-bold tracking-tight text-heading lg:text-[32px]">Panel Admin</h1>
        </div>
        <Link href="/dashboard" className="text-sm font-medium text-muted hover:text-brand">
          Kembali ke aplikasi
        </Link>
      </div>
      <AdminTabs />
      <div className="mt-6">{children}</div>
    </>
  );
}
