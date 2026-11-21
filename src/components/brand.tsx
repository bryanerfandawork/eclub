"use client";

import { createContext, useContext } from "react";

export type Brand = { logo: string; logoDark: string; icon: string };
const Ctx = createContext<Brand>({ logo: "", logoDark: "", icon: "" });

export function BrandProvider({ value, children }: { value: Brand; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useBrand = () => useContext(Ctx);
