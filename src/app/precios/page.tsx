import { headers } from "next/headers"
import type { Metadata } from "next"
import { getClinicConfig, getBaseUrl } from "@/config/load-config"
import { generateBreadcrumbSchema } from "@/lib/schema"
import CustomPagePage, { generateMetadata as customGenerateMetadata } from "../[slug]/page"
import { PricingTable } from "./PricingTable"

async function getPricingContext() {
  const h = await headers()
  const clinicSlug = h.get("x-clinic-slug")
  if (!clinicSlug) return null
  const config = await getClinicConfig(clinicSlug)
  if (!config?.pricing) return null
  return { clinicSlug, config }
}

export async function generateMetadata(): Promise<Metadata> {
  const ctx = await getPricingContext()
  if (!ctx) {
    return customGenerateMetadata({ params: Promise.resolve({ slug: "precios" }) })
  }
  const { clinicSlug, config } = ctx
  const baseUrl = getBaseUrl(clinicSlug, config)
  const title = `Precios — ${config.name}`
  const description = `Tarifas orientativas de los tratamientos en ${config.name}. ${config.pricing?.description ?? ""}`.trim()
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `${baseUrl}/precios` },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/precios`,
      locale: "es_ES",
      type: "website",
      images: [`${baseUrl}/og-image.jpg`],
    },
  }
}

export default async function PreciosRoute() {
  const ctx = await getPricingContext()
  if (!ctx) {
    return CustomPagePage({ params: Promise.resolve({ slug: "precios" }) })
  }
  const { clinicSlug, config } = ctx
  const baseUrl = getBaseUrl(clinicSlug, config)
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbSchema(baseUrl, [
            { name: "Inicio", path: "/" },
            { name: "Precios", path: "/precios" },
          ])),
        }}
      />
      <PricingTable pricing={config.pricing!} clinic={config} />
    </>
  )
}
