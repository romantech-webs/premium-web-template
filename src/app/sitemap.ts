import { headers } from "next/headers"
import type { MetadataRoute } from "next"
import { getClinicConfig, getBaseUrl } from "@/config/load-config"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const h = await headers()
  const slug = h.get("x-clinic-slug")

  if (!slug) return []

  const config = await getClinicConfig(slug)
  const baseUrl = getBaseUrl(slug, config)

  const serviceUrls: MetadataRoute.Sitemap = (config?.services || []).map((s) => ({
    url: `${baseUrl}/servicios/${s.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${baseUrl}/reservar`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/contacto`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    ...serviceUrls,
    { url: `${baseUrl}/aviso-legal`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/privacidad`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/cookies`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ]
}
