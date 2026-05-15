import { headers } from "next/headers"
import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { getClinicConfig, getBaseUrl } from "@/config/load-config"
import { generateIndividualServiceSchema, generateBreadcrumbSchema } from "@/lib/schema"
import { ServicePageClient } from "./client"

async function getSlugAndConfig() {
  const h = await headers()
  const slug = h.get("x-clinic-slug")
  if (!slug) return null
  const config = await getClinicConfig(slug)
  if (!config) return null
  return { slug, config }
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
): Promise<Metadata> {
  const { id } = await params
  const result = await getSlugAndConfig()
  if (!result) return { title: "No encontrado" }
  const { slug, config } = result
  const service = config.services.find((s) => s.id === id)
  if (!service) return { title: "Servicio no encontrado" }
  const baseUrl = getBaseUrl(slug, config)

  return {
    title: service.name,
    description: service.longDescription || service.description,
    alternates: { canonical: `${baseUrl}/servicios/${id}` },
    openGraph: {
      title: `${service.name} | ${config.name}`,
      description: service.longDescription || service.description,
      locale: "es_ES",
      type: "website",
    },
  }
}

export default async function ServicePage(
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const result = await getSlugAndConfig()
  if (!result) return notFound()
  const { slug, config } = result
  const service = config.services.find((s) => s.id === id)
  if (!service) return notFound()
  const baseUrl = getBaseUrl(slug, config)

  // Find related FAQs (questions mentioning the service name)
  const serviceNameLower = service.name.toLowerCase()
  const relatedFaqs = config.faq.filter(
    (f) =>
      f.question.toLowerCase().includes(serviceNameLower) ||
      f.answer.toLowerCase().includes(serviceNameLower),
  )

  return (
    <>
      {/* JSON-LD: Individual Service */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateIndividualServiceSchema(config, service, baseUrl)),
        }}
      />
      {/* JSON-LD: Breadcrumb */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateBreadcrumbSchema(baseUrl, [
              { name: "Inicio", path: "/" },
              { name: "Servicios", path: "/#servicios" },
              { name: service.name, path: `/servicios/${service.id}` },
            ]),
          ),
        }}
      />

      <div className="pt-24">
        {/* Breadcrumb nav */}
        <nav
          aria-label="Breadcrumb"
          className="bg-neutral border-b border-gray-100"
        >
          <div className="container-wide py-3">
            <ol className="flex items-center gap-2 text-sm text-secondary/50">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Inicio
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  href="/#servicios"
                  className="hover:text-primary transition-colors"
                >
                  Servicios
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-secondary font-medium">{service.name}</li>
            </ol>
          </div>
        </nav>

        {/* Hero */}
        <section className="section-padding bg-neutral">
          <div className="container-wide max-w-4xl">
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-secondary mb-6">
              {service.name}
            </h1>
            <p className="text-lg text-secondary/70 leading-relaxed">
              {service.longDescription || service.description}
            </p>
          </div>
        </section>

        {/* Benefits + CTA */}
        <ServicePageClient
          service={service}
          relatedFaqs={relatedFaqs}
          clinicName={config.name}
          bookingEnabled={config._meta?.bookingEnabled || false}
          whatsapp={config.whatsapp}
          whatsappMessage={config.whatsappMessage}
          phone={config.phone}
        />
      </div>
    </>
  )
}
