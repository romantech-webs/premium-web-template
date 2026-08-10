import { headers } from "next/headers"
import Link from "next/link"
import type { Metadata } from "next"
import { ChevronRight } from "lucide-react"
import { getClinicConfig, getBaseUrl } from "@/config/load-config"
import { generateBreadcrumbSchema } from "@/lib/schema"
import { Team } from "@/components/sections/Team"
import CustomPagePage, { generateMetadata as customGenerateMetadata } from "../[slug]/page"

async function getTeamContext() {
  const h = await headers()
  const clinicSlug = h.get("x-clinic-slug")
  if (!clinicSlug) return null
  const config = await getClinicConfig(clinicSlug)
  if (!config?.team?.length) return null
  return { clinicSlug, config }
}

export async function generateMetadata(): Promise<Metadata> {
  const ctx = await getTeamContext()
  if (!ctx) {
    return customGenerateMetadata({ params: Promise.resolve({ slug: "equipo" }) })
  }
  const { clinicSlug, config } = ctx
  const baseUrl = getBaseUrl(clinicSlug, config)
  const title = `Equipo — ${config.name}`
  const description =
    config.sectionCopy.teamDescription
    || `Conoce al equipo de ${config.name}: ${config.team.map(m => m.name).join(", ")}.`
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `${baseUrl}/equipo` },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/equipo`,
      locale: "es_ES",
      type: "website",
      images: [`${baseUrl}/og-image.jpg`],
    },
  }
}

export default async function EquipoRoute() {
  const ctx = await getTeamContext()
  // No team in the config → fall back to a custom page named "equipo", if any.
  if (!ctx) {
    return CustomPagePage({ params: Promise.resolve({ slug: "equipo" }) })
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
            { name: "Equipo", path: "/equipo" },
          ])),
        }}
      />
      <section className="pt-28 pb-0 bg-neutral">
        <div className="container-wide">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-secondary/50">
            <Link href="/" className="hover:text-primary transition-colors">Inicio</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-secondary font-medium">Equipo</span>
          </nav>
        </div>
      </section>
      <Team asPage />
    </>
  )
}
