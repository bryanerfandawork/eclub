"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/** Kolom kata sandi dengan tombol mata untuk melihat/menyembunyikan isinya. */
export function PasswordInput({ className = "input", ...rest }: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input {...rest} type={show ? "text" : "password"} className={`${className} pr-12`} />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute inset-y-0 right-0 grid w-12 place-items-center text-muted hover:text-heading"
        aria-label={show ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
        title={show ? "Sembunyikan" : "Lihat"}
      >
        {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );
}
