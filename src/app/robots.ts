import { headers } from "next/headers"
import type { MetadataRoute } from "next"

export default async function robots(): Promise<MetadataRoute.Robots> {
  const h = await headers()
  const slug = h.get("x-clinic-slug")

  if (!slug) {
    return { rules: { userAgent: "*", disallow: "/" } }
  }

  const baseUrl = `https://${slug}.romantechwebs.com`

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
