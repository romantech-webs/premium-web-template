import { headers } from "next/headers"
import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { getClinicConfig, getBaseUrl } from "@/config/load-config"
import { generateBreadcrumbSchema } from "@/lib/schema"
import { Phone, ChevronRight, Clock, BookOpen } from "lucide-react"

async function getSlugAndConfig() {
  const h = await headers()
  const slug = h.get("x-clinic-slug")
  if (!slug) return null
  const config = await getClinicConfig(slug)
  if (!config) return null
  return { slug, config }
}

export async function generateMetadata(): Promise<Metadata> {
  const result = await getSlugAndConfig()
  if (!result) return { title: "Blog" }
  const { slug, config } = result
  const baseUrl = getBaseUrl(slug, config)
  return {
    title: { absolute: `Blog · ${config.name}` },
    description: `Guías, precios y consejos prácticos de ${config.specialty.toLowerCase()} en ${config.address.city}.`,
    alternates: { canonical: `${baseUrl}/blog` },
  }
}

export default async function BlogIndexPage() {
  const result = await getSlugAndConfig()
  if (!result) return notFound()
  const { config } = result
  const posts = config.blog?.posts || {}
  const entries = Object.entries(posts).sort(
    (a, b) => (b[1].publishedDate || "").localeCompare(a[1].publishedDate || ""),
  )

  if (entries.length === 0) return notFound()

  const whatsappUrl = `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(config.whatsappMessage)}`
  const phoneClean = config.phone.replace(/\s/g, "")
  const baseUrl = getBaseUrl(result.slug, config)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateBreadcrumbSchema(baseUrl, [
              { name: "Inicio", path: "/" },
              { name: "Blog", path: "/blog" },
            ]),
          ),
        }}
      />
      <section className="relative pt-32 pb-12 bg-gradient-to-br from-neutral via-white to-primary/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/[0.04] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
        <div className="container max-w-5xl mx-auto px-4 relative">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-secondary/50 mb-8">
            <Link href="/" className="hover:text-primary transition-colors">Inicio</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-secondary font-medium">Blog</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full mb-5">
            <BookOpen className="w-3.5 h-3.5" />
            Guías y consejos
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-secondary leading-[1.05] mb-5 text-balance">
            Blog de {config.name}
          </h1>
          <p className="text-lg sm:text-xl text-secondary/70 leading-relaxed max-w-3xl">
            Consejos prácticos de {config.specialty.toLowerCase()} escritos por {config.team?.[0]?.name || config.name}. Información clara, sin tecnicismos vacíos, para ayudarte a decidir.
          </p>
        </div>
      </section>

      <section className="py-14 bg-white">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {entries.map(([slug, post]) => (
              <Link
                key={slug}
                href={`/blog/${slug}`}
                className="group flex flex-col p-6 bg-white rounded-2xl border border-secondary/10 hover:border-primary/30 hover:shadow-xl transition-all"
              >
                {post.category && (
                  <span className="inline-block self-start px-2.5 py-1 bg-accent/10 text-accent text-[11px] font-bold uppercase tracking-wider rounded-md mb-3">
                    {post.category}
                  </span>
                )}
                <h2 className="text-lg sm:text-xl font-display font-bold text-secondary leading-snug mb-2 group-hover:text-primary transition-colors">
                  {post.h1}
                </h2>
                <p className="text-secondary/65 text-sm leading-relaxed flex-1 mb-4">
                  {post.metaDescription.length > 130 ? post.metaDescription.slice(0, 130) + "…" : post.metaDescription}
                </p>
                <div className="flex items-center justify-between text-xs text-secondary/45 mt-auto pt-3 border-t border-secondary/5">
                  {post.readingTime && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readingTime}
                    </span>
                  )}
                  <span className="text-primary font-semibold group-hover:translate-x-1 transition-transform">
                    Leer →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-16 p-7 sm:p-10 bg-gradient-to-br from-secondary via-secondary to-primary text-white rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/40 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-display font-bold mb-3">
                ¿Prefieres que te atendamos directamente?
              </h2>
              <p className="opacity-90 mb-6">
                Las guías están para leerlas con calma. Si quieres una cita, llámanos: {config.phone}.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href={`tel:${phoneClean}`} className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-secondary font-bold rounded-xl hover:bg-neutral shadow-xl transition-all">
                  <Phone className="w-5 h-5" />
                  {config.phone}
                </a>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#25D366] text-white font-bold rounded-xl hover:bg-[#1faa54] shadow-xl transition-all">
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
