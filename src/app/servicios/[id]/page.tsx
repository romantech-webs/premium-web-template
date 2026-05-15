import { headers } from "next/headers"
import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { getClinicConfig, getBaseUrl } from "@/config/load-config"
import { generateIndividualServiceSchema, generateBreadcrumbSchema } from "@/lib/schema"
import { Phone, Star, Shield, Clock, CheckCircle2, ChevronRight, MessageCircle, Wrench, Euro, Timer } from "lucide-react"

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
      images: [`${baseUrl}/og-image.jpg`],
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

  const whatsappUrl = `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(config.whatsappMessage)}`
  const phoneClean = config.phone.replace(/\s/g, "")

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateIndividualServiceSchema(config, service, baseUrl)),
        }}
      />
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

      {/* Hero band */}
      <section className="relative pt-32 pb-12 bg-gradient-to-br from-neutral via-white to-primary/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/[0.04] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/[0.05] rounded-full blur-[100px] translate-y-1/3" />

        <div className="container max-w-5xl mx-auto px-4 relative">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-secondary/50 mb-8">
            <Link href="/" className="hover:text-primary transition-colors">Inicio</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/#servicios" className="hover:text-primary transition-colors">Servicios</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-secondary font-medium">{service.name}</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full mb-5">
                <Wrench className="w-3.5 h-3.5" />
                Servicio profesional
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-secondary leading-[1.05] mb-5 text-balance">
                {service.h1 || service.name}
              </h1>

              <p className="text-lg sm:text-xl text-secondary/70 leading-relaxed max-w-3xl">
                {service.description}
              </p>

              {/* Benefits inline */}
              {service.benefits && service.benefits.length > 0 && (
                <ul className="flex flex-wrap gap-2 mt-6">
                  {service.benefits.map((b, i) => (
                    <li
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-primary/15 text-secondary/85 text-sm rounded-full shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="hidden lg:flex flex-col gap-2 shrink-0">
              <a
                href={`tel:${phoneClean}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary text-white font-bold rounded-lg hover:bg-secondary transition-colors shadow-lg shadow-primary/20"
              >
                <Phone className="w-4 h-4" />
                {config.phone}
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#25D366] text-white text-sm font-semibold rounded-lg hover:bg-[#1faa54] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            </div>
          </div>

          {/* Trust strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-10 pt-8 border-t border-secondary/10">
            <div className="flex items-center gap-2.5">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400 shrink-0" />
              <div className="text-xs sm:text-sm">
                <div className="font-bold text-secondary">{config.reviews.rating} · {config.reviews.count} reseñas</div>
                <div className="text-secondary/50 text-[11px]">Google</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-primary shrink-0" />
              <div className="text-xs sm:text-sm">
                <div className="font-bold text-secondary">Autónomo profesional</div>
                <div className="text-secondary/50 text-[11px]">Factura + IVA</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-accent shrink-0" />
              <div className="text-xs sm:text-sm">
                <div className="font-bold text-secondary">Mismo día</div>
                <div className="text-secondary/50 text-[11px]">Disponibilidad</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <div className="text-xs sm:text-sm">
                <div className="font-bold text-secondary">Presupuesto cerrado</div>
                <div className="text-secondary/50 text-[11px]">Sin sorpresas</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Price + Time band */}
      {(service.priceFrom || service.timeEstimate) && (
        <section className="bg-white border-b border-secondary/10">
          <div className="container max-w-5xl mx-auto px-4 py-7">
            <div className="grid sm:grid-cols-3 gap-4 items-center">
              {service.priceFrom && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Euro className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-secondary/50 font-bold">Desde</div>
                    <div className="text-2xl font-display font-bold text-secondary">{service.priceFrom}</div>
                  </div>
                </div>
              )}
              {service.timeEstimate && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <Timer className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-secondary/50 font-bold">Tiempo medio</div>
                    <div className="text-lg font-display font-bold text-secondary">{service.timeEstimate}</div>
                  </div>
                </div>
              )}
              <div className="flex justify-start sm:justify-end">
                <a
                  href={`tel:${phoneClean}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-secondary transition-colors text-sm whitespace-nowrap"
                >
                  <Phone className="w-4 h-4" />
                  Pedir presupuesto
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Long description */}
      {service.longDescription && (
        <section className="py-14 bg-white">
          <div className="container max-w-3xl mx-auto px-4">
            <div className="text-base sm:text-lg text-secondary/85 leading-relaxed whitespace-pre-line">
              {service.longDescription}
            </div>
          </div>
        </section>
      )}

      {/* Process steps */}
      {service.process && service.process.length > 0 && (
        <section className="py-14 bg-neutral">
          <div className="container max-w-4xl mx-auto px-4">
            <div className="text-center mb-10">
              <div className="inline-block px-3 py-1 bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider rounded-full mb-3">
                Cómo trabajo
              </div>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-secondary">
                El proceso, paso a paso
              </h2>
            </div>
            <ol className="grid sm:grid-cols-2 gap-5 sm:gap-6">
              {service.process.map((step, i) => (
                <li
                  key={i}
                  className="relative p-6 sm:p-7 pt-9 bg-white rounded-2xl border border-secondary/5 hover:border-primary/30 hover:shadow-lg transition-all"
                >
                  <div className="absolute -top-5 -left-5 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary text-white font-display font-bold text-xl flex items-center justify-center shadow-lg shadow-primary/30">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <p className="text-secondary/85 leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* FAQs */}
      {relatedFaqs.length > 0 && (
        <section className="py-14 bg-white">
          <div className="container max-w-3xl mx-auto px-4">
            <div className="text-center mb-10">
              <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full mb-3">
                Resuelvo dudas
              </div>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-secondary">
                Preguntas frecuentes
              </h2>
            </div>
            <div className="space-y-3">
              {relatedFaqs.map((faq, i) => (
                <details
                  key={i}
                  open={i === 0}
                  className="group bg-neutral rounded-xl border border-secondary/5 overflow-hidden hover:border-primary/20 transition-colors"
                >
                  <summary className="font-semibold text-secondary cursor-pointer text-base sm:text-lg list-none p-5 flex items-center justify-between gap-4 hover:bg-secondary/[0.02]">
                    <span className="flex-1">{faq.question}</span>
                    <ChevronRight className="w-4 h-4 text-primary shrink-0 transition-transform group-open:rotate-90" />
                  </summary>
                  <div className="px-5 pb-5 text-secondary/75 leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="py-16 bg-white">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="p-8 sm:p-12 bg-gradient-to-br from-secondary via-secondary to-primary text-white rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/40 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-accent/30 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
            <div className="relative">
              <div className="inline-block px-3 py-1 bg-accent text-white text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                Atención inmediata
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-4 leading-tight">
                ¿Necesitas {service.name.toLowerCase()}?
              </h2>
              <p className="opacity-90 mb-7 text-base sm:text-lg max-w-2xl">
                Llamada directa, sin centralitas. Diagnostico tu caso, te paso un presupuesto cerrado y solo empiezo cuando lo apruebas.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={`tel:${phoneClean}`}
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-secondary font-bold rounded-xl hover:bg-neutral shadow-xl transition-all hover:scale-[1.02]"
                >
                  <Phone className="w-5 h-5" />
                  <span>{config.phone}</span>
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#25D366] text-white font-bold rounded-xl hover:bg-[#1faa54] shadow-xl transition-all hover:scale-[1.02]"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Related links */}
          <nav className="mt-10 pt-8 border-t border-secondary/10 flex flex-wrap gap-3 text-sm">
            <Link href="/" className="text-secondary/60 hover:text-primary transition-colors">← Volver al inicio</Link>
            <span className="text-secondary/20">·</span>
            <Link href="/precios" className="text-secondary/60 hover:text-primary transition-colors">Tarifas orientativas</Link>
            <span className="text-secondary/20">·</span>
            <Link href="/urgencias" className="text-secondary/60 hover:text-primary transition-colors">Urgencias 24h</Link>
            <span className="text-secondary/20">·</span>
            <Link href="/sobre-maxi" className="text-secondary/60 hover:text-primary transition-colors">Sobre Maxi</Link>
          </nav>
        </div>
      </section>

    </>
  )
}
