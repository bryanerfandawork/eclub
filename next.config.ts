import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Unggah gambar QRIS (maks 2 MB) lewat server action.
  experimental: { serverActions: { bodySizeLimit: "3mb" } },
};

export default nextConfig;
