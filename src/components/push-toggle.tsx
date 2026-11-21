"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Loader2, Smartphone } from "lucide-react";
import { removePushSubscription, savePushSubscription, testPushToMe } from "@/app/actions/push";

type State = "loading" | "unsupported" | "ios-install" | "denied" | "off" | "on";

function b64ToUint8(base64: string) {
  const pad = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

async function registration() {
  const existing = await navigator.serviceWorker.getRegistration();
  return existing ?? (await navigator.serviceWorker.register("/sw.js"));
}

/** Tombol aktifkan notifikasi HP. variant "card" untuk ajakan di dashboard (hilang bila sudah aktif), "settings" untuk Profil. */
export function PushToggle({ publicKey, variant = "settings" }: { publicKey: string | null; variant?: "card" | "settings" }) {
  const [state, setState] = useState<State>("loading");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
      const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        setState(ios && !standalone ? "ios-install" : "unsupported");
        return;
      }
      if (Notification.permission === "denied") return setState("denied");
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      setState(sub ? "on" : "off");
    })().catch(() => setState("unsupported"));
  }, []);

  async function enable() {
    if (!publicKey) return setMsg("Notifikasi belum siap di server. Coba lagi nanti.");
    setBusy(true);
    setMsg("");
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setState(perm === "denied" ? "denied" : "off");
        return;
      }
      const reg = await registration();
      await navigator.serviceWorker.ready;
      const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToUint8(publicKey) }));
      const r = await savePushSubscription(JSON.parse(JSON.stringify(sub)), navigator.userAgent);
      if (!r.ok) return setMsg(r.error ?? "Gagal mengaktifkan.");
      setState("on");
      await testPushToMe();
    } catch {
      setMsg("Gagal mengaktifkan notifikasi di perangkat ini.");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await removePushSubscription(sub.endpoint);
        await sub.unsubscribe();
      }
      setState("off");
    } finally {
      setBusy(false);
    }
  }

  if (state === "loading") return null;
  if (variant === "card" && (state === "on" || state === "unsupported")) return null;
  if (variant === "card" && state === "denied")
    return (
      <div className="flex items-start gap-4 rounded-2xl border border-gold/40 bg-gold-soft p-5 text-sm">
        <BellOff className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
        <p className="text-heading">
          <b>Penyemangat pagi belum aktif.</b> <span className="text-muted">Notifikasi diblokir di browser ini. Izinkan Notifikasi untuk EClub di pengaturan situs (ikon gembok di samping alamat), lalu muat ulang halaman.</span>
        </p>
      </div>
    );

  if (state === "ios-install") {
    return (
      <div className={variant === "card" ? "flex items-start gap-4 rounded-2xl border border-gold/40 bg-gold-soft p-5" : "flex items-start gap-3 rounded-xl bg-paper p-4"}>
        <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
        <div className="text-sm text-heading">
          <p className="font-bold">Mau dapat penyemangat setiap pagi di iPhone?</p>
          <p className="mt-1 text-muted">
            Buka EClub di Safari, ketuk tombol <b>Bagikan</b> (kotak dengan panah ke atas), pilih <b>Tambah ke Layar Utama</b>. Buka EClub dari ikon di layar utama, lalu aktifkan notifikasi di sini. Butuh iOS 16.4 atau lebih baru.
          </p>
        </div>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-gold/40 bg-gold-soft p-5 sm:flex-row sm:items-center">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand text-white">
          <Bell className="h-5 w-5" />
        </span>
        <div className="flex-1 text-sm">
          <p className="font-bold text-heading">Dapatkan penyemangat setiap pagi</p>
          <p className="mt-0.5 text-muted">Satu kalimat motivasi muncul di HP Anda setiap pukul 07.00 WIB.</p>
          {msg && <p className="mt-1 text-danger">{msg}</p>}
        </div>
        <button onClick={enable} disabled={busy} className="btn-primary">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />} Aktifkan
        </button>
      </div>
    );
  }

  return (
    <div className="card mt-5 p-5 lg:p-7">
      <h2 className="font-bold text-heading">Notifikasi HP</h2>
      <p className="mt-0.5 text-xs text-muted">Penyemangat setiap pagi pukul 07.00 WIB dan kabar penting dari EClub. Berlaku untuk perangkat yang sedang Anda pakai.</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {state === "on" ? (
          <>
            <span className="flex items-center gap-1.5 text-sm font-semibold text-success">
              <Bell className="h-4 w-4" /> Aktif di perangkat ini
            </span>
            <button onClick={disable} disabled={busy} className="btn-ghost py-2 text-sm">
              <BellOff className="h-4 w-4" /> Matikan
            </button>
          </>
        ) : state === "denied" ? (
          <p className="text-sm text-muted">Notifikasi diblokir di browser ini. Buka pengaturan situs di browser Anda, izinkan Notifikasi untuk EClub, lalu muat ulang halaman.</p>
        ) : state === "unsupported" ? (
          <p className="text-sm text-muted">Browser ini belum mendukung notifikasi. Coba buka EClub di Chrome (Android/laptop) atau pasang ke layar utama.</p>
        ) : (
          <button onClick={enable} disabled={busy} className="btn-primary">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />} Aktifkan notifikasi
          </button>
        )}
      </div>
      {msg && <p className="mt-2 text-sm text-danger">{msg}</p>}
    </div>
  );
}
