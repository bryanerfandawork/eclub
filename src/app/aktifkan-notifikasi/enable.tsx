"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Loader2, Share, SquarePlus } from "lucide-react";
import { savePushSubscription, skipPushStep, testPushToMe } from "@/app/actions/push";

type State = "loading" | "ready" | "ios-install" | "unsupported" | "denied";

function b64ToUint8(base64: string) {
  const pad = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

export function EnablePush({ publicKey, next }: { publicKey: string | null; next: string }) {
  const router = useRouter();
  const [state, setState] = useState<State>("loading");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
    const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    if (ios && !standalone) setState("ios-install");
    else if (!supported) setState("unsupported");
    else if (Notification.permission === "denied") setState("denied");
    else setState("ready");
  }, []);

  async function enable() {
    if (!publicKey) return setMsg("Server notifikasi belum siap. Coba muat ulang halaman sebentar lagi.");
    setBusy(true);
    setMsg("");
    try {
      const perm = await Notification.requestPermission();
      if (perm === "denied") return setState("denied");
      if (perm !== "granted") return setMsg("Pilih \"Izinkan\" (Allow) agar notifikasi bisa aktif.");
      const reg = (await navigator.serviceWorker.getRegistration()) ?? (await navigator.serviceWorker.register("/sw.js"));
      await navigator.serviceWorker.ready;
      const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToUint8(publicKey) }));
      const r = await savePushSubscription(JSON.parse(JSON.stringify(sub)), navigator.userAgent);
      if (!r.ok) return setMsg(r.error ?? "Gagal mengaktifkan. Coba lagi.");
      await testPushToMe();
      router.replace(next);
      router.refresh();
    } catch {
      setMsg("Gagal mengaktifkan di perangkat ini. Coba lagi, atau buka EClub di Chrome.");
    } finally {
      setBusy(false);
    }
  }

  const skip = (
    <form action={skipPushStep.bind(null, next)} className="mt-4 text-center">
      <button className="text-sm font-medium text-muted underline hover:text-brand">Lanjutkan tanpa notifikasi</button>
    </form>
  );

  if (state === "loading") return <div className="card mt-6 h-40 animate-pulse" />;

  if (state === "ios-install")
    return (
      <div className="card mt-6 p-5 lg:p-7">
        <p className="font-bold text-heading">Di iPhone, pasang EClub ke layar utama dulu</p>
        <ol className="mt-4 space-y-3 text-sm text-ink">
          <li className="flex gap-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand text-xs font-bold text-white">1</span>
            <span>Buka halaman ini di <b>Safari</b>.</span>
          </li>
          <li className="flex gap-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand text-xs font-bold text-white">2</span>
            <span>
              Ketuk tombol <b>Bagikan</b> <Share className="inline h-4 w-4 text-brand" /> di bawah layar.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand text-xs font-bold text-white">3</span>
            <span>
              Pilih <b>Tambah ke Layar Utama</b> <SquarePlus className="inline h-4 w-4 text-brand" />, lalu ketuk <b>Tambah</b>.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand text-xs font-bold text-white">4</span>
            <span>Buka EClub dari ikon di layar utama, lalu aktifkan notifikasi di halaman ini.</span>
          </li>
        </ol>
        <p className="mt-4 text-xs text-muted">Butuh iOS 16.4 atau lebih baru (Pengaturan, Umum, Info).</p>
        {skip}
      </div>
    );

  if (state === "unsupported" || state === "denied")
    return (
      <div className="card mt-6 p-5 lg:p-7">
        <p className="font-bold text-heading">{state === "denied" ? "Notifikasi diblokir di browser ini" : "Browser ini belum mendukung notifikasi"}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {state === "denied"
            ? "Buka pengaturan situs di browser (ikon gembok di samping alamat), ubah Notifikasi menjadi Izinkan, lalu muat ulang halaman ini."
            : "Coba buka EClub di Chrome (Android atau laptop), atau pasang EClub ke layar utama HP Anda."}
        </p>
        {state === "denied" && (
          <button onClick={() => location.reload()} className="btn-primary mt-4 w-full py-3">
            Sudah diizinkan, muat ulang
          </button>
        )}
        {skip}
      </div>
    );

  return (
    <div className="card mt-6 p-5 text-center lg:p-7">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-gold-soft text-brand">
        <Bell className="h-8 w-8" />
      </span>
      <p className="mt-4 text-sm text-muted">Setelah tombol diklik, pilih <b>Izinkan</b> (Allow) pada jendela yang muncul.</p>
      <button onClick={enable} disabled={busy} className="btn-primary mt-5 w-full py-3.5 text-[15px]">
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Bell className="h-5 w-5" />} Aktifkan notifikasi
      </button>
      {msg && <p className="mt-3 text-sm text-danger">{msg}</p>}
    </div>
  );
}
