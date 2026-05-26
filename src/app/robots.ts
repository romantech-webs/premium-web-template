import { headers } from "next/headers"
import type { MetadataRoute } from "next"
import { getClinicConfig, getBaseUrl } from "@/config/load-config"

// AI crawlers explicitly allowed for Generative Engine Optimization (GEO).
// Listed individually because their default behavior varies — being explicit
// guarantees the site can be cited by AI Overviews, ChatGPT, Claude, Perplexity, etc.
const AI_CRAWLERS = [
  "GPTBot",
  "ClaudeBot",
  "PerplexityBot",
  "Google-Extended",
  "CCBot",
  "anthropic-ai",
  "Applebot-Extended",
]

export default async function robots(): Promise<MetadataRoute.Robots> {
  const h = await headers()
  const slug = h.get("x-clinic-slug")

  if (!slug) {
    return { rules: { userAgent: "*", disallow: "/" } }
  }

  const config = await getClinicConfig(slug)
  if (config?._meta?.noindex) {
    return { rules: { userAgent: "*", disallow: "/" } }
  }

  const baseUrl = getBaseUrl(slug, config)

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
      ...AI_CRAWLERS.map((ua) => ({ userAgent: ua, allow: "/" })),
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
