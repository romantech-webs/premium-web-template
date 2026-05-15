import { headers } from "next/headers"
import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { getClinicConfig, getBaseUrl } from "@/config/load-config"
import { generateBreadcrumbSchema } from "@/lib/schema"
import { Phone, MapPin, Star, Clock, CheckCircle2, Shield, Wrench, ChevronRight, MessageCircle, Euro } from "lucide-react"

const RESERVED_SLUGS = new Set([
  "aviso-legal", "privacidad", "cookies", "contacto", "reservar",
  "admin", "servicios", "api", "_next", "favicon.ico", "robots.txt",
  "sitemap.xml", "og-image.jpg",
])

async function getSlugAndPage(slug: string) {
  if (RESERVED_SLUGS.has(slug)) return null
  const h = await headers()
  const clinicSlug = h.get("x-clinic-slug")
  if (!clinicSlug) return null
  const config = await getClinicConfig(clinicSlug)
  if (!config) return null
  const page = config.pages?.[slug]
  if (!page) return null
  return { clinicSlug, config, page, slug }
}

function pageIcon(slug: string) {
  if (slug.startsWith("fontanero-")) return MapPin
  if (slug === "urgencias" || slug === "urgencias-24h") return Clock
  if (slug === "precios" || slug === "tarifas") return Euro
  if (slug.startsWith("sobre")) return Shield
  return CheckCircle2
}

/**
 * Try to pull the first price chip out of a free-text body — patterns like
 * "40-100 €", "desde 850 €", "150 €/hora", "60-150 €".
 * Falls back to null when nothing matches.
 */
function extractPriceChip(text: string): string | null {
  const patterns = [
    /(\d{1,4}\s*[–-]\s*\d{1,4})\s*€/,
    /desde\s*(\d{1,4})\s*€/i,
    /(\d{1,4}\s*€\s*\/\s*\w+)/i,
    /(\d{1,4})\s*€/,
  ]
  for (const re of patterns) {
    const m = text.match(re)
    if (m) return m[0].replace(/\s+/g, " ").replace(/\s*–\s*|\s*-\s*/, "–")
  }
  return null
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params
  const result = await getSlugAndPage(slug)
  if (!result) return { title: "No encontrado" }
  const { config, page } = result
  const baseUrl = getBaseUrl(result.clinicSlug, config)
  return {
    title: { absolute: page.title },
    description: page.metaDescription,
    alternates: { canonical: `${baseUrl}/${slug}` },
    openGraph: {
      title: page.title,
      description: page.metaDescription,
      url: `${baseUrl}/${slug}`,
      locale: "es_ES",
      type: "article",
      images: [`${baseUrl}/og-image.jpg`],
    },
  }
}

export default async function CustomPagePage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const result = await getSlugAndPage(slug)
  if (!result) return notFound()
  const { config, page } = result
  const baseUrl = getBaseUrl(result.clinicSlug, config)
  const whatsappUrl = `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(config.whatsappMessage)}`
  const phoneClean = config.phone.replace(/\s/g, "")
  const Icon = pageIcon(slug)
  const isLocation = slug.startsWith("fontanero-")
  const locationName = isLocation ? slug.replace(/^fontanero-/, "").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : null

  const testimonialText = typeof page.testimonial === "string" ? page.testimonial : page.testimonial?.text
  const testimonialAuthor = typeof page.testimonial === "string" ? null : page.testimonial?.author
  const testimonialRating = typeof page.testimonial === "string" ? 5 : (page.testimonial?.rating ?? 5)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbSchema(baseUrl, [
            { name: "Inicio", path: "/" },
            { name: page.h1, path: `/${slug}` },
          ])),
        }}
      />

      {/* Hero band */}
      <section className="relative pt-32 pb-12 bg-gradient-to-br from-neutral via-white to-primary/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/[0.04] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/[0.05] rounded-full blur-[100px] translate-y-1/3" />

        <div className="container max-w-5xl mx-auto px-4 relative">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-secondary/50 mb-8">
            <Link href="/" className="hover:text-primary transition-colors">Inicio</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-secondary font-medium">{page.h1}</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-6">
            <div className="flex-1">
              {/* Page badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full mb-5">
                <Icon className="w-3.5 h-3.5" />
                {isLocation ? `Zona de servicio · ${locationName}` : slug === "urgencias" || slug === "urgencias-24h" ? "Servicio urgente · 610 89 30 04" : slug === "precios" ? "Tarifas orientativas 2026" : "Sobre nuestro servicio"}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-secondary leading-[1.05] mb-5 text-balance">
                {page.h1}
              </h1>

              {page.intro && (
                <p className="text-lg sm:text-xl text-secondary/70 leading-relaxed max-w-3xl whitespace-pre-line">
                  {page.intro}
                </p>
              )}
            </div>

            {/* Inline mini-CTA on desktop */}
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
            <div className="flex items-center gap-2.5 text-secondary/70">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400 shrink-0" />
              <div className="text-xs sm:text-sm">
                <div className="font-bold text-secondary">{config.reviews.rating} · {config.reviews.count} reseñas</div>
                <div className="text-secondary/50 text-[11px]">Google</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-secondary/70">
              <Shield className="w-5 h-5 text-primary shrink-0" />
              <div className="text-xs sm:text-sm">
                <div className="font-bold text-secondary">Autónomo profesional</div>
                <div className="text-secondary/50 text-[11px]">Factura · garantía</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-secondary/70">
              <Clock className="w-5 h-5 text-accent shrink-0" />
              <div className="text-xs sm:text-sm">
                <div className="font-bold text-secondary">Atención el mismo día</div>
                <div className="text-secondary/50 text-[11px]">Disponibilidad urgencias</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-secondary/70">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <div className="text-xs sm:text-sm">
                <div className="font-bold text-secondary">Presupuesto cerrado</div>
                <div className="text-secondary/50 text-[11px]">Sin sorpresas</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <article className="py-14 bg-white">
        <div className="container max-w-3xl mx-auto px-4">

          {/* Unique angle (highlighted) */}
          {page.uniqueAngle && (
            <section className="mb-12 p-6 sm:p-7 bg-gradient-to-br from-accent/[0.08] via-accent/[0.05] to-transparent rounded-2xl border-l-4 border-l-accent">
              <div className="flex gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-accent" />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-accent pt-1.5">
                  {isLocation ? `Particularidades de ${locationName}` : "Lo que diferencia este servicio"}
                </h2>
              </div>
              <p className="text-base sm:text-lg text-secondary/85 leading-relaxed whitespace-pre-line pl-11">
                {page.uniqueAngle}
              </p>
            </section>
          )}

          {/* Services as cards */}
          {page.services && page.services.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-secondary mb-6">
                {isLocation ? `Servicios más demandados en ${locationName}` : "Servicios incluidos"}
              </h2>
              <ul className="grid sm:grid-cols-2 gap-3">
                {page.services.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 p-4 bg-neutral rounded-xl border border-secondary/5 hover:border-primary/30 hover:shadow-md transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Wrench className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-secondary/85 pt-1 text-sm sm:text-base">{s}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Sections — as price cards on /precios, plain prose elsewhere */}
          {slug === "precios" || slug === "tarifas" ? (
            page.sections && page.sections.length > 0 && (
              <section className="mb-12 not-prose">
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-secondary mb-6">
                  Tarifas orientativas
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {page.sections.map((section, i) => {
                    const price = extractPriceChip(section.body)
                    return (
                      <article
                        key={i}
                        className="group p-5 sm:p-6 bg-white rounded-2xl border border-secondary/10 hover:border-primary/30 hover:shadow-lg transition-all flex flex-col"
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <h3 className="text-lg sm:text-xl font-display font-bold text-secondary leading-tight">
                            {section.heading}
                          </h3>
                          {price && (
                            <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-sm font-bold rounded-lg whitespace-nowrap">
                              {price}
                            </span>
                          )}
                        </div>
                        <p className="text-secondary/75 text-sm leading-relaxed flex-1 whitespace-pre-line">
                          {section.body}
                        </p>
                      </article>
                    )
                  })}
                </div>
                <p className="mt-6 text-sm text-secondary/55 italic">
                  Precios orientativos sujetos a diagnóstico in situ. Antes de empezar siempre cierras un presupuesto en firme — sin sorpresas al final.
                </p>
              </section>
            )
          ) : (
            page.sections?.map((section, i) => (
              <section key={i} className="mb-12">
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-secondary mb-5">
                  {section.heading}
                </h2>
                <div className="text-secondary/80 leading-relaxed whitespace-pre-line text-base sm:text-lg">
                  {section.body}
                </div>
              </section>
            ))
          )}

          {/* Testimonial */}
          {testimonialText && (
            <section className="mb-12 p-6 sm:p-8 bg-secondary text-white rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
              <div className="relative">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: testimonialRating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <blockquote className="text-lg sm:text-xl leading-relaxed font-display italic mb-3">
                  &ldquo;{testimonialText}&rdquo;
                </blockquote>
                {testimonialAuthor && (
                  <footer className="text-sm font-semibold opacity-80">— {testimonialAuthor}</footer>
                )}
              </div>
            </section>
          )}

          {/* FAQ */}
          {page.faq && page.faq.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-secondary mb-6">
                Preguntas frecuentes
              </h2>
              <div className="space-y-3">
                {page.faq.map((item, i) => (
                  <details key={i} className="group bg-neutral rounded-xl border border-secondary/5 overflow-hidden">
                    <summary className="font-semibold text-secondary cursor-pointer text-base sm:text-lg list-none p-5 flex items-center justify-between gap-4 hover:bg-secondary/[0.02]">
                      <span className="flex-1">{item.question}</span>
                      <ChevronRight className="w-4 h-4 text-primary shrink-0 transition-transform group-open:rotate-90" />
                    </summary>
                    <div className="px-5 pb-5 text-secondary/75 leading-relaxed">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* Final CTA */}
          <section className="mt-16 p-7 sm:p-10 bg-gradient-to-br from-secondary via-secondary to-primary text-white rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/40 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-accent/30 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
            <div className="relative">
              <div className="inline-block px-3 py-1 bg-accent text-white text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                Atención inmediata
              </div>
              <h2 className="text-3xl sm:text-4xl font-display font-bold mb-3 leading-tight">
                {page.cta?.label || (isLocation ? `¿Necesitas un fontanero en ${locationName} hoy?` : config.ctaHeadline)}
              </h2>
              <p className="opacity-90 mb-7 text-base sm:text-lg max-w-2xl">
                {page.cta?.description || (isLocation ? `Llama al ${config.phone}. Atendemos urgencias en ${locationName} y comarca el mismo día. Presupuesto cerrado, sin compromiso.` : config.ctaDescription)}
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
          </section>

          {/* Related links footer */}
          <nav className="mt-12 pt-8 border-t border-secondary/10 flex flex-wrap gap-3 text-sm">
            <Link href="/" className="text-secondary/60 hover:text-primary transition-colors">← Volver al inicio</Link>
            <span className="text-secondary/20">·</span>
            <Link href="/precios" className="text-secondary/60 hover:text-primary transition-colors">Tarifas orientativas</Link>
            <span className="text-secondary/20">·</span>
            <Link href="/urgencias" className="text-secondary/60 hover:text-primary transition-colors">Urgencias 24h</Link>
            <span className="text-secondary/20">·</span>
            <Link href="/sobre-maxi" className="text-secondary/60 hover:text-primary transition-colors">Sobre Maxi</Link>
          </nav>
        </div>
      </article>
    </>
  )
}
