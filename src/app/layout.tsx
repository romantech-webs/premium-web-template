import { headers } from "next/headers"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getClinicConfig } from "@/config/load-config"
import { ClinicProvider } from "@/config/clinic-context"
import { generateLocalBusinessSchema, generateFAQSchema } from "@/lib/schema"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { WhatsAppWidget } from "@/components/layout/WhatsAppWidget"
import "./globals.css"

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
  if (!result) return { title: "No encontrado" }
  const { slug, config } = result
  const baseUrl = `https://${slug}.romantechwebs.com`

  return {
    title: {
      template: config.seo.titleTemplate,
      default: config.seo.defaultTitle,
    },
    description: config.seo.defaultDescription,
    keywords: config.seo.keywords,
    openGraph: {
      title: config.seo.defaultTitle,
      description: config.seo.defaultDescription,
      images: [`${baseUrl}/og-image.jpg`],
      locale: "es_ES",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: config.seo.defaultTitle,
      description: config.seo.defaultDescription,
      images: [`${baseUrl}/og-image.jpg`],
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const result = await getSlugAndConfig()
  if (!result) return notFound()
  const { slug, config } = result
  const baseUrl = `https://${slug}.romantechwebs.com`
  const widgetApiUrl = config._meta?.widgetApiUrl || process.env.WIDGET_API_URL || ""
  const projectId = config._meta?.projectId || ""
  // Sanitize for safe inline script interpolation
  const safeApiUrl = JSON.stringify(widgetApiUrl).slice(1, -1)
  const safePid = JSON.stringify(projectId).slice(1, -1)
  const safeGa4Id = config.tracking?.ga4Id ? JSON.stringify(config.tracking.ga4Id).slice(1, -1) : ""

  return (
    <html lang="es">
      <head>
        {/* Dynamic CSS variables from config */}
        <style
          dangerouslySetInnerHTML={{
            __html: `:root {
              --color-primary: ${config.colors.primary};
              --color-secondary: ${config.colors.secondary};
              --color-accent: ${config.colors.accent};
              --color-neutral: ${config.colors.neutral};
            }`,
          }}
        />
        {/* Schema.org JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateLocalBusinessSchema(config, baseUrl)),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateFAQSchema(config)),
          }}
        />
        {/* Widget globals + script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__WIDGET_API_URL="${safeApiUrl}";window.__PROJECT_ID="${safePid}";`,
          }}
        />
        {widgetApiUrl && (
          <script
            src={`${widgetApiUrl}/widget.js`}
            data-project-name={config.name}
            data-api-url={widgetApiUrl}
            data-project-id={projectId}
            data-primary-color={config.colors.primary}
            defer
          />
        )}
        {/* Tracking beacon */}
        {widgetApiUrl && projectId && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){var sid=Math.random().toString(36).slice(2);var api="${safeApiUrl}/api/widget/track";var pid="${safePid}";function t(e){fetch(api,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({projectId:pid,event:e,sessionId:sid}),keepalive:true}).catch(function(){});}t("page_view");var scrolled=false;window.addEventListener("scroll",function(){if(!scrolled&&window.scrollY/(document.body.scrollHeight-window.innerHeight)>0.5){scrolled=true;t("scroll_50");}});document.addEventListener("click",function(e){if(e.target.closest("a[href^='tel:'],a[href^='mailto:'],button")){t("cta_click");}});})();`,
            }}
          />
        )}
        {/* GA4 */}
        {config.tracking?.ga4Id && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${config.tracking.ga4Id}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${safeGa4Id}');`,
              }}
            />
          </>
        )}
      </head>
      <body className="font-sans overflow-x-hidden">
        <ClinicProvider config={config}>
          <Header />
          <main>{children}</main>
          <Footer />
          <WhatsAppWidget />
        </ClinicProvider>
      </body>
    </html>
  )
}
