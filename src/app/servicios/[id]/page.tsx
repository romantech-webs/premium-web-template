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

  const description = service.seoMetaDescription || service.description
  return {
    title: service.seoTitle ? { absolute: service.seoTitle } : service.name,
    description,
    alternates: { canonical: `${baseUrl}/servicios/${id}` },
    openGraph: {
      title: service.seoTitle || `${service.name} | ${config.name}`,
      description,
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

  // Prefer service-specific FAQs; fall back to global ones mentioning the service name
  const serviceNameLower = service.name.toLowerCase()
  const relatedFaqs = service.faq && service.faq.length > 0
    ? service.faq
    : config.faq.filter(
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
              {service.h1 || service.name}
            </h1>
            <div className="text-lg text-secondary/70 leading-relaxed whitespace-pre-line">
              {service.longDescription || service.description}
            </div>
          </div>
        </section>

        {/* Process steps */}
        {service.process && service.process.length > 0 && (
          <section className="section-padding bg-white">
            <div className="container-wide max-w-4xl">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-secondary mb-8">
                Cómo lo hago
              </h2>
              <ol className="space-y-4">
                {service.process.map((step, i) => (
                  <li key={i} className="flex gap-4 p-4 bg-neutral rounded-xl">
                    <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <p className="text-secondary/80 leading-relaxed pt-1">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

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
