import { headers } from "next/headers"
import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { getClinicConfig, getBaseUrl } from "@/config/load-config"
import { generateBreadcrumbSchema } from "@/lib/schema"
import { Phone } from "lucide-react"

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
      <article className="pt-32 pb-16">
        <div className="container max-w-4xl mx-auto px-4">
          <nav aria-label="Breadcrumb" className="text-sm text-secondary/60 mb-6">
            <Link href="/" className="hover:text-primary">Inicio</Link>
            <span className="mx-2">·</span>
            <span className="text-secondary">{page.h1}</span>
          </nav>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-secondary leading-tight mb-6">
            {page.h1}
          </h1>

          {page.intro && (
            <p className="text-lg sm:text-xl text-secondary/70 leading-relaxed mb-8">
              {page.intro}
            </p>
          )}

          {page.testimonial && (
            <blockquote className="my-8 p-5 bg-neutral rounded-xl border-l-4 border-l-primary">
              <p className="text-base text-secondary/80 italic leading-relaxed">
                &ldquo;{page.testimonial.text}&rdquo;
              </p>
              <footer className="mt-2 text-sm font-semibold text-secondary">
                — {page.testimonial.author}
              </footer>
            </blockquote>
          )}

          {page.services && page.services.length > 0 && (
            <section className="my-10">
              <h2 className="text-2xl font-display font-bold text-secondary mb-4">Servicios más demandados</h2>
              <ul className="grid sm:grid-cols-2 gap-3">
                {page.services.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-secondary/80">
                    <span className="text-primary mt-1">✓</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {page.sections?.map((section, i) => (
            <section key={i} className="my-10">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-secondary mb-4">
                {section.heading}
              </h2>
              <div className="prose prose-lg max-w-none text-secondary/80 leading-relaxed whitespace-pre-line">
                {section.body}
              </div>
            </section>
          ))}

          {page.faq && page.faq.length > 0 && (
            <section className="my-12">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-secondary mb-6">
                Preguntas frecuentes
              </h2>
              <div className="space-y-4">
                {page.faq.map((item, i) => (
                  <details key={i} className="bg-neutral rounded-xl p-5 group">
                    <summary className="font-semibold text-secondary cursor-pointer text-lg group-open:mb-3">
                      {item.question}
                    </summary>
                    <p className="text-secondary/70 leading-relaxed">{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          <section className="my-12 p-6 sm:p-8 bg-gradient-to-br from-primary to-secondary text-white rounded-2xl">
            <h2 className="text-2xl sm:text-3xl font-display font-bold mb-3">
              {page.cta?.label || config.ctaHeadline}
            </h2>
            {page.cta?.description && <p className="opacity-90 mb-6">{page.cta.description}</p>}
            <div className="flex flex-wrap gap-3">
              <a
                href={`tel:${phoneClean}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-secondary font-semibold rounded-lg hover:bg-neutral transition-colors"
              >
                <Phone className="w-5 h-5" />
                {config.phone}
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white font-semibold rounded-lg hover:bg-[#1faa54] transition-colors"
              >
                WhatsApp
              </a>
            </div>
          </section>
        </div>
      </article>
    </>
  )
}
