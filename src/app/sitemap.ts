import { headers } from "next/headers"
import type { MetadataRoute } from "next"
import { getClinicConfig, getBaseUrl } from "@/config/load-config"

// Evaluated once per deployment (module load), NOT per request — gives a stable
// `lastmod` instead of a timestamp that changes on every crawl.
const BUILD_DATE = new Date()

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const h = await headers()
  const slug = h.get("x-clinic-slug")

  if (!slug) return []

  const config = await getClinicConfig(slug)
  const baseUrl = getBaseUrl(slug, config)

  const serviceUrls: MetadataRoute.Sitemap = (config?.services || []).map((s) => ({
    url: `${baseUrl}/servicios/${s.id}`,
    lastModified: BUILD_DATE,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  const customPageUrls: MetadataRoute.Sitemap = Object.keys(config?.pages || {}).map((slug) => ({
    url: `${baseUrl}/${slug}`,
    lastModified: BUILD_DATE,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  const blogPosts = config?.blog?.posts || {}
  const blogUrls: MetadataRoute.Sitemap = Object.entries(blogPosts).map(([slug, post]) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: post.modifiedDate ? new Date(post.modifiedDate) : (post.publishedDate ? new Date(post.publishedDate) : BUILD_DATE),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }))
  const hasBlog = Object.keys(blogPosts).length > 0
  const blogIndexEntry: MetadataRoute.Sitemap = hasBlog ? [{
    url: `${baseUrl}/blog`,
    lastModified: BUILD_DATE,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }] : []

  // /reservar only exists as a real conversion page when booking is enabled.
  const reservarEntry: MetadataRoute.Sitemap = config?._meta?.bookingEnabled ? [{
    url: `${baseUrl}/reservar`,
    lastModified: BUILD_DATE,
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }] : []

  return [
    { url: baseUrl, lastModified: BUILD_DATE, changeFrequency: "monthly", priority: 1 },
    ...reservarEntry,
    { url: `${baseUrl}/contacto`, lastModified: BUILD_DATE, changeFrequency: "monthly", priority: 0.8 },
    ...serviceUrls,
    ...customPageUrls,
    ...blogIndexEntry,
    ...blogUrls,
    { url: `${baseUrl}/aviso-legal`, lastModified: BUILD_DATE, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/privacidad`, lastModified: BUILD_DATE, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/cookies`, lastModified: BUILD_DATE, changeFrequency: "yearly", priority: 0.3 },
  ]
}
