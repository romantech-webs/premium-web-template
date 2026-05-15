import { headers } from "next/headers"
import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { getClinicConfig, getBaseUrl } from "@/config/load-config"
import { generateBreadcrumbSchema } from "@/lib/schema"
import { Phone, ChevronRight, Clock, Calendar, MessageCircle, BookOpen } from "lucide-react"

async function getPost(slug: string) {
  const h = await headers()
  const clinicSlug = h.get("x-clinic-slug")
  if (!clinicSlug) return null
  const config = await getClinicConfig(clinicSlug)
  if (!config) return null
  const post = config.blog?.posts?.[slug]
  if (!post) return null
  return { clinicSlug, config, post, slug }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params
  const result = await getPost(slug)
  if (!result) return { title: "No encontrado" }
  const { config, post } = result
  const baseUrl = getBaseUrl(result.clinicSlug, config)
  return {
    title: { absolute: post.title },
    description: post.metaDescription,
    alternates: { canonical: `${baseUrl}/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      url: `${baseUrl}/blog/${slug}`,
      locale: "es_ES",
      type: "article",
      publishedTime: post.publishedDate,
      modifiedTime: post.modifiedDate || post.publishedDate,
      images: [`${baseUrl}/og-image.jpg`],
    },
  }
}

function articleSchema(post: NonNullable<Awaited<ReturnType<typeof getPost>>>["post"], slug: string, baseUrl: string, authorName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${baseUrl}/blog/${slug}#article`,
    headline: post.h1,
    description: post.metaDescription,
    image: `${baseUrl}/og-image.jpg`,
    datePublished: post.publishedDate,
    dateModified: post.modifiedDate || post.publishedDate,
    author: { "@type": "Person", name: authorName },
    publisher: { "@id": `${baseUrl}/#business` },
    mainEntityOfPage: `${baseUrl}/blog/${slug}`,
    inLanguage: "es-ES",
  }
}

export default async function BlogPostPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const result = await getPost(slug)
  if (!result) return notFound()
  const { config, post } = result
  const baseUrl = getBaseUrl(result.clinicSlug, config)
  const whatsappUrl = `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(config.whatsappMessage)}`
  const phoneClean = config.phone.replace(/\s/g, "")
  const authorName = config.team?.[0]?.name || config.name
  const publishedDate = new Date(post.publishedDate).toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema(post, slug, baseUrl, authorName)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbSchema(baseUrl, [
            { name: "Inicio", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.h1, path: `/blog/${slug}` },
          ])),
        }}
      />

      <section className="relative pt-32 pb-12 bg-gradient-to-br from-neutral via-white to-primary/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/[0.04] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
        <div className="container max-w-3xl mx-auto px-4 relative">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-secondary/50 mb-6 flex-wrap">
            <Link href="/" className="hover:text-primary transition-colors">Inicio</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-secondary font-medium line-clamp-1">{post.h1}</span>
          </nav>

          {post.category && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full mb-4">
              <BookOpen className="w-3.5 h-3.5" />
              {post.category}
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-secondary leading-[1.1] mb-5 text-balance">
            {post.h1}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-secondary/55 pb-2">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {publishedDate}
            </span>
            {post.readingTime && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {post.readingTime}
              </span>
            )}
            <span className="text-secondary/40">·</span>
            <span>Por <strong className="text-secondary/80">{authorName}</strong></span>
          </div>
        </div>
      </section>

      <article className="py-12 bg-white">
        <div className="container max-w-3xl mx-auto px-4">
          {post.intro && (
            <p className="text-lg sm:text-xl text-secondary/85 leading-relaxed mb-10 first-letter:text-4xl first-letter:font-display first-letter:font-bold first-letter:text-primary first-letter:mr-1 first-letter:float-left first-letter:leading-none">
              {post.intro}
            </p>
          )}

          {post.sections.map((section, i) => (
            <section key={i} className="mb-10">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-secondary mb-4 mt-8">
                {section.heading}
              </h2>
              <div className="text-secondary/85 leading-relaxed whitespace-pre-line text-base sm:text-lg">
                {section.body}
              </div>
            </section>
          ))}

          {post.faq && post.faq.length > 0 && (
            <section className="mt-14 mb-10">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-secondary mb-6">
                Preguntas frecuentes
              </h2>
              <div className="space-y-3">
                {post.faq.map((item, i) => {
                  const q = item.question || item.q
                  const a = item.answer || item.a
                  if (!q || !a) return null
                  return (
                    <details key={i} open={i === 0} className="group bg-neutral rounded-xl border border-secondary/5 overflow-hidden hover:border-primary/20 transition-colors">
                      <summary className="font-semibold text-secondary cursor-pointer text-base sm:text-lg list-none p-5 flex items-center justify-between gap-4 hover:bg-secondary/[0.02]">
                        <span className="flex-1">{q}</span>
                        <ChevronRight className="w-4 h-4 text-primary shrink-0 transition-transform group-open:rotate-90" />
                      </summary>
                      <div className="px-5 pb-5 text-secondary/75 leading-relaxed">{a}</div>
                    </details>
                  )
                })}
              </div>
            </section>
          )}

          {post.internalLinks && post.internalLinks.length > 0 && (
            <aside className="mt-14 p-6 bg-neutral rounded-2xl border-l-4 border-l-primary">
              <h3 className="text-sm uppercase tracking-wider font-bold text-primary mb-3">Sigue leyendo</h3>
              <ul className="space-y-2">
                {post.internalLinks.map((href, i) => (
                  <li key={i}>
                    <Link href={href} className="inline-flex items-center gap-1.5 text-secondary hover:text-primary font-medium">
                      <ChevronRight className="w-4 h-4" />
                      {href.replace(/^\//, "").replace(/-/g, " ").replace(/\//g, " · ")}
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          )}

          <section className="mt-14 p-7 sm:p-10 bg-gradient-to-br from-secondary via-secondary to-primary text-white rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/40 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
            <div className="relative">
              <div className="inline-block px-3 py-1 bg-accent text-white text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                ¿Te puedo ayudar?
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold mb-3 leading-tight">
                {post.callToAction ? post.callToAction.split(".")[0] + "." : `¿Necesitas un fontanero en ${config.address.city}?`}
              </h2>
              {post.callToAction && post.callToAction.split(".").length > 1 && (
                <p className="opacity-90 mb-6 text-base sm:text-lg">
                  {post.callToAction.split(".").slice(1).join(".").trim()}
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                <a href={`tel:${phoneClean}`} className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-secondary font-bold rounded-xl hover:bg-neutral shadow-xl transition-all">
                  <Phone className="w-5 h-5" />
                  {config.phone}
                </a>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#25D366] text-white font-bold rounded-xl hover:bg-[#1faa54] shadow-xl transition-all">
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </a>
              </div>
            </div>
          </section>

          <nav className="mt-10 pt-8 border-t border-secondary/10 flex flex-wrap gap-3 text-sm">
            <Link href="/blog" className="text-secondary/60 hover:text-primary transition-colors">← Volver al blog</Link>
            <span className="text-secondary/20">·</span>
            <Link href="/precios" className="text-secondary/60 hover:text-primary transition-colors">Tarifas</Link>
            <span className="text-secondary/20">·</span>
            <Link href="/urgencias" className="text-secondary/60 hover:text-primary transition-colors">Urgencias</Link>
          </nav>
        </div>
      </article>
    </>
  )
}
