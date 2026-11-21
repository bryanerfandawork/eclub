import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.eclub.co.id";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: ["/", "/artikel", "/kebijakan-privasi", "/syarat-ketentuan", "/cek-sertifikat"], disallow: ["/admin", "/api", "/dashboard", "/pesanan", "/beli"] },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
