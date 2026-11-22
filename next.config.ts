import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Unggah gambar QRIS (maks 2 MB) lewat server action.
  experimental: { serverActions: { bodySizeLimit: "3mb" } },
  // Nama tes di tampilan: "Tes Gaya Diri". Tautan lama /disc tetap jalan.
  async redirects() {
    return [{ source: "/disc", destination: "/gaya-diri", permanent: true }];
  },
};

export default nextConfig;
